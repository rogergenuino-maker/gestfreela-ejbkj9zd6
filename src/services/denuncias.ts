import { supabase } from '@/lib/supabase/client'

export const uploadEvidencia = async (file: File) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random()}.${fileExt}`
  const filePath = `denuncias/${fileName}`

  const { error: uploadError } = await supabase.storage.from('evidencias').upload(filePath, file)

  if (uploadError) {
    throw uploadError
  }

  const { data: publicUrlData } = supabase.storage.from('evidencias').getPublicUrl(filePath)

  return publicUrlData.publicUrl
}

export const createDenuncia = async (denuncia: any) => {
  const { data, error } = await (supabase as any)
    .from('denuncias')
    .insert(denuncia)
    .select()
    .single()

  if (!error && data) {
    // Notify admin
    await supabase.functions.invoke('notificar-denuncia', {
      body: { denuncia: data },
    })
  }

  return { data, error }
}
