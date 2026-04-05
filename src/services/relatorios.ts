import { supabase } from '@/lib/supabase/client'

export interface RelatorioHora {
  contrato_id: string
  freelancer_nome: string
  vaga_titulo: string
  data_evento: string | null
  entrada: string | null
  saida: string | null
  totalHoras: number
  status: string
}

export const fetchRelatorioHoras = async (): Promise<{
  data: RelatorioHora[] | null
  error: any
}> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { data: null, error: new Error('User not found') }

    const { data: userProfile } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .single()
    const isAdmin = userProfile?.user_type === 'admin'

    const { data: empresa } = await supabase
      .from('empresas')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    let query = supabase.from('contratos').select(`
        id,
        vaga:vagas(titulo, data_inicio),
        freelancer:freelancers(id, nome_completo)
      `)

    if (!isAdmin && empresa) {
      query = query.eq('empresa_id', empresa.id)
    } else if (!isAdmin && !empresa) {
      const { data: freela } = await supabase
        .from('freelancers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()
      if (freela) {
        query = query.eq('freelancer_id', freela.id)
      } else {
        return { data: [], error: null }
      }
    }

    const { data: contratos, error: contratosError } = await query
    if (contratosError) throw contratosError

    if (!contratos || contratos.length === 0) return { data: [], error: null }

    const contratoIds = contratos.map((c) => c.id)

    const { data: checkins, error: checkinsError } = await supabase
      .from('checkins_operacionais')
      .select('*')
      .in('contrato_id', contratoIds)
      .order('data_hora', { ascending: true })

    if (checkinsError) throw checkinsError

    const relatorio: RelatorioHora[] = contratos.map((contrato) => {
      const contratoCheckins = (checkins || []).filter((c) => c.contrato_id === contrato.id)
      const entrada = contratoCheckins.find((c) => c.tipo === 'Entrada')?.data_hora || null
      const saida = contratoCheckins.find((c) => c.tipo === 'Saída')?.data_hora || null

      let totalHoras = 0
      let status = 'Incompleto'

      if (entrada && saida) {
        const ms = new Date(saida).getTime() - new Date(entrada).getTime()
        totalHoras = Math.max(0, ms / (1000 * 60 * 60))
        status = 'Completo'
      } else if (entrada) {
        status = 'Em Andamento'
      }

      // @ts-expect-error
      const freelancer_nome = contrato.freelancer?.nome_completo || 'Desconhecido'
      // @ts-expect-error
      const vaga_titulo = contrato.vaga?.titulo || 'Vaga'
      // @ts-expect-error
      const data_evento = contrato.vaga?.data_inicio || entrada || null

      return {
        contrato_id: contrato.id,
        freelancer_nome,
        vaga_titulo,
        data_evento,
        entrada,
        saida,
        totalHoras,
        status,
      }
    })

    return { data: relatorio, error: null }
  } catch (error) {
    return { data: null, error }
  }
}
