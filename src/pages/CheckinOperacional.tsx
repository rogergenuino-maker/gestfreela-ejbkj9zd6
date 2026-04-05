import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Clock, ArrowLeft, Loader2, LogIn, LogOut } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function CheckinOperacional() {
  const { id: contrato_id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [contrato, setContrato] = useState<any>(null)
  const [freelancerId, setFreelancerId] = useState<string | null>(null)
  const [checkins, setCheckins] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      if (!user || !contrato_id) return

      try {
        setIsLoading(true)

        const { data: freelancerData, error: freelancerError } = await supabase
          .from('freelancers')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (freelancerError) throw freelancerError
        setFreelancerId(freelancerData.id)

        const { data: contratoData, error: contratoError } = await supabase
          .from('contratos')
          .select(`
            id,
            status,
            vagas (
              titulo,
              empresa_id,
              empresas (
                nome_empresa
              )
            )
          `)
          .eq('id', contrato_id)
          .single()

        if (contratoError) throw contratoError
        setContrato(contratoData)

        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

        const { data: checkinsData, error: checkinsError } = await supabase
          .from('checkins_operacionais')
          .select('*')
          .eq('contrato_id', contrato_id)
          .eq('freelancer_id', freelancerData.id)
          .gte('data_hora', startOfDay.toISOString())
          .order('data_hora', { ascending: false })

        if (checkinsError) throw checkinsError
        setCheckins(checkinsData || [])
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: 'Erro',
          description: 'Erro ao carregar dados do contrato.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user, contrato_id])

  const handleRegister = async (tipo: 'Entrada' | 'Saída') => {
    if (!navigator.geolocation) {
      toast({
        title: 'Aviso',
        description: 'Geolocalização não suportada pelo navegador.',
        variant: 'warning',
      })
      return
    }

    setIsProcessing(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const dataHora = new Date().toISOString()

          const { error } = await supabase.from('checkins_operacionais').insert({
            contrato_id,
            freelancer_id: freelancerId,
            tipo,
            latitude,
            longitude,
            data_hora: dataHora,
          })

          if (error) throw error

          const timeFormatted = new Date(dataHora).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })
          toast({
            title: 'Sucesso',
            description: `Check-in de ${tipo} realizado com sucesso às ${timeFormatted}!`,
            variant: 'success',
          })

          // Refresh checkins
          const { data: checkinsData } = await supabase
            .from('checkins_operacionais')
            .select('*')
            .eq('contrato_id', contrato_id)
            .eq('freelancer_id', freelancerId)
            .order('data_hora', { ascending: false })
            .limit(10)

          if (checkinsData) setCheckins(checkinsData)
        } catch (error) {
          console.error('Error registering:', error)
          toast({
            title: 'Erro',
            description: `Erro ao registrar ${tipo}.`,
            variant: 'destructive',
          })
        } finally {
          setIsProcessing(false)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        toast({
          title: 'Atenção',
          description: 'Ative a localização (GPS) para fazer o check-in.',
          variant: 'warning',
        })
        setIsProcessing(false)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const tituloVaga = Array.isArray(contrato?.vagas)
    ? contrato?.vagas[0]?.titulo
    : contrato?.vagas?.titulo
  const empresasInfo = Array.isArray(contrato?.vagas)
    ? contrato?.vagas[0]?.empresas
    : contrato?.vagas?.empresas
  const nomeEmpresa = Array.isArray(empresasInfo)
    ? empresasInfo[0]?.nome_empresa
    : empresasInfo?.nome_empresa

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Button variant="ghost" className="mb-6 hover:bg-slate-100" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>

      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="bg-primary/5 border-b border-primary/10 pb-6">
          <CardTitle className="text-2xl text-primary flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Check-in Operacional
          </CardTitle>
          <CardDescription className="text-base text-slate-600">
            Registre sua entrada e saída no local do evento/serviço.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 space-y-8">
          {contrato && (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <h3 className="font-semibold text-lg text-slate-800 mb-1">
                {tituloVaga || 'Vaga Indisponível'}
              </h3>
              <p className="text-slate-600 flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {nomeEmpresa || 'Empresa Indisponível'}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              size="lg"
              className="h-28 text-lg bg-blue-600 hover:bg-blue-700 w-full flex flex-col gap-2 transition-all shadow-md hover:shadow-lg"
              onClick={() => handleRegister('Entrada')}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <LogIn className="h-6 w-6" />
              )}
              <span>Fazer Check-in</span>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="h-28 text-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-50 w-full flex flex-col gap-2 transition-all shadow-sm hover:shadow-md"
              onClick={() => handleRegister('Saída')}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <LogOut className="h-6 w-6" />
              )}
              <span>Fazer Check-out</span>
            </Button>
          </div>

          <div className="mt-8">
            <h4 className="font-medium text-slate-700 mb-4 border-b pb-2">Registros de Hoje</h4>
            {checkins.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-6 bg-slate-50 rounded-lg border border-dashed">
                Nenhum registro encontrado para hoje.
              </p>
            ) : (
              <div className="space-y-3">
                {checkins.map((checkin) => (
                  <div
                    key={checkin.id}
                    className="flex justify-between items-center p-4 bg-white border rounded-lg shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-full ${checkin.tipo === 'Entrada' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}
                      >
                        {checkin.tipo === 'Entrada' ? (
                          <LogIn className="h-5 w-5" />
                        ) : (
                          <LogOut className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{checkin.tipo}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {Number(checkin.latitude).toFixed(4)},{' '}
                          {Number(checkin.longitude).toFixed(4)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-slate-700">
                        {new Date(checkin.data_hora).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
