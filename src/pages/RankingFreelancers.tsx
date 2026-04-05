import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Star, Trophy, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

interface RankingData {
  id: string
  nome_completo: string
  media_avaliacoes: number
  total_avaliacoes: number
  contratos_concluidos: number
  status_conta: string
}

export default function RankingFreelancers() {
  const [ranking, setRanking] = useState<RankingData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetchRanking()
  }, [])

  const fetchRanking = async () => {
    try {
      const { data: freelancers, error: fError } = await supabase
        .from('freelancers')
        .select('id, nome_completo, user_id')

      if (fError) throw fError

      const { data: avaliacoes, error: aError } = await supabase
        .from('avaliacoes_rating')
        .select('freelancer_id, nota_estrelas')

      if (aError) throw aError

      const { data: contratos, error: cError } = await supabase
        .from('contratos')
        .select('freelancer_id, status')
        .in('status', ['concluido', 'concluído', 'finalizado', 'encerrado'])

      if (cError) throw cError

      const { data: perfis, error: pError } = await supabase
        .from('perfis')
        .select('id, status_conta')

      if (pError) throw pError

      const aggregated: RankingData[] = freelancers.map((freela) => {
        const freelaAvaliacoes = avaliacoes.filter(
          (a) => a.freelancer_id === freela.id && a.nota_estrelas,
        )
        const somaNotas = freelaAvaliacoes.reduce((acc, curr) => acc + (curr.nota_estrelas || 0), 0)
        const media = freelaAvaliacoes.length > 0 ? somaNotas / freelaAvaliacoes.length : 0

        const freelaContratos = contratos.filter((c) => c.freelancer_id === freela.id)

        const perfil = perfis.find((p) => p.id === freela.user_id)

        return {
          id: freela.id,
          nome_completo: freela.nome_completo,
          media_avaliacoes: Number(media.toFixed(1)),
          total_avaliacoes: freelaAvaliacoes.length,
          contratos_concluidos: freelaContratos.length,
          status_conta: perfil?.status_conta || 'ativo',
        }
      })

      aggregated.sort((a, b) => b.media_avaliacoes - a.media_avaliacoes)
      setRanking(aggregated)
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o ranking de freelancers.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredRanking = ranking.filter((r) =>
    r.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Ranking de Freelancers
          </h1>
          <p className="text-blue-700/80 mt-1">
            Acompanhe o desempenho e as avaliações dos profissionais da plataforma.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
          <Input
            placeholder="Buscar pelo nome do profissional..."
            className="pl-9 border-blue-200 focus-visible:ring-blue-500 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-blue-100 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-blue-500 font-medium">
              Carregando métricas de ranking...
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-blue-50">
                <TableRow className="hover:bg-blue-50 border-b-blue-100">
                  <TableHead className="w-20 text-center font-semibold text-blue-900">
                    Posição
                  </TableHead>
                  <TableHead className="font-semibold text-blue-900">Profissional</TableHead>
                  <TableHead className="font-semibold text-blue-900">Avaliação Média</TableHead>
                  <TableHead className="font-semibold text-blue-900 text-center">
                    Contratos Concluídos
                  </TableHead>
                  <TableHead className="font-semibold text-blue-900 text-right pr-6">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRanking.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center p-12 text-slate-500">
                      Nenhum freelancer encontrado na busca.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRanking.map((freela, index) => (
                    <TableRow
                      key={freela.id}
                      className="hover:bg-slate-50/80 transition-colors border-b-slate-100"
                    >
                      <TableCell className="text-center font-bold text-slate-400">
                        {index + 1}º
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {freela.nome_completo}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            <Star
                              className={`h-4 w-4 ${freela.media_avaliacoes > 0 ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
                            />
                            <span className="ml-1 font-semibold text-slate-700">
                              {freela.media_avaliacoes > 0 ? freela.media_avaliacoes : 'N/A'}
                            </span>
                          </div>
                          {freela.total_avaliacoes > 0 && (
                            <span className="text-xs text-slate-500">
                              ({freela.total_avaliacoes} avaliações)
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="secondary"
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium border border-blue-100"
                        >
                          {freela.contratos_concluidos} concluídos
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Badge
                          className={
                            freela.status_conta?.toLowerCase() === 'ativo'
                              ? 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                          }
                          variant="outline"
                        >
                          {freela.status_conta?.toUpperCase() || 'ATIVO'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
