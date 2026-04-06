import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { denuncia } = body

    if (!denuncia) {
      throw new Error('Denúncia não fornecida')
    }

    console.log(`[EMAIL ENVIADO] Para: admin@contratosfreela.com`)
    console.log(`[ASSUNTO] Nova Denúncia de Má Conduta Registrada`)
    console.log(`[CORPO]
Uma nova denúncia foi registrada no sistema.
Contrato ID: ${denuncia.contrato_id}
Denunciante ID: ${denuncia.denunciante_id}
Tipo: ${denuncia.tipo_denuncia}
Descrição: ${denuncia.descricao}
Evidências: ${denuncia.evidencias_url || 'Nenhuma'}
Data: ${denuncia.data_denuncia}
    `)

    return new Response(JSON.stringify({ 
      success: true,
      message: "Notificação enviada com sucesso"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error: any) {
    console.error('Erro na Edge Function de Notificação de Denúncia:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
