import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { contrato_id } = await req.json()

    if (!contrato_id) {
      throw new Error('contrato_id is required')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Buscar todos os check-ins do contrato
    const { data: checkins, error: checkinsError } = await supabase
      .from('checkins_operacionais')
      .select('*')
      .eq('contrato_id', contrato_id)
      .order('data_hora', { ascending: true })

    if (checkinsError) throw checkinsError

    // Calcular horas trabalhadas baseando-se nos checkins
    let total_horas = 0
    let entrada: Date | null = null

    for (const checkin of checkins || []) {
      if (checkin.tipo === 'Entrada') {
        entrada = new Date(checkin.data_hora!)
      } else if (checkin.tipo === 'Saida' && entrada) {
        const saida = new Date(checkin.data_hora!)
        const diffMs = saida.getTime() - entrada.getTime()
        total_horas += diffMs / (1000 * 60 * 60)
        entrada = null
      }
    }

    // Arredondar para 2 casas decimais
    total_horas = Math.round(total_horas * 100) / 100

    // Buscar dados do contrato
    const { data: contrato, error: contratoError } = await supabase
      .from('contratos')
      .select('*, freelancers(taxa_hora), vagas(valor_remuneracao)')
      .eq('id', contrato_id)
      .single()

    if (contratoError) throw contratoError

    const taxaFreelancer =
      contrato.freelancers &&
      typeof contrato.freelancers === 'object' &&
      'taxa_hora' in contrato.freelancers
        ? contrato.freelancers.taxa_hora
        : 0
    const valorRemuneracaoVaga =
      contrato.vagas && typeof contrato.vagas === 'object' && 'valor_remuneracao' in contrato.vagas
        ? contrato.vagas.valor_remuneracao
        : 0

    const valor_hora = taxaFreelancer || valorRemuneracaoVaga || 0
    const subtotal = total_horas * valor_hora

    const descontos = contrato.penalidade_aplicada ? subtotal * 0.1 : 0
    const valor_final = subtotal - descontos

    // Salvar na tabela pagamentos
    const { error: upsertError } = await supabase.from('pagamentos').upsert(
      {
        contrato_id,
        total_horas,
        valor_hora,
        subtotal,
        descontos,
        valor_final,
        data_calculo: new Date().toISOString(),
      },
      { onConflict: 'contrato_id' },
    )

    if (upsertError) throw upsertError

    return new Response(
      JSON.stringify({
        success: true,
        data: { contrato_id, total_horas, valor_hora, subtotal, descontos, valor_final },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error: any) {
    console.error('Erro na Edge Function calcular-pagamento:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
