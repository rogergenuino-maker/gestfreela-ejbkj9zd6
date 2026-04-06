import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const sendResendEmail = async (to: string[], subject: string, html: string) => {
  if (!RESEND_API_KEY) {
    console.log('RESEND_API_KEY not set. Mocking email send to:', to)
    console.log('Subject:', subject)
    return { id: 'mock-id' }
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'GestFreela <onboarding@resend.dev>',
      to,
      subject,
      html,
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    console.error('Error sending email via Resend:', error)
    throw new Error('Failed to send email')
  }

  return await res.json()
}

const getEmailTemplate = (title: string, content: string, actionLink?: string, actionText?: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9fafb; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { background-color: #2563eb; padding: 32px 24px; text-align: center; }
    .header img { width: 48px; height: 48px; margin-bottom: 16px; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; letter-spacing: -0.5px; }
    .content { padding: 40px 32px; }
    .content h2 { color: #1f2937; font-size: 20px; margin-top: 0; margin-bottom: 24px; }
    .content p { margin-bottom: 16px; color: #4b5563; }
    .content strong { color: #111827; }
    .button-container { text-align: center; margin-top: 32px; margin-bottom: 16px; }
    .button { display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px; }
    .footer { background-color: #f3f4f6; padding: 32px 24px; text-align: center; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; }
    .footer p { margin: 8px 0; }
    .footer a { color: #2563eb; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://img.usecurling.com/i?q=briefcase&color=white" alt="GestFreela Logo" />
      <h1>GestFreela</h1>
    </div>
    <div class="content">
      <h2>${title}</h2>
      ${content}
      ${actionLink && actionText ? `<div class="button-container"><a href="${actionLink}" class="button">${actionText}</a></div>` : ''}
    </div>
    <div class="footer">
      <p><strong>GestFreela</strong> - Conectando Empresas e Freelancers</p>
      <p>Este é um e-mail automático. Por favor, não responda diretamente a esta mensagem.</p>
      <p>Precisa de ajuda? <a href="mailto:suporte@gestfreela.com">suporte@gestfreela.com</a></p>
    </div>
  </div>
</body>
</html>
`

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, data } = await req.json()
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables for Supabase.')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const appUrl = Deno.env.get('APP_URL') || 'https://contratosfreela-dashboard-2cebd.goskip.app'

    if (type === 'contrato_criado') {
      const { contratoId } = data
      const { data: contrato } = await supabase
        .from('contratos')
        .select('*, vagas(titulo), empresas(nome_empresa, email), freelancers(nome_completo, email)')
        .eq('id', contratoId)
        .single()

      if (contrato) {
        const empresaEmail = contrato.empresas?.email
        const freelancerEmail = contrato.freelancers?.email
        const vagaTitulo = contrato.vagas?.titulo || 'Vaga'
        const empresaNome = contrato.empresas?.nome_empresa || 'Empresa'

        const subject = `Novo Contrato Criado: ${vagaTitulo}`
        
        if (empresaEmail) {
          const htmlEmpresa = getEmailTemplate(
            'Novo Contrato Registrado',
            `<p>Um novo contrato foi criado e atrelado à vaga <strong>${vagaTitulo}</strong>.</p>
             <p>O freelancer <strong>${contrato.freelancers?.nome_completo}</strong> está alocado para este projeto. Acompanhe o status e os check-ins diretamente pelo seu painel.</p>`,
            `${appUrl}/contratos/${contratoId}`,
            'Acessar Contrato'
          )
          await sendResendEmail([empresaEmail], subject, htmlEmpresa)
        }

        if (freelancerEmail) {
          const htmlFreelancer = getEmailTemplate(
            'Novo Contrato Registrado',
            `<p>Você foi selecionado e alocado em um novo contrato para a vaga <strong>${vagaTitulo}</strong> pela empresa <strong>${empresaNome}</strong>.</p>
             <p>Por favor, acesse a plataforma o quanto antes para revisar as informações, ler os termos e realizar a assinatura digital.</p>`,
            `${appUrl}/contratos/${contratoId}`,
            'Revisar e Assinar Contrato'
          )
          await sendResendEmail([freelancerEmail], subject, htmlFreelancer)
        }
      }
    } else if (type === 'contrato_cancelado') {
      const { contratoId } = data
      const { data: contrato } = await supabase
        .from('contratos')
        .select('*, vagas(titulo), empresas(nome_empresa, email), freelancers(nome_completo, email)')
        .eq('id', contratoId)
        .single()

      if (contrato) {
        const empresaEmail = contrato.empresas?.email
        const freelancerEmail = contrato.freelancers?.email
        const vagaTitulo = contrato.vagas?.titulo || 'Vaga'

        const subject = `Aviso Importante: Contrato Cancelado (${vagaTitulo})`
        const html = getEmailTemplate(
          'Contrato Cancelado',
          `<p>Informamos que o contrato referente à vaga <strong>${vagaTitulo}</strong> foi oficialmente cancelado no sistema.</p>
           <p><strong>Motivo do cancelamento:</strong> ${contrato.motivo_cancelamento || 'Não especificado no registro.'}</p>
           <p>Acesse a plataforma para verificar mais detalhes operacionais e consultar o termo de cancelamento gerado, se aplicável.</p>`,
          `${appUrl}/contratos/${contratoId}`,
          'Ver Detalhes do Contrato'
        )

        if (empresaEmail) await sendResendEmail([empresaEmail], subject, html)
        if (freelancerEmail) await sendResendEmail([freelancerEmail], subject, html)
      }
    } else if (type === 'vaga_publicada') {
      const { vagaId } = data
      const { data: vaga } = await supabase
        .from('vagas')
        .select('*, empresas(nome_empresa)')
        .eq('id', vagaId)
        .single()

      if (vaga) {
        const { data: freelancers } = await supabase
          .from('freelancers')
          .select('email')
          .not('email', 'is', null)

        if (freelancers && freelancers.length > 0) {
          const emails = freelancers.map(f => f.email).filter(Boolean) as string[]
          
          const subject = `Nova Oportunidade: ${vaga.titulo}`
          const html = getEmailTemplate(
            'Nova Vaga Publicada',
            `<p>A empresa <strong>${vaga.empresas?.nome_empresa}</strong> acabou de publicar uma nova oportunidade no GestFreela que pode ser do seu interesse: <strong>${vaga.titulo}</strong>.</p>
             <p>Acesse a plataforma rapidamente para conferir os requisitos, escopo de trabalho e informações sobre a remuneração.</p>`,
            `${appUrl}/vagas/${vagaId}`,
            'Visualizar Vaga'
          )

          for (const email of emails) {
            await sendResendEmail([email], subject, html)
          }
        }
      }
    } else if (type === 'freelancer_aprovado') {
      const { freelancerId } = data
      const { data: freelancer } = await supabase
        .from('freelancers')
        .select('email, nome_completo')
        .eq('id', freelancerId)
        .single()

      if (freelancer && freelancer.email) {
        const subject = `Conta Aprovada! Bem-vindo(a) ao GestFreela`
        const html = getEmailTemplate(
          'Parabéns, sua conta foi ativada!',
          `<p>Olá, <strong>${freelancer.nome_completo}</strong>.</p>
           <p>Gostaríamos de informar que sua documentação foi validada com sucesso e seu perfil agora está <strong>100% ativo</strong> no GestFreela.</p>
           <p>Você já está liberado para acessar as vagas disponíveis na plataforma, candidatar-se e começar a trabalhar com as melhores empresas.</p>`,
          `${appUrl}/vagas`,
          'Encontrar Oportunidades'
        )

        await sendResendEmail([freelancer.email], subject, html)
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Erro na Edge Function send-email:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
