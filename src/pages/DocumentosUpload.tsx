import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { UploadCloud, FileText, CheckCircle2, Clock, AlertCircle, ArrowRight } from 'lucide-react'

export default function DocumentosUpload() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [freelancerId, setFreelancerId] = useState<string | null>(null)

  const [tipoDocumento, setTipoDocumento] = useState<string>('')
  const [dataValidade, setDataValidade] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [documentos, setDocumentos] = useState<any[]>([])

  const fetchDocumentos = async (fId: string) => {
    const { data } = await supabase
      .from('documentos_validacao')
      .select('*')
      .eq('freelancer_id', fId)
      .order('created_at', { ascending: false })
    if (data) setDocumentos(data)
  }

  useEffect(() => {
    const getFreelancerId = async () => {
      if (user) {
        const { data } = await supabase
          .from('freelancers')
          .select('id')
          .eq('user_id', user.id)
          .single()
        if (data) {
          setFreelancerId(data.id)
          fetchDocumentos(data.id)
        }
      }
    }
    getFreelancerId()
  }, [user])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!freelancerId || !file || !tipoDocumento || !dataValidade) {
      toast({
        title: 'Atenção',
        description: 'Preencha todos os campos e selecione um arquivo.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${freelancerId}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('documentos').getPublicUrl(fileName)

      const { error: dbError } = await supabase.from('documentos_validacao').insert({
        freelancer_id: freelancerId,
        tipo_documento: tipoDocumento,
        arquivo_url: urlData.publicUrl,
        data_validade: dataValidade,
        status_verificacao: 'pendente',
      })

      if (dbError) throw dbError

      toast({
        title: 'Sucesso',
        description: 'Documento enviado com sucesso! Aguarde a aprovação.',
      })
      setFile(null)
      setTipoDocumento('')
      setDataValidade('')

      const fileInput = document.getElementById('file-upload') as HTMLInputElement
      if (fileInput) fileInput.value = ''

      fetchDocumentos(freelancerId)
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao enviar arquivo.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprovado':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'pendente':
        return <Clock className="h-5 w-5 text-amber-500" />
      case 'rejeitado':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <FileText className="h-5 w-5 text-slate-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aprovado':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">
            Aprovado
          </Badge>
        )
      case 'pendente':
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">
            Pendente
          </Badge>
        )
      case 'rejeitado':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">
            Rejeitado
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Documentos Obrigatórios
          </h1>
          <p className="text-muted-foreground mt-1">
            Envie seus certificados e licenças para acessar as vagas do sistema.
          </p>
        </div>
        <Button asChild variant="outline" className="gap-2 bg-white">
          <Link to="/vagas">
            Acessar Feed de Vagas <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card className="lg:col-span-1 border-slate-200 shadow-sm h-fit">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <CardTitle className="text-lg flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-blue-600" />
              Enviar Documento
            </CardTitle>
            <CardDescription>Formatos aceitos: PDF, JPG, PNG (Max 5MB)</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleUpload} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Tipo de Documento</label>
                <Select value={tipoDocumento} onValueChange={setTipoDocumento} required>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Selecione o tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CNV - Carteira Nacional de Vigilante">
                      CNV - Vigilante
                    </SelectItem>
                    <SelectItem value="Certificado Bombeiro Civil">
                      Certificado Bombeiro Civil
                    </SelectItem>
                    <SelectItem value="RG / CNH">RG / CNH</SelectItem>
                    <SelectItem value="Comprovante de Residência">
                      Comprovante de Residência
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Data de Validade</label>
                <Input
                  type="date"
                  value={dataValidade}
                  onChange={(e) => setDataValidade(e.target.value)}
                  required
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Arquivo</label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                  className="cursor-pointer file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 bg-white border-dashed border-2 py-2 h-auto"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar para Análise'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <CardTitle className="text-lg">Meus Documentos</CardTitle>
            <CardDescription>Acompanhe o status de aprovação dos seus documentos.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {documentos.length === 0 ? (
              <div className="text-center py-16 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <div className="bg-white p-4 rounded-full shadow-sm mx-auto w-fit mb-4">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">Nenhum documento enviado</h3>
                <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                  Para visualizar e se candidatar às vagas, você precisa enviar seus documentos
                  obrigatórios e aguardar aprovação.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {documentos.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-slate-200 rounded-xl bg-white hover:border-blue-100/50 hover:shadow-sm transition-all gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-50 rounded-full shrink-0">
                        {getStatusIcon(doc.status_verificacao)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{doc.tipo_documento}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                          <p className="text-sm text-slate-600 flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            Validade:{' '}
                            <span className="font-medium">
                              {new Date(doc.data_validade).toLocaleDateString('pt-BR')}
                            </span>
                          </p>
                          {doc.status_verificacao === 'aprovado' &&
                            new Date(doc.data_validade) < new Date() && (
                              <span className="text-xs text-red-600 font-medium flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                                <AlertCircle className="h-3 w-3" /> Vencido
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                      {getStatusBadge(doc.status_verificacao)}
                      <a
                        href={doc.arquivo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                      >
                        Ver Arquivo
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
