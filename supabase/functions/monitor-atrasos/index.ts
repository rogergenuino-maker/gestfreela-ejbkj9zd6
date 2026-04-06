import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables for Supabase.')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const now = new Date()
    // 15 minutos atrás (tolerância para o check-in)
    const fifteenMinsAgo = new Date(now.getTime() - 15 * 60 * 1000)
    // 60 minutos atrás (limite para não alertar sobre contratos muito antigos)
    const sixtyMinsAgo = new Date(now.getTime() - 60 * 60 * 1000)

    // Busca contratos ativos com vagas que iniciaram entre 60 e 15 minutos atrás
    const { data: contratos, error: contratosError } = await supabase
      .from('contratos')
      .select(`
        id,
        freelancer_id,
        empresa_id,
        status,
        freelancers!inner(nome_completo),
        vagas!inner(data_inicio)
      `)
      .eq('status', 'ativo')
      .lt('vagas.data_inicio', fifteenMinsAgo.toISOString())
      .gt('vagas.data_inicio', sixtyMinsAgo.toISOString())

    if (contratosError) {
      console.error('Erro ao buscar contratos:', contratosError)
      throw contratosError
    }

    const alertsCreated = []

    if (contratos && contratos.length > 0) {
      for (const contrato of contratos) {
        // Verifica se houve check-in de Entrada
        const { data: checkins, error: checkinsError } = await supabase
          .from('checkins_operacionais')
          .select('id')
          .eq('contrato_id', contrato.id)
          .eq('tipo', 'Entrada')
          .limit(1)

        if (checkinsError) {
          console.error(`Erro ao buscar checkins para contrato ${contrato.id}:`, checkinsError)
          continue
        }

        if (!checkins || checkins.length === 0) {
          // Verifica se o alerta já foi criado para evitar duplicação
          const { data: existingAlert } = await supabase
            .from('alertas_atraso')
            .select('id')
            .eq('contrato_id', contrato.id)
            .eq('tipo_alerta', 'Atraso Check-in')
            .limit(1)

          if (!existingAlert || existingAlert.length === 0) {
            const dataInicio = new Date((contrato.vagas as any).data_inicio)
            
            // Format hour to HH:MM in PT-BR timezone
            const horaInicio = dataInicio.toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit',
              timeZone: 'America/Sao_Paulo'
            })
            
            const freelancerNome = (contrato.freelancers as any).nome_completo
            const mensagem = `Alerta: Freelancer ${freelancerNome} não realizou check-in até as ${horaInicio}`

            const { data: newAlert, error: alertError } = await supabase
              .from('alertas_atraso')
              .insert({
                freelancer_id: contrato.freelancer_id,
                contrato_id: contrato.id,
                tipo_alerta: 'Atraso Check-in',
                mensagem: mensagem,
                status: 'Pendente'
              })
              .select()
              .single()

            if (!alertError && newAlert) {
              alertsCreated.push(newAlert)
              // Log representando o envio de uma notificação push para a empresa
              console.log(`[PUSH NOTIFICATION] Empresa ${contrato.empresa_id} -> ${mensagem}`)
            } else if (alertError) {
              console.error(`Erro ao criar alerta para contrato ${contrato.id}:`, alertError)
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: "Monitoramento concluído", 
      alertsCreated: alertsCreated.length,
      alerts: alertsCreated
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error: any) {
    console.error('Erro na Edge Function de Monitoramento:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
