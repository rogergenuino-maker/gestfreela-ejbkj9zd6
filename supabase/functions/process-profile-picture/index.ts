import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import sharp from 'npm:sharp@0.32.6'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { image, userId, contentType } = await req.json()

    if (!image || !userId) {
      throw new Error('Missing image or userId')
    }

    // Extrai os dados em base64 da string (removendo o prefixo)
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))

    // Validação de tamanho (5MB) baseada no tamanho do buffer (aproximado)
    if (buffer.length > 5 * 1024 * 1024) {
      throw new Error('A imagem excede o limite de 5MB')
    }

    // Processamento e otimização usando sharp (redimensiona para 500x500, formato JPEG, 80% qualidade)
    let optimizedBuffer = buffer;
    try {
      optimizedBuffer = await sharp(buffer)
        .resize(500, 500, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toBuffer()
    } catch (sharpError) {
      console.warn('O processamento da imagem falhou, utilizando o buffer original', sharpError)
    }

    // Instancia o cliente do Supabase utilizando a Service Role Key (Admin)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const filePath = `${userId}/profile-${Date.now()}.jpg`

    // Upload do buffer otimizado para o bucket profile-pictures
    const { error: uploadError } = await supabaseAdmin.storage
      .from('profile-pictures')
      .upload(filePath, optimizedBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      })

    if (uploadError) throw uploadError

    // Obtem a URL pública da imagem salva
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('profile-pictures')
      .getPublicUrl(filePath)

    const publicUrl = publicUrlData.publicUrl

    // Atualiza a tabela users associando a profile_picture_url
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ profile_picture_url: publicUrl })
      .eq('id', userId)

    if (updateError) throw updateError

    return new Response(JSON.stringify({ url: publicUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Erro ao processar imagem de perfil:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
