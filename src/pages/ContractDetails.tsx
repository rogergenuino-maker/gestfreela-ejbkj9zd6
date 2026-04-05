import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { differenceInHours, parseISO, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  AlertTriangle,
  XCircle,
  FileText,
  AlertOctagon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { exportContractPDF, generateCancelamentoHTML } from '@/utils/pdfExport'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { getContratoById, cancelarContrato, uploadTermoCancelamento } from '@/services/contratos'
import { useAuth } from '@/hooks/use-auth'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { createDenuncia, uploadEvidencia } from '@/services/denuncias'

export default function ContractDetails() {
  const { user } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [contrato, setContrato] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [motivoCancelamento, setMotivoCancelamento] = useState('')
  const [confirmacaoCancelamento, setConfirmacaoCancelamento] = useState('')

  const [showDenunciaDialog, setShowDenunciaDialog] = useState(false)
  const [tipoDenuncia, setTipoDenuncia] = useState('')
  const [descricaoDenuncia, setDescricaoDenuncia] = useState('')
  const [arquivoEvidencia, setArquivoEvidencia] = useState<File | null>(null)
  const [enviandoDenuncia, setEnviandoDenuncia] = useState(false)

  useEffect(() => {
    async function load() {
      if (!id) return
      const { data, error } = await getContratoById(id)
      if (error || !data) {
        toast({ title: 'Erro', description: 'Contrato não encontrado.', variant: 'destructive' })
        navigate('/contracts')
      } else {
        setContrato(data)
      }
      setLoading(false)
    }
    load()
  }, [id, navigate, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!contrato) return null

  const { vaga, freelancer } = contrato

  const dataInicio = vaga?.data_inicio ? parseISO(vaga.data_inicio) : new Date()
  const horasRestantes = differenceInHours(dataInicio, new Date())
  const isPenalty = horasRestantes <= 36
  const valorRemuneracao = vaga?.valor_remuneracao || 0

  const handleCancel = async () => {
    if (!motivoCancelamento.trim()) {
      toast({
        title: 'Aviso',
        description: 'Por favor, informe o motivo do cancelamento.',
        variant: 'destructive',
      })
      return
    }

    setCanceling(true)
    const valorEstornado = isPenalty ? valorRemuneracao * 0.9 : valorRemuneracao

    const htmlContent = generateCancelamentoHTML(
      contrato,
      motivoCancelamento,
      isPenalty,
      valorEstornado,
      formatCurrency,
    )

    const { url, error: uploadError } = await uploadTermoCancelamento(id!, htmlContent)

    if (uploadError) {
      toast({
        title: 'Erro',
        description: 'Erro ao gerar documento de cancelamento.',
        variant: 'destructive',
      })
      setCanceling(false)
      return
    }

    const { error } = await cancelarContrato(
      id!,
      isPenalty,
      valorEstornado,
      motivoCancelamento,
      url || '',
    )

    setCanceling(false)
    setShowCancelDialog(false)
    setConfirmacaoCancelamento('')

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível cancelar o contrato.',
        variant: 'destructive',
      })
      return
    }

    toast({
      title: 'Contrato Cancelado',
      description: 'Contrato cancelado e termo gerado com sucesso.',
    })

    setContrato({
      ...contrato,
      status: 'cancelado',
      penalidade_aplicada: isPenalty,
      valor_estornado: valorEstornado,
      motivo_cancelamento: motivoCancelamento,
      url_termo_cancelamento: url,
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'ativo':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
            Ativo
          </Badge>
        )
      case 'cancelado':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">
            Cancelado
          </Badge>
        )
      case 'aguardando_aceite':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
            Aguardando Aceite
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="capitalize">
            {status?.replace('_', ' ')}
          </Badge>
        )
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const handleExportClick = () => {
    const success = exportContractPDF(contrato, formatCurrency)
    if (!success) {
      toast({
        title: 'Aviso',
        description: 'Por favor, permita pop-ups no seu navegador para gerar o PDF.',
        variant: 'destructive',
      })
    }
  }

  const handleDenunciaSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tipoDenuncia || !descricaoDenuncia || !user) return

    setEnviandoDenuncia(true)
    try {
      let evidencias_url = null
      if (arquivoEvidencia) {
        evidencias_url = await uploadEvidencia(arquivoEvidencia)
      }

      const { error } = await createDenuncia({
        contrato_id: id,
        denunciante_id: user.id,
        tipo_denuncia: tipoDenuncia,
        descricao: descricaoDenuncia,
        evidencias_url,
      })

      if (error) throw error

      toast({
        title: 'Denúncia Enviada',
        description: 'Sua denúncia foi registrada e será analisada pela administração.',
      })
      setShowDenunciaDialog(false)
      setTipoDenuncia('')
      setDescricaoDenuncia('')
      setArquivoEvidencia(null)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a denúncia. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setEnviandoDenuncia(false)
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="text-slate-500 hover:text-slate-900"
          >
            <Link to="/contracts">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Detalhes do Contrato</h1>
            <p className="text-slate-500">Gerencie as informações e status desta contratação</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="text-blue-600 border-blue-200 hover:bg-blue-50 w-full sm:w-auto shadow-sm"
          onClick={handleExportClick}
        >
          <FileText className="h-4 w-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                <User className="h-5 w-5 text-primary" />
                Profissional Contratado
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center gap-5">
                <Avatar className="h-16 w-16 border border-slate-200 shadow-sm">
                  <AvatarImage
                    src={
                      freelancer?.foto_perfil ||
                      `https://img.usecurling.com/ppl/thumbnail?seed=${freelancer?.id}`
                    }
                  />
                  <AvatarFallback className="bg-primary/5 text-primary text-xl">
                    {freelancer?.nome_completo?.charAt(0) || 'F'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg text-slate-900">
                    {freelancer?.nome_completo || 'Freelancer não identificado'}
                  </h3>
                  <p className="text-sm text-slate-500">{freelancer?.email}</p>
                  <p className="text-sm text-slate-500">{freelancer?.telefone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg text-slate-800">Detalhes da Vaga</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div>
                <h3 className="font-semibold text-xl text-slate-900 mb-2">{vaga?.titulo}</h3>
                {vaga?.natureza && (
                  <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                    {vaga.natureza}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary/70 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900 text-sm">Data e Hora de Início</p>
                    <p className="text-slate-600 text-sm mt-1">
                      {vaga?.data_inicio
                        ? format(parseISO(vaga.data_inicio), "dd 'de' MMM, yyyy", { locale: ptBR })
                        : 'Não definido'}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {vaga?.data_inicio ? format(parseISO(vaga.data_inicio), 'HH:mm') : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary/70 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900 text-sm">Local</p>
                    <p className="text-slate-600 text-sm mt-1 line-clamp-2">
                      {vaga?.endereco_vaga || 'Endereço não informado'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg text-slate-800">Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Status</span>
                {getStatusBadge(contrato.status)}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Valor Acordado</span>
                <span className="text-lg font-bold text-slate-900">
                  {formatCurrency(valorRemuneracao)}
                </span>
              </div>

              {contrato.status === 'cancelado' && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">Penalidade</span>
                    <span className="text-sm font-medium text-slate-900">
                      {contrato.penalidade_aplicada ? 'Aplicada (10%)' : 'Nenhuma'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">Valor Estornado</span>
                    <span className="text-sm font-bold text-red-600">
                      {formatCurrency(contrato.valor_estornado || 0)}
                    </span>
                  </div>
                  {contrato.url_termo_cancelamento && (
                    <div className="pt-3">
                      <Button
                        variant="outline"
                        className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        onClick={() => window.open(contrato.url_termo_cancelamento, '_blank')}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Baixar Termo de Cancelamento
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {contrato.status !== 'cancelado' && (
            <div className="pt-2 animate-fade-in">
              <Button
                variant="destructive"
                className="w-full font-medium shadow-sm hover:shadow-md transition-all h-12"
                onClick={() => setShowCancelDialog(true)}
              >
                <XCircle className="w-5 h-5 mr-2" />
                Cancelar Evento
              </Button>
              <p className="text-xs text-center text-slate-400 mt-3">
                O cancelamento está sujeito às políticas da plataforma.
              </p>
            </div>
          )}

          <div className="pt-2 animate-fade-in">
            <Button
              variant="outline"
              className="w-full font-medium shadow-sm transition-all h-12 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setShowDenunciaDialog(true)}
            >
              <AlertOctagon className="w-5 h-5 mr-2" />
              Denunciar Má Conduta
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog
        open={showCancelDialog}
        onOpenChange={(open) => {
          setShowCancelDialog(open)
          if (!open) setConfirmacaoCancelamento('')
        }}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle
                className={isPenalty ? 'text-red-500 h-6 w-6' : 'text-amber-500 h-6 w-6'}
              />
              {isPenalty ? 'Atenção: Cancelamento com multa' : 'Confirmar Cancelamento'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-slate-600 space-y-4 pt-4">
              {isPenalty ? (
                <>
                  <p>
                    Você está realizando um cancelamento com <strong>menos de 36 horas</strong> de
                    antecedência em relação ao início do evento.
                  </p>
                  <div className="p-4 bg-red-50 text-red-800 rounded-lg border border-red-100 text-sm space-y-1">
                    <p>
                      <strong>Atenção: Cancelamento com menos de 36h.</strong>
                    </p>
                    <p>
                      Será aplicada multa de 10% ao freelancer e retenção da taxa da plataforma.
                    </p>
                    <p className="pt-2 text-red-900">
                      Valor estornado: <strong>{formatCurrency(valorRemuneracao * 0.9)}</strong>{' '}
                      (90%).
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <p>O cancelamento está sendo realizado com antecedência superior a 36 horas.</p>
                  <div className="p-4 bg-green-50 text-green-800 rounded-lg border border-green-100 text-sm space-y-1">
                    <p>
                      <strong>Cancelamento sem custos.</strong>
                    </p>
                    <p>Estorno de 100% garantido.</p>
                    <p className="pt-2 text-green-900">
                      Valor estornado: <strong>{formatCurrency(valorRemuneracao)}</strong> (100%).
                    </p>
                  </div>
                </>
              )}

              <div className="mt-4 space-y-2 text-left">
                <Label htmlFor="motivo">
                  Motivo do Cancelamento <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="motivo"
                  value={motivoCancelamento}
                  onChange={(e) => setMotivoCancelamento(e.target.value)}
                  placeholder="Descreva brevemente o motivo do cancelamento..."
                  className="resize-none"
                  rows={3}
                />
              </div>

              <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-left">
                <Label htmlFor="confirmacao-cancelamento" className="text-slate-700 font-medium">
                  Para confirmar o cancelamento, digite{' '}
                  <strong className="text-red-600">CONFIRMAR</strong> abaixo:
                </Label>
                <Input
                  id="confirmacao-cancelamento"
                  value={confirmacaoCancelamento}
                  onChange={(e) => setConfirmacaoCancelamento(e.target.value)}
                  placeholder="CONFIRMAR"
                  className="border-slate-300 bg-white"
                  autoComplete="off"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel
              disabled={canceling}
              className="border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleCancel()
              }}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={canceling || confirmacaoCancelamento !== 'CONFIRMAR'}
            >
              {canceling ? 'Cancelando...' : 'Confirmar Cancelamento'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showDenunciaDialog} onOpenChange={setShowDenunciaDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Denunciar Má Conduta</DialogTitle>
            <DialogDescription>
              Preencha os detalhes da ocorrência. Esta denúncia será enviada diretamente para a
              administração.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDenunciaSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Denúncia</Label>
              <Select value={tipoDenuncia} onValueChange={setTipoDenuncia} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Atraso">Atraso</SelectItem>
                  <SelectItem value="Não Comparecimento">Não Comparecimento</SelectItem>
                  <SelectItem value="Comportamento Inadequado">Comportamento Inadequado</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição Detalhada</Label>
              <Textarea
                id="descricao"
                required
                maxLength={1000}
                rows={4}
                value={descricaoDenuncia}
                onChange={(e) => setDescricaoDenuncia(e.target.value)}
                placeholder="Descreva o que aconteceu em detalhes..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evidencia">Anexar Evidências (Opcional)</Label>
              <Input
                id="evidencia"
                type="file"
                onChange={(e) => setArquivoEvidencia(e.target.files?.[0] || null)}
                accept="image/*,.pdf,.doc,.docx"
                className="cursor-pointer file:text-slate-600"
              />
              <p className="text-xs text-slate-500">Formatos aceitos: Imagens, PDF, Word.</p>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDenunciaDialog(false)}
                disabled={enviandoDenuncia}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={enviandoDenuncia}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {enviandoDenuncia ? 'Enviando...' : 'Enviar Denúncia'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
