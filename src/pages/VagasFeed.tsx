import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import {
  Briefcase,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Hourglass,
  FileText,
  Filter,
  Info,
} from 'lucide-react'

export default function VagasFeed() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [vagas, setVagas] = useState<any[]>([])
  const [documentos, setDocumentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState<boolean>(false)
  const [freelancerId, setFreelancerId] = useState<string | null>(null)

  // Filtros
  const [filtroNatureza, setFiltroNatureza] = useState<string>('todas')
  const [filtroValorMin, setFiltroValorMin] = useState<string>('')
  const [filtroValorMax, setFiltroValorMax] = useState<string>('')

  // Modal
  const [vagaSelecionada, setVagaSelecionada] = useState<any>(null)
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    const loadVagas = async () => {
      if (!user) return

      const { data: fData } = await supabase
        .from('freelancers')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (fData) {
        setFreelancerId(fData.id)
        const { data: docs } = await supabase
          .from('documentos_validacao')
          .select('*')
          .eq('freelancer_id', fData.id)
          .order('created_at', { ascending: false })

        if (docs) {
          setDocumentos(docs)

          const today = new Date().toISOString().split('T')[0]
          const hasValidApproved = docs.some(
            (d) =>
              d.status_verificacao === 'aprovado' && (!d.data_validade || d.data_validade >= today),
          )

          setHasAccess(hasValidApproved)

          if (hasValidApproved) {
            const { data: vagasData } = await supabase
              .from('vagas')
              .select('*, empresas(nome_empresa)')
              .eq('status', 'aberta')
              .order('created_at', { ascending: false })

            if (vagasData) setVagas(vagasData)
          }
        } else {
          setHasAccess(false)
        }
      }
      setLoading(false)
    }

    loadVagas()
  }, [user])

  const handleAceitarVaga = async () => {
    if (!vagaSelecionada) return

    setAccepting(true)
    try {
      // Simulação do registro de interesse/aceite da vaga
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: 'Candidatura Enviada!',
        description: 'A empresa foi notificada do seu interesse nesta vaga.',
      })
      setVagaSelecionada(null)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível aceitar a vaga.',
        variant: 'destructive',
      })
    } finally {
      setAccepting(false)
    }
  }

  const vagasFiltradas = vagas.filter((vaga) => {
    if (filtroNatureza !== 'todas' && vaga.natureza !== filtroNatureza) return false
    if (filtroValorMin && vaga.valor_remuneracao < Number(filtroValorMin)) return false
    if (filtroValorMax && vaga.valor_remuneracao > Number(filtroValorMax)) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="max-w-4xl mx-auto mt-12 px-4 animate-in fade-in zoom-in-95 duration-500 pb-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
          <div className="bg-blue-600 p-8 md:p-12 text-center relative overflow-hidden">
            <div className="relative z-10">
              <div className="mx-auto bg-white/20 p-5 rounded-full w-24 h-24 flex items-center justify-center mb-6 backdrop-blur-sm shadow-inner">
                <Clock className="h-12 w-12 text-white animate-pulse" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                Aguardando Validação
              </h2>
              <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                Seus documentos estão em análise. Você poderá acessar as vagas assim que forem
                aprovados.
              </p>
            </div>
          </div>

          <div className="p-6 md:p-10 bg-slate-50">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-slate-200 pb-6">
              <h3 className="text-2xl font-semibold text-slate-800 flex items-center gap-3">
                <FileText className="h-6 w-6 text-blue-600" />
                Status dos Documentos
              </h3>
              <Button
                asChild
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md w-full md:w-auto transition-all hover:scale-105"
              >
                <Link to="/freelancers/documentos">Fazer Upload de Novo Documento</Link>
              </Button>
            </div>

            {documentos.length === 0 ? (
              <div className="text-center p-12 bg-white rounded-xl border-2 border-dashed border-slate-300">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">Nenhum documento enviado ainda.</p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {documentos.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow"
                  >
                    <div className="mt-1 bg-slate-50 p-2.5 rounded-full shadow-inner">
                      {doc.status_verificacao === 'aprovado' ? (
                        <CheckCircle className="h-7 w-7 text-emerald-500" />
                      ) : doc.status_verificacao === 'rejeitado' ? (
                        <XCircle className="h-7 w-7 text-rose-500" />
                      ) : (
                        <Hourglass className="h-7 w-7 text-amber-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 text-lg capitalize">
                        {doc.tipo_documento?.replace(/_/g, ' ') || 'Documento'}
                      </h4>
                      <div className="space-y-1 mt-2">
                        <p className="text-sm text-slate-500 flex items-center gap-1.5">
                          <span className="font-medium text-slate-700">Enviado:</span>{' '}
                          {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                        </p>
                        {doc.data_validade && (
                          <p className="text-sm text-slate-500 flex items-center gap-1.5">
                            <span className="font-medium text-slate-700">Validade:</span>{' '}
                            {new Date(doc.data_validade).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Badge
                        variant="outline"
                        className={
                          doc.status_verificacao === 'aprovado'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1'
                            : doc.status_verificacao === 'rejeitado'
                              ? 'bg-rose-50 text-rose-700 border-rose-200 px-3 py-1'
                              : 'bg-amber-50 text-amber-700 border-amber-200 px-3 py-1'
                        }
                      >
                        {doc.status_verificacao ? doc.status_verificacao.toUpperCase() : 'PENDENTE'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    return (
      d.toLocaleDateString('pt-BR') +
      ' às ' +
      d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-12">
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 p-8 rounded-2xl text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <Briefcase className="h-64 w-64" />
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold tracking-tight">Feed de Vagas</h1>
          <p className="text-blue-100 mt-2 text-lg max-w-2xl">
            Encontre as melhores oportunidades e feche novos contratos com empresas parceiras.
          </p>
        </div>
      </div>

      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 mb-5 text-slate-800">
          <Filter className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-lg">Filtrar Oportunidades</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <Label htmlFor="natureza" className="text-slate-600">
              Natureza da Vaga
            </Label>
            <Select value={filtroNatureza} onValueChange={setFiltroNatureza}>
              <SelectTrigger id="natureza" className="bg-slate-50 border-slate-200">
                <SelectValue placeholder="Selecione a natureza" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="Evento">Evento</SelectItem>
                <SelectItem value="Diária">Diária</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="valorMin" className="text-slate-600">
              Valor Mínimo (R$)
            </Label>
            <Input
              id="valorMin"
              type="number"
              placeholder="Ex: 100"
              value={filtroValorMin}
              onChange={(e) => setFiltroValorMin(e.target.value)}
              className="bg-slate-50 border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="valorMax" className="text-slate-600">
              Valor Máximo (R$)
            </Label>
            <Input
              id="valorMax"
              type="number"
              placeholder="Ex: 1000"
              value={filtroValorMax}
              onChange={(e) => setFiltroValorMax(e.target.value)}
              className="bg-slate-50 border-slate-200"
            />
          </div>
        </div>
      </div>

      {vagasFiltradas.length === 0 ? (
        <Card className="border-dashed border-2 bg-slate-50/50 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-white p-6 rounded-full shadow-sm mb-4">
              <Briefcase className="h-12 w-12 text-slate-300" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900">Nenhuma vaga encontrada</h3>
            <p className="text-slate-500 mt-2 text-lg">
              Tente ajustar os filtros ou volte mais tarde para novas oportunidades.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vagasFiltradas.map((vaga) => (
            <Card
              key={vaga.id}
              className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-slate-200 bg-white flex flex-col h-full overflow-hidden group"
            >
              <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:h-3 transition-all" />
              <CardHeader className="pb-4 pt-5">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1.5 flex-1">
                    <Badge
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium mb-1 inline-flex"
                    >
                      {vaga.natureza || 'Geral'}
                    </Badge>
                    <CardTitle className="text-xl font-bold line-clamp-2 text-slate-900 leading-tight group-hover:text-blue-700 transition-colors">
                      {vaga.titulo}
                    </CardTitle>
                    <p className="text-sm font-semibold text-slate-500 flex items-center">
                      {vaga.empresas?.nome_empresa || 'Empresa Confidencial'}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pb-6 flex-1">
                <div className="space-y-2.5">
                  <div className="flex items-start text-sm text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <MapPin className="h-4 w-4 mr-2.5 text-slate-400 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{vaga.endereco_vaga || 'Não informado'}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <Calendar className="h-4 w-4 mr-2.5 text-slate-400 shrink-0" />
                    <span className="line-clamp-1">
                      {vaga.data_inicio ? formatDateTime(vaga.data_inicio) : 'Data a definir'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm font-semibold text-emerald-700 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                    <DollarSign className="h-4 w-4 mr-2.5 shrink-0" />
                    <span>
                      {vaga.valor_remuneracao
                        ? formatCurrency(vaga.valor_remuneracao)
                        : 'A combinar'}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4">
                  <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    {vaga.escopo_trabalho}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-5 px-6">
                <Button
                  onClick={() => setVagaSelecionada(vaga)}
                  variant="outline"
                  className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 font-medium py-5 transition-colors rounded-xl"
                >
                  Ver Detalhes
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Detalhes da Vaga */}
      <Dialog open={!!vagaSelecionada} onOpenChange={(open) => !open && setVagaSelecionada(null)}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b border-slate-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge className="mb-3 bg-blue-100 text-blue-800 hover:bg-blue-200">
                  {vagaSelecionada?.natureza || 'Geral'}
                </Badge>
                <DialogTitle className="text-2xl font-bold text-slate-900 leading-tight">
                  {vagaSelecionada?.titulo}
                </DialogTitle>
                <p className="text-slate-500 font-medium mt-1">
                  {vagaSelecionada?.empresas?.nome_empresa || 'Empresa Confidencial'}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="py-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Calendar className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Período</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Início: {formatDateTime(vagaSelecionada?.data_inicio)}
                  </p>
                  {vagaSelecionada?.data_fim && (
                    <p className="text-sm text-slate-600">
                      Fim: {formatDateTime(vagaSelecionada?.data_fim)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <DollarSign className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Remuneração</p>
                  <p className="text-lg text-emerald-700 font-bold mt-0.5">
                    {vagaSelecionada?.valor_remuneracao
                      ? formatCurrency(vagaSelecionada.valor_remuneracao)
                      : 'A combinar'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <MapPin className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Localização Completa</p>
                <p className="text-sm text-slate-600 mt-1">
                  {vagaSelecionada?.endereco_vaga || 'Não informado'}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                Escopo do Trabalho
              </h4>
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                {vagaSelecionada?.escopo_trabalho || 'Nenhum detalhe adicional fornecido.'}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100 gap-3 sm:gap-0">
            <Button variant="outline" onClick={() => setVagaSelecionada(null)}>
              Cancelar
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
              onClick={handleAceitarVaga}
              disabled={accepting}
            >
              {accepting ? 'Enviando...' : 'Aceitar Vaga'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
