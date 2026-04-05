import { useEffect, useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { fetchRelatorioHoras, RelatorioHora } from '@/services/relatorios'

export default function RelatorioHoras() {
  const [data, setData] = useState<RelatorioHora[]>([])
  const [loading, setLoading] = useState(true)
  const [filterContrato, setFilterContrato] = useState('')
  const [filterData, setFilterData] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const { data: res, error } = await fetchRelatorioHoras()
    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o relatório.',
        variant: 'destructive',
      })
    } else if (res) {
      setData(res)
    }
    setLoading(false)
  }

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchContrato =
        item.vaga_titulo.toLowerCase().includes(filterContrato.toLowerCase()) ||
        item.freelancer_nome.toLowerCase().includes(filterContrato.toLowerCase())

      let matchData = true
      if (filterData && item.data_evento) {
        const itemDate = item.data_evento.split('T')[0]
        matchData = itemDate === filterData
      } else if (filterData && !item.data_evento) {
        matchData = false
      }

      return matchContrato && matchData
    })
  }, [data, filterContrato, filterData])

  const formatHora = (isoString: string | null) => {
    if (!isoString) return '-'
    return format(parseISO(isoString), 'HH:mm', { locale: ptBR })
  }

  const formatDate = (isoString: string | null) => {
    if (!isoString) return '-'
    return format(parseISO(isoString), 'dd/MM/yyyy', { locale: ptBR })
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-blue-900">
            Relatório de Horas Trabalhadas
          </h1>
          <p className="text-muted-foreground mt-1">
            Auditoria de jornada e presença dos freelancers
          </p>
        </div>
      </div>

      <Card className="border-blue-100 shadow-sm">
        <CardHeader className="bg-blue-50/50 pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
            <Search className="w-5 h-5" />
            Filtros de Busca
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-slate-700">Contrato / Freelancer</label>
              <Input
                placeholder="Buscar por nome da vaga ou freelancer..."
                value={filterContrato}
                onChange={(e) => setFilterContrato(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="md:w-64 space-y-2">
              <label className="text-sm font-medium text-slate-700">Data do Evento</label>
              <Input
                type="date"
                value={filterData}
                onChange={(e) => setFilterData(e.target.value)}
                className="bg-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-blue-50">
              <TableRow>
                <TableHead className="font-semibold text-blue-900">Freelancer</TableHead>
                <TableHead className="font-semibold text-blue-900">Vaga / Contrato</TableHead>
                <TableHead className="font-semibold text-blue-900">Data do Evento</TableHead>
                <TableHead className="font-semibold text-blue-900">Entrada</TableHead>
                <TableHead className="font-semibold text-blue-900">Saída</TableHead>
                <TableHead className="font-semibold text-blue-900 whitespace-nowrap">
                  Total (Horas)
                </TableHead>
                <TableHead className="font-semibold text-blue-900">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    Carregando relatório...
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => (
                  <TableRow key={item.contrato_id} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-900 whitespace-nowrap">
                      {item.freelancer_nome}
                    </TableCell>
                    <TableCell className="text-slate-600 max-w-[200px] truncate">
                      {item.vaga_titulo}
                    </TableCell>
                    <TableCell className="text-slate-600 whitespace-nowrap">
                      {formatDate(item.data_evento)}
                    </TableCell>
                    <TableCell className="text-slate-600 font-mono">
                      {formatHora(item.entrada)}
                    </TableCell>
                    <TableCell className="text-slate-600 font-mono">
                      {formatHora(item.saida)}
                    </TableCell>
                    <TableCell className="font-semibold text-blue-700">
                      {item.totalHoras > 0 ? item.totalHoras.toFixed(2) + 'h' : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          item.status === 'Completo'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : item.status === 'Em Andamento'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                        }
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
