import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Calendar, DollarSign, Search, Briefcase } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getVagas } from '@/services/vagas'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Skeleton } from '@/components/ui/skeleton'

export default function VagasFeed() {
  const [vagas, setVagas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [natureza, setNatureza] = useState('todas')
  const [minValor, setMinValor] = useState('')
  const [maxValor, setMaxValor] = useState('')

  useEffect(() => {
    const fetchVagas = async () => {
      setLoading(true)
      const { data } = await getVagas()
      if (data) setVagas(data)
      setLoading(false)
    }
    fetchVagas()
  }, [])

  const filteredVagas = useMemo(() => {
    return vagas.filter((vaga) => {
      if (natureza !== 'todas' && vaga.natureza?.toLowerCase() !== natureza.toLowerCase())
        return false
      if (minValor && vaga.valor_remuneracao < parseFloat(minValor)) return false
      if (maxValor && vaga.valor_remuneracao > parseFloat(maxValor)) return false
      return true
    })
  }, [vagas, natureza, minValor, maxValor])

  return (
    <div className="container mx-auto py-8 max-w-7xl px-4 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Feed de Vagas</h1>
          <p className="text-slate-500 mt-1">Encontre as melhores oportunidades para você.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1.5 block text-slate-700">Natureza</label>
          <Select value={natureza} onValueChange={setNatureza}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as Vagas</SelectItem>
              <SelectItem value="evento">Evento</SelectItem>
              <SelectItem value="diária">Diária</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium mb-1.5 block text-slate-700">
            Valor Mínimo (R$)
          </label>
          <Input
            type="number"
            placeholder="Ex: 100"
            value={minValor}
            onChange={(e) => setMinValor(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium mb-1.5 block text-slate-700">
            Valor Máximo (R$)
          </label>
          <Input
            type="number"
            placeholder="Ex: 1000"
            value={maxValor}
            onChange={(e) => setMaxValor(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredVagas.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">Nenhuma vaga encontrada</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2">
            Tente ajustar os filtros para encontrar mais oportunidades de trabalho.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVagas.map((vaga) => (
            <Card
              key={vaga.id}
              className="flex flex-col hover:shadow-md transition-shadow duration-200 border-slate-200"
            >
              <CardHeader className="pb-4 border-b border-slate-50">
                <div className="flex justify-between items-start mb-2">
                  <Badge
                    variant={vaga.natureza?.toLowerCase() === 'evento' ? 'default' : 'secondary'}
                    className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                  >
                    {vaga.natureza}
                  </Badge>
                  <span className="text-xs font-medium text-slate-400">
                    {vaga.created_at
                      ? format(new Date(vaga.created_at), "dd 'de' MMM", { locale: ptBR })
                      : ''}
                  </span>
                </div>
                <CardTitle className="text-xl line-clamp-2 text-slate-900">{vaga.titulo}</CardTitle>
                {vaga.empresa && (
                  <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                    <Briefcase className="w-3.5 h-3.5" /> {vaga.empresa.nome_empresa}
                  </p>
                )}
              </CardHeader>
              <CardContent className="pt-4 flex-grow space-y-3">
                <p className="text-sm text-slate-600 line-clamp-3">{vaga.escopo_trabalho}</p>
                <div className="pt-2 space-y-2">
                  {vaga.endereco_vaga && (
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{vaga.endereco_vaga}</span>
                    </div>
                  )}
                  {vaga.data_inicio && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>
                        {format(new Date(vaga.data_inicio), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-b-xl">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  {vaga.valor_remuneracao
                    ? vaga.valor_remuneracao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                    : 'A combinar'}
                </div>
                <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Link to={`/vagas/${vaga.id}`}>Ver Detalhes</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
