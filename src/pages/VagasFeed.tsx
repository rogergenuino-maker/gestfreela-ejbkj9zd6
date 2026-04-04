import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Briefcase, MapPin, Calendar, DollarSign, AlertTriangle } from 'lucide-react'

export default function VagasFeed() {
  const { user } = useAuth()
  const [vagas, setVagas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState<boolean>(false)

  useEffect(() => {
    const loadVagas = async () => {
      if (!user) return

      const { data: fData } = await supabase
        .from('freelancers')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (fData) {
        const today = new Date().toISOString().split('T')[0]
        const { data: docs } = await supabase
          .from('documentos_validacao')
          .select('id')
          .eq('freelancer_id', fData.id)
          .eq('status_verificacao', 'aprovado')
          .gte('data_validade', today)

        if (docs && docs.length > 0) {
          setHasAccess(true)

          const { data: vagasData } = await supabase
            .from('vagas')
            .select('*, empresas(nome_empresa)')
            .eq('status', 'aberta')
            .order('created_at', { ascending: false })

          if (vagasData) setVagas(vagasData)
        } else {
          setHasAccess(false)
        }
      }
      setLoading(false)
    }

    loadVagas()
  }, [user])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="max-w-2xl mx-auto mt-16 animate-in fade-in zoom-in-95 duration-500">
        <Card className="border-amber-200 bg-gradient-to-b from-amber-50 to-white shadow-md">
          <CardHeader className="text-center pt-10">
            <div className="mx-auto bg-amber-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6 shadow-sm">
              <AlertTriangle className="h-10 w-10 text-amber-600" />
            </div>
            <CardTitle className="text-amber-900 text-3xl font-bold tracking-tight">
              Acesso Restrito
            </CardTitle>
            <CardDescription className="text-amber-700/80 text-lg mt-3 max-w-lg mx-auto leading-relaxed">
              Para visualizar as vagas disponíveis, você precisa enviar seus documentos obrigatórios
              e aguardar a aprovação da nossa equipe.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-10 pt-4">
            <Button
              asChild
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20 px-8 py-6 text-lg h-auto rounded-full transition-all hover:scale-105"
            >
              <Link to="/freelancers/documentos">Enviar Documentos Agora</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('pt-BR')
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

      {vagas.length === 0 ? (
        <Card className="border-dashed border-2 bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-white p-6 rounded-full shadow-sm mb-4">
              <Briefcase className="h-12 w-12 text-slate-300" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900">
              Nenhuma vaga aberta no momento
            </h3>
            <p className="text-slate-500 mt-2 text-lg">
              Fique de olho! Novas oportunidades podem surgir a qualquer momento.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vagas.map((vaga) => (
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
                    <span>
                      {formatDate(vaga.data_inicio)}{' '}
                      {vaga.data_fim ? `até ${formatDate(vaga.data_fim)}` : ''}
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
                <Button className="w-full bg-slate-900 hover:bg-blue-700 text-white font-medium py-5 shadow-sm transition-colors group-hover:shadow-md rounded-xl">
                  Candidatar-se
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
