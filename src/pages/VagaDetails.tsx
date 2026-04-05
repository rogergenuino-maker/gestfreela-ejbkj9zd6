import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getVagaById } from '@/services/vagas'
import { getFreelancerByUserId } from '@/services/freelancers'
import { createContrato } from '@/services/contratos'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import {
  MapPin,
  Calendar,
  DollarSign,
  Building,
  Clock,
  ArrowLeft,
  Briefcase,
  FileText,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function VagaDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()

  const [vaga, setVaga] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    if (id) {
      getVagaById(id).then(({ data }) => {
        setVaga(data)
        setLoading(false)
      })
    }
  }, [id])

  const handleAccept = async () => {
    if (!user) {
      toast({ title: 'Erro', description: 'Você precisa estar logado.', variant: 'destructive' })
      return
    }
    setAccepting(true)

    const { data: freelancer } = await getFreelancerByUserId(user.id)
    if (!freelancer) {
      toast({
        title: 'Acesso Negado',
        description: 'Apenas freelancers aprovados podem aceitar vagas.',
        variant: 'destructive',
      })
      setAccepting(false)
      return
    }

    const { data: contrato, error } = await createContrato({
      vaga_id: vaga.id,
      empresa_id: vaga.empresa_id,
      freelancer_id: freelancer.id,
      status: 'Aguardando_Aceite',
    })

    setAccepting(false)

    if (error) {
      toast({ title: 'Erro ao aceitar vaga', description: error.message, variant: 'destructive' })
    } else if (contrato) {
      toast({
        title: 'Vaga pré-aceita!',
        description: 'Redirecionando para assinatura do contrato...',
        variant: 'success',
      })
      navigate(`/contratos/${contrato.id}/assinar`)
    }
  }

  if (loading)
    return (
      <div className="container mx-auto py-12 px-4 max-w-5xl flex justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-64 bg-slate-200 rounded"></div>
          <div className="h-4 w-48 bg-slate-200 rounded"></div>
        </div>
      </div>
    )

  if (!vaga)
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-700 mb-2">Vaga não encontrada</h2>
        <Button asChild variant="outline">
          <Link to="/vagas">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para o Feed
          </Link>
        </Button>
      </div>
    )

  return (
    <div className="container mx-auto py-8 max-w-5xl px-4 animate-fade-in-up">
      <Link
        to="/vagas"
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Voltar para Vagas
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-blue-600 h-2 w-full"></div>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <Badge
                  variant={vaga.natureza?.toLowerCase() === 'evento' ? 'default' : 'secondary'}
                  className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1"
                >
                  {vaga.natureza?.toUpperCase()}
                </Badge>
                <span className="text-sm text-slate-500 font-medium">
                  Postada em{' '}
                  {vaga.created_at
                    ? format(new Date(vaga.created_at), 'dd/MM/yyyy', { locale: ptBR })
                    : ''}
                </span>
              </div>
              <CardTitle className="text-3xl font-bold text-slate-900 leading-tight mb-2">
                {vaga.titulo}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold uppercase text-slate-500 tracking-wider mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Escopo do Trabalho
                </h3>
                <div className="text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                  {vaga.escopo_trabalho || 'Nenhum escopo detalhado fornecido.'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase text-slate-500 tracking-wider mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Localização
                  </h3>
                  <p className="text-slate-700">{vaga.endereco_vaga || 'A combinar / Remoto'}</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase text-slate-500 tracking-wider mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Período
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Início:</span>{' '}
                      {vaga.data_inicio
                        ? format(new Date(vaga.data_inicio), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                        : 'N/A'}
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Término:</span>{' '}
                      {vaga.data_fim
                        ? format(new Date(vaga.data_fim), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="border-slate-200 shadow-sm sticky top-6">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6">
              <CardTitle className="text-lg text-slate-900 flex justify-between items-center">
                Remuneração
              </CardTitle>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-3xl font-bold text-green-600">
                  R${' '}
                  {vaga.valor_remuneracao
                    ? vaga.valor_remuneracao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                    : '0,00'}
                </span>
                <span className="text-slate-500 text-sm mb-1">/ total</span>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {vaga.empresa && (
                <div className="mb-6">
                  <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-3">
                    Empresa Contratante
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold overflow-hidden border border-blue-200 shrink-0">
                      {vaga.empresa.logo ? (
                        <img
                          src={vaga.empresa.logo}
                          alt="Logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{vaga.empresa.nome_empresa}</p>
                      <Link to="#" className="text-xs text-blue-600 hover:underline">
                        Ver perfil da empresa
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleAccept}
                disabled={accepting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-6 text-lg shadow-md hover:shadow-lg transition-all"
              >
                {accepting ? 'Processando...' : 'Aceitar Vaga'}
              </Button>
              <p className="text-xs text-center text-slate-400 mt-4">
                Ao aceitar, você será redirecionado para a assinatura digital do contrato.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
