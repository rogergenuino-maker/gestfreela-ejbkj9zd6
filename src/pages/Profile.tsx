import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Upload, User as UserIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function Profile() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [profileUrl, setProfileUrl] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      if (!user) return
      setIsLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('profile_picture_url')
        .eq('id', user.id)
        .single()

      if (!error && data) {
        setProfileUrl(data.profile_picture_url)
      }
      setIsLoading(false)
    }
    loadProfile()
  }, [user])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validação de tipo
    if (!['image/jpeg', 'image/png'].includes(selectedFile.type)) {
      toast({
        title: 'Erro',
        description: 'Apenas arquivos JPG e PNG são permitidos.',
        variant: 'destructive',
      })
      return
    }

    // Validação de tamanho (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast({
        title: 'Erro',
        description: 'O tamanho máximo permitido é de 5MB.',
        variant: 'destructive',
      })
      return
    }

    setFile(selectedFile)
    setPreviewUrl(URL.createObjectURL(selectedFile))
  }

  const handleUpload = async () => {
    if (!file || !user) return
    setIsUploading(true)

    try {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = async () => {
        const base64 = reader.result as string

        const { data, error } = await supabase.functions.invoke('process-profile-picture', {
          body: { image: base64, userId: user.id, contentType: file.type },
        })

        if (error) {
          throw new Error('Falha ao processar e salvar a imagem.')
        }

        setProfileUrl(data.url)
        setPreviewUrl(null)
        setFile(null)

        toast({ title: 'Sucesso', description: 'Foto de perfil atualizada com sucesso!' })
        setIsUploading(false)
      }
    } catch (error: any) {
      console.error(error)
      toast({ title: 'Erro ao fazer upload', description: error.message, variant: 'destructive' })
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Meu Perfil</h1>
      <Card className="border-t-4 border-t-blue-600 shadow-md">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="text-xl text-blue-900">Foto de Perfil</CardTitle>
          <CardDescription>
            Faça upload de uma foto para o seu perfil (JPG ou PNG, máx. 5MB).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="w-32 h-32 border-4 border-slate-100 shadow-sm">
              <AvatarImage src={previewUrl || profileUrl || ''} className="object-cover" />
              <AvatarFallback className="bg-slate-100 text-slate-400">
                {isLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <UserIcon className="h-12 w-12" />
                )}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4 w-full sm:w-auto">
              <div className="flex flex-col gap-3">
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('profile-upload')?.click()}
                  disabled={isUploading}
                  className="w-full sm:w-auto"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Escolher Imagem
                </Button>
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/jpeg, image/png"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {file && (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isUploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      'Salvar Foto'
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setFile(null)
                      setPreviewUrl(null)
                    }}
                    disabled={isUploading}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
