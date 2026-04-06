import { useState, useEffect, useMemo } from 'react'
import { format, subDays, isAfter } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AlertTriangle, CheckCircle, Clock, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { fetchAlertas, updateAlertaStatus, Alerta } from '@/services/alertas'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminAlerts() {
  const navigate = useNavigate()
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)

  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos')

  const { toast } = useToast()

  const loadAlertas = async () => {
    setLoading(true)
    const data = await fetchAlertas()
    setAlertas(data)
    setLoading(false)
  }

  useEffect(() => {
    loadAlertas()
  }, [])

  const handleResolver = async (id: string) => {
    try {
      await updateAlertaStatus(id, 'Resolvido')
      toast({ title: 'Sucesso', description: 'Alerta marcado como resolvido.' })
      setAlertas((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'Resolvido' } : a)))
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o alerta.',
        variant: 'destructive',
      })
    }
  }

  const alertasFiltrados = useMemo(() => {
    return alertas.filter((alerta) => {
      if (
        filtroTipo !== 'todos' &&
        !alerta.tipo_alerta.toLowerCase().includes(filtroTipo.toLowerCase())
      )
        return false

      const currentStatus = alerta.status || 'Pendente'
      if (filtroStatus !== 'todos' && currentStatus.toLowerCase() !== filtroStatus.toLowerCase())
        return false

      if (filtroPeriodo !== 'todos' && alerta.data_hora_alerta) {
        const date = new Date(alerta.data_hora_alerta)
        const now = new Date()
        if (filtroPeriodo === '7' && !isAfter(date, subDays(now, 7))) return false
        if (filtroPeriodo === '30' && !isAfter(date, subDays(now, 30))) return false
      }

      return true
    })
  }, [alertas, filtroTipo, filtroStatus, filtroPeriodo])

  return (
    <div className="container mx-auto p-4 max-w-7xl animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0 text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              Dashboard de Alertas
            </h1>
            <p className="text-blue-600/80 mt-1">
              Monitore e gerencie atrasos, inconsistências e denúncias.
            </p>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Tipo de Alerta
              </label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="atraso">Atrasos</SelectItem>
                  <SelectItem value="inconsistência">Inconsistências</SelectItem>
                  <SelectItem value="denúncia">Denúncias</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Status</label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="pendente">Pendentes</SelectItem>
                  <SelectItem value="resolvido">Resolvidos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Período</label>
              <Select value={filtroPeriodo} onValueChange={setFiltroPeriodo}>
                <SelectTrigger>
                  <SelectValue placeholder="Qualquer período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Qualquer período</SelectItem>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Lista de Alertas</CardTitle>
          <CardDescription>
            Mostrando {alertasFiltrados.length} alerta(s) de acordo com os filtros
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Tipo / Data</TableHead>
                  <TableHead>Envolvidos</TableHead>
                  <TableHead className="max-w-[200px]">Detalhes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16 mt-2" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24 mt-2" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-24 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : alertasFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                      Nenhum alerta encontrado com os filtros atuais.
                    </TableCell>
                  </TableRow>
                ) : (
                  alertasFiltrados.map((alerta) => {
                    const status = alerta.status || 'Pendente'
                    const isPendente = status.toLowerCase() === 'pendente'

                    return (
                      <TableRow key={alerta.id}>
                        <TableCell className="font-mono text-xs text-slate-500">
                          {alerta.id.substring(0, 8)}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-900">{alerta.tipo_alerta}</div>
                          <div className="text-xs text-slate-500 flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {alerta.data_hora_alerta
                              ? format(new Date(alerta.data_hora_alerta), 'dd/MM/yyyy HH:mm', {
                                  locale: ptBR,
                                })
                              : 'N/D'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="font-medium text-slate-700">F:</span>{' '}
                            {alerta.freelancers?.nome_completo || 'N/D'}
                          </div>
                          <div className="text-sm mt-1">
                            <span className="font-medium text-slate-700">E:</span>{' '}
                            {alerta.contratos?.empresas?.nome_empresa || 'N/D'}
                          </div>
                        </TableCell>
                        <TableCell
                          className="max-w-[200px] truncate text-sm text-slate-600"
                          title={alerta.mensagem}
                        >
                          {alerta.mensagem}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="default"
                            className={
                              isPendente
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-green-500 hover:bg-green-600'
                            }
                          >
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {isPendente ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                              onClick={() => handleResolver(alerta.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolver
                            </Button>
                          ) : (
                            <span className="text-sm text-slate-400 italic">Resolvido</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
