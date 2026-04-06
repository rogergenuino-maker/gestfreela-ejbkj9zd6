import { supabase } from '@/lib/supabase/client'

export interface MetricsData {
  totalContratos: number
  contratosAtivos: number
  contratosCancelados: number
  contratosConcluidos: number
  totalFreelancers: number
  freelancersAprovados: number
  freelancersPendentes: number
  totalEmpresas: number
  receitaTotal: number
  taxaConclusao: number
  avaliacaoMedia: number
  denunciasPendentes: number
  revenueByDate: { date: string; revenue: number }[]
  contractsByStatus: { name: string; value: number; fill: string }[]
  usersByDate: { date: string; freelancers: number; empresas: number }[]
}

export const getMetricsData = async (startDate: Date, endDate: Date): Promise<MetricsData> => {
  const startStr = startDate.toISOString()
  // Adiciona 1 dia ao endDate para garantir que pegue os registros até o final do dia
  const endPlusOne = new Date(endDate)
  endPlusOne.setDate(endPlusOne.getDate() + 1)
  const endStr = endPlusOne.toISOString()

  // Contratos
  const { data: contratos } = await supabase
    .from('contratos')
    .select('id, status, created_at')
    .gte('created_at', startStr)
    .lt('created_at', endStr)

  const ativos = contratos?.filter((c) => c.status === 'ativo').length || 0
  const cancelados = contratos?.filter((c) => c.status === 'cancelado').length || 0
  const concluidos =
    contratos?.filter((c) => c.status === 'concluido' || c.status === 'concluído').length || 0
  const totalContratos = contratos?.length || 0

  // Freelancers
  const { data: freelancers } = await supabase
    .from('freelancers')
    .select('id, created_at')
    .gte('created_at', startStr)
    .lt('created_at', endStr)

  const totalFreelancers = freelancers?.length || 0

  // Documentos Validacao (para saber aprovados)
  const { data: docs } = await supabase
    .from('documentos_validacao')
    .select('freelancer_id, status_verificacao')

  const approvedIds = new Set(
    docs
      ?.filter((d) => d.status_verificacao?.toLowerCase() === 'aprovado')
      .map((d) => d.freelancer_id),
  )

  const freelancersAprovados = freelancers?.filter((f) => approvedIds.has(f.id)).length || 0
  const freelancersPendentes = totalFreelancers - freelancersAprovados

  // Empresas
  const { data: empresas } = await supabase
    .from('empresas')
    .select('id, created_at')
    .gte('created_at', startStr)
    .lt('created_at', endStr)
  const totalEmpresas = empresas?.length || 0

  // Receita
  const { data: pagamentos } = await supabase
    .from('pagamentos_processados')
    .select('valor_pago, data_pagamento')
    .gte('data_pagamento', startStr)
    .lt('data_pagamento', endStr)

  const receitaTotal =
    pagamentos?.reduce((acc, curr) => acc + (Number(curr.valor_pago) || 0), 0) || 0

  // Agrupar receita por data
  const revenueMap = new Map<string, number>()
  pagamentos?.forEach((p) => {
    const date = new Date(p.data_pagamento).toLocaleDateString('pt-BR')
    revenueMap.set(date, (revenueMap.get(date) || 0) + Number(p.valor_pago))
  })

  const revenueByDate = Array.from(revenueMap.entries())
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => {
      const [d1, m1, y1] = a.date.split('/')
      const [d2, m2, y2] = b.date.split('/')
      return new Date(`${y1}-${m1}-${d1}`).getTime() - new Date(`${y2}-${m2}-${d2}`).getTime()
    })

  // Usuários por data
  const usersMap = new Map<string, { freelancers: number; empresas: number }>()
  freelancers?.forEach((f) => {
    const date = new Date(f.created_at).toLocaleDateString('pt-BR')
    const current = usersMap.get(date) || { freelancers: 0, empresas: 0 }
    usersMap.set(date, { ...current, freelancers: current.freelancers + 1 })
  })
  empresas?.forEach((e) => {
    const date = new Date(e.created_at).toLocaleDateString('pt-BR')
    const current = usersMap.get(date) || { freelancers: 0, empresas: 0 }
    usersMap.set(date, { ...current, empresas: current.empresas + 1 })
  })
  const usersByDate = Array.from(usersMap.entries())
    .map(([date, counts]) => ({ date, ...counts }))
    .sort((a, b) => {
      const [d1, m1, y1] = a.date.split('/')
      const [d2, m2, y2] = b.date.split('/')
      return new Date(`${y1}-${m1}-${d1}`).getTime() - new Date(`${y2}-${m2}-${d2}`).getTime()
    })

  // Taxa de Conclusão
  const taxaConclusao = totalContratos > 0 ? (concluidos / totalContratos) * 100 : 0

  // Avaliação Média
  const { data: avaliacoes } = await supabase
    .from('avaliacoes_rating')
    .select('nota_estrelas')
    .gte('created_at', startStr)
    .lt('created_at', endStr)

  const avaliacaoMedia = avaliacoes?.length
    ? avaliacoes.reduce((acc, curr) => acc + (curr.nota_estrelas || 0), 0) / avaliacoes.length
    : 0

  // Denúncias
  const { data: denuncias } = await supabase
    .from('denuncias')
    .select('id')
    .gte('data_denuncia', startStr)
    .lt('data_denuncia', endStr)
  const denunciasPendentes = denuncias?.length || 0

  const contractsByStatus = [
    { name: 'Ativos', value: ativos, fill: 'var(--color-ativos)' },
    { name: 'Concluídos', value: concluidos, fill: 'var(--color-concluidos)' },
    { name: 'Cancelados', value: cancelados, fill: 'var(--color-cancelados)' },
  ]

  return {
    totalContratos,
    contratosAtivos: ativos,
    contratosCancelados: cancelados,
    contratosConcluidos: concluidos,
    totalFreelancers,
    freelancersAprovados,
    freelancersPendentes,
    totalEmpresas,
    receitaTotal,
    taxaConclusao,
    avaliacaoMedia,
    denunciasPendentes,
    revenueByDate,
    contractsByStatus,
    usersByDate,
  }
}
