import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
} from 'lucide-react'

export default function VagasFeed() {
  const { user } = useAuth()
  const [vagas, setVagas] = useState<any[]>([])
  const [documentos, setDocumentos] = useState<any[]>([])
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
