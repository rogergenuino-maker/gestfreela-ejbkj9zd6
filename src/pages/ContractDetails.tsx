import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { differenceInHours, parseISO, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, Calendar, MapPin, User, AlertTriangle, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
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
import { getContratoById, cancelarContrato } from '@/services/contratos'

export default function ContractDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [contrato, setContrato] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [canceling, setCanceling] = useState(false)

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
    setCanceling(true)
    const valorEstornado = isPenalty ? valorRemuneracao * 0.9 : valorRemuneracao
    const { error } = await cancelarContrato(id!, isPenalty, valorEstornado)

    setCanceling(false)
    setShowCancelDialog(false)

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
      description: 'Notificação push disparada para o Freelancer com sucesso.',
    })

    setContrato({
      ...contrato,
      status: 'cancelado',
      penalidade_aplicada: isPenalty,
      valor_estornado: valorEstornado,
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

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 animate-fade-in-up">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild className="text-slate-500 hover:text-slate-900">
          <Link to="/contracts">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Detalhes do Contrato</h1>
          <p className="text-slate-500">Gerencie as informações e status desta contratação</p>
        </div>
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
        </div>
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
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
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel disabled={canceling} className="border-slate-200 text-slate-600">
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleCancel()
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={canceling}
            >
              {canceling ? 'Cancelando...' : 'Confirmar Cancelamento'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
