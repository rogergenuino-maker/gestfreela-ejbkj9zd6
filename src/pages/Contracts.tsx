import { useEffect, useState, useMemo } from 'react'
import { format, subMonths, differenceInHours } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DateRange } from 'react-day-picker'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { cancelarContrato } from '@/services/contratos'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import {
  FileText,
  Ban,
  DollarSign,
  TrendingDown,
  Eye,
  AlertCircle,
  CalendarIcon,
  Search,
  X,
} from 'lucide-react'

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

export default function Contracts() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedContract, setSelectedContract] = useState<any | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const [cancelPreview, setCancelPreview] = useState<any | null>(null)
  const [isCancelOpen, setIsCancelOpen] = useState(false)

  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [searchName, setSearchName] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchContracts = async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data: empresa } = await supabase
        .from('empresas')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (empresa) {
        const { data } = await supabase
          .from('contratos')
          .select(`
            *,
            vaga:vagas(*),
            freelancer:freelancers(*)
          `)
          .eq('empresa_id', empresa.id)
          .order('created_at', { ascending: false })
        setContracts(data || [])
      }
    } catch (error) {
      console.error('Error fetching contracts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContracts()
  }, [user])

  const metrics = useMemo(() => {
    let active = 0,
      canceled = 0,
      retained = 0,
      refunded = 0

    contracts.forEach((c) => {
      if (c.status === 'ativo' || c.status === 'Aguardando_Aceite') active++
      if (c.status === 'cancelado') {
        canceled++
        const vagaValor = c.vaga?.valor_remuneracao || 0
        const estornado = c.valor_estornado || 0
        refunded += estornado
        if (c.penalidade_aplicada) {
          retained += vagaValor - estornado
        }
      }
    })
    return { active, canceled, retained, refunded }
  }, [contracts])

  const chartData = useMemo(() => {
    const data = Array.from({ length: 6 })
      .map((_, i) => {
        const d = subMonths(new Date(), i)
        return { month: format(d, 'MMM/yy', { locale: ptBR }), count: 0, date: d }
      })
      .reverse()

    contracts.forEach((c) => {
      if (c.status === 'cancelado') {
        // Fallback to created_at if no specific cancel date is recorded,
        // though updated_at is better if available. Using created_at for mock logic
        const monthStr = format(new Date(c.created_at), 'MMM/yy', { locale: ptBR })
        const monthItem = data.find((m) => m.month === monthStr)
        if (monthItem) monthItem.count++
      }
    })
    return data
  }, [contracts])

  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      const nameMatch =
        c.freelancer?.nome_completo?.toLowerCase().includes(searchName.toLowerCase()) ?? false
      if (searchName && !nameMatch) return false

      if (statusFilter !== 'all' && c.status?.toLowerCase() !== statusFilter.toLowerCase())
        return false

      if (dateRange?.from) {
        const contractDate = c.vaga?.data_inicio ? new Date(c.vaga.data_inicio) : null
        if (!contractDate) return false

        const fromDate = new Date(dateRange.from)
        fromDate.setHours(0, 0, 0, 0)

        if (!dateRange.to) {
          if (contractDate < fromDate) return false
        } else {
          const toDate = new Date(dateRange.to)
          toDate.setHours(23, 59, 59, 999)
          if (contractDate < fromDate || contractDate > toDate) return false
        }
      }
      return true
    })
  }, [contracts, searchName, statusFilter, dateRange])

  const clearFilters = () => {
    setSearchName('')
    setStatusFilter('all')
    setDateRange(undefined)
  }

  const hasActiveFilters = searchName !== '' || statusFilter !== 'all' || dateRange !== undefined

  const handleOpenCancel = (contract: any) => {
    if (!contract.vaga?.data_inicio) return

    const dataInicio = new Date(contract.vaga.data_inicio)
    const hoursDiff = differenceInHours(dataInicio, new Date())
    const valor = contract.vaga.valor_remuneracao || 0

    let penalidadeAplicada = false
    let valorEstornado = valor

    if (hoursDiff <= 36) {
      penalidadeAplicada = true
      valorEstornado = valor * 0.9 // 10% penalty
    }

    setCancelPreview({ contract, hoursDiff, penalidadeAplicada, valorEstornado, valor })
    setIsCancelOpen(true)
  }

  const confirmCancel = async () => {
    if (!cancelPreview) return
    const { contract, penalidadeAplicada, valorEstornado } = cancelPreview

    const { error } = await cancelarContrato(contract.id, penalidadeAplicada, valorEstornado)

    if (error) {
      toast({
        title: 'Erro ao cancelar',
        description: error.message,
        variant: 'destructive',
      })
      return
    }

    toast({
      title: 'Contrato Cancelado',
      description: 'Notificação push enviada ao freelancer.',
    })

    setIsCancelOpen(false)
    if (isDetailOpen) setIsDetailOpen(false)
    fetchContracts()
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'ativo':
        return <Badge className="bg-green-500 hover:bg-green-600">Ativo</Badge>
      case 'cancelado':
        return <Badge variant="destructive">Cancelado</Badge>
      case 'aguardando_aceite':
        return <Badge variant="secondary">Aguardando Aceite</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard de Gestão</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie seus contratos ativos, cancelamentos e métricas financeiras.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cancelamentos</CardTitle>
            <Ban className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.canceled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxas Retidas</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.retained)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estornos Realizados</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.refunded)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart & Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Cancelamentos por Mês</CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ cancelamentos: { label: 'Cancelamentos', color: 'hsl(var(--primary))' } }}
              className="h-[250px] w-full"
            >
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-cancelamentos)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 overflow-hidden flex flex-col">
          <CardHeader className="space-y-4 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Contratos Recentes</CardTitle>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 px-2 lg:px-3 text-muted-foreground hover:text-foreground"
                >
                  <X className="mr-2 h-4 w-4" />
                  Limpar Filtros
                </Button>
              )}
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar freelancer..."
                  className="pl-8 bg-background"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px] bg-background">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="aguardando_aceite">Aguardando Aceite</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={'outline'}
                    className={cn(
                      'w-full md:w-[240px] justify-start text-left font-normal bg-background',
                      !dateRange && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'dd/MM/yy')} - {format(dateRange.to, 'dd/MM/yy')}
                        </>
                      ) : (
                        format(dateRange.from, 'dd/MM/yy')
                      )
                    ) : (
                      <span>Filtrar por período</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={1}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Freelancer</TableHead>
                    <TableHead>Vaga</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {hasActiveFilters
                          ? 'Nenhum contrato encontrado para os filtros aplicados.'
                          : 'Nenhum contrato encontrado.'}
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredContracts.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={c.freelancer?.foto_perfil || ''} />
                            <AvatarFallback>
                              {c.freelancer?.nome_completo?.charAt(0) || 'F'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {c.freelancer?.nome_completo || 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {c.vaga?.titulo || 'Vaga Excluída'}
                      </TableCell>
                      <TableCell>
                        {c.vaga?.data_inicio
                          ? format(new Date(c.vaga.data_inicio), "dd/MM/yyyy 'às' HH:mm")
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{getStatusBadge(c.status)}</TableCell>
                      <TableCell>{formatCurrency(c.vaga?.valor_remuneracao || 0)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedContract(c)
                              setIsDetailOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4 text-primary" />
                          </Button>
                          {c.status !== 'cancelado' && (
                            <Button variant="ghost" size="icon" onClick={() => handleOpenCancel(c)}>
                              <Ban className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contract Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Contrato</DialogTitle>
            <DialogDescription>
              Informações completas sobre o acordo de prestação de serviços.
            </DialogDescription>
          </DialogHeader>
          {selectedContract && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={selectedContract.freelancer?.foto_perfil || ''} />
                  <AvatarFallback className="text-lg">
                    {selectedContract.freelancer?.nome_completo?.charAt(0) || 'F'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedContract.freelancer?.nome_completo}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedContract.freelancer?.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
                <div>
                  <span className="text-muted-foreground block mb-1">Vaga</span>
                  <span className="font-medium">{selectedContract.vaga?.titulo}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Status</span>
                  {getStatusBadge(selectedContract.status)}
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Início</span>
                  <span className="font-medium">
                    {selectedContract.vaga?.data_inicio
                      ? format(new Date(selectedContract.vaga.data_inicio), 'dd/MM/yyyy HH:mm')
                      : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Valor</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(selectedContract.vaga?.valor_remuneracao || 0)}
                  </span>
                </div>
              </div>

              {selectedContract.status === 'cancelado' && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                  <strong>Detalhes do Cancelamento:</strong>
                  <br />
                  Valor Estornado: {formatCurrency(selectedContract.valor_estornado || 0)}
                  <br />
                  Penalidade Aplicada: {selectedContract.penalidade_aplicada ? 'Sim (10%)' : 'Não'}
                </div>
              )}

              {selectedContract.status !== 'cancelado' && (
                <Button
                  variant="destructive"
                  className="w-full mt-4"
                  onClick={() => handleOpenCancel(selectedContract)}
                >
                  <Ban className="mr-2 h-4 w-4" /> Cancelar Evento
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Modal */}
      <AlertDialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Confirmar Cancelamento
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base space-y-3 pt-2">
              {cancelPreview?.penalidadeAplicada ? (
                <>
                  <p>
                    <strong>Atenção:</strong> Cancelamento com menos de 36h do início do evento.
                  </p>
                  <p className="text-destructive font-medium">
                    Será aplicada multa de 10% ao freelancer e retenção da taxa da plataforma.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-green-600 font-medium">
                    Cancelamento sem custos. Estorno de 100%.
                  </p>
                  <p>O evento está a mais de 36h de distância.</p>
                </>
              )}

              <div className="bg-muted p-3 rounded-md text-sm mt-4">
                <div className="flex justify-between mb-1">
                  <span>Valor Original:</span>
                  <span>{formatCurrency(cancelPreview?.valor || 0)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Valor do Estorno:</span>
                  <span
                    className={
                      cancelPreview?.penalidadeAplicada ? 'text-destructive' : 'text-green-600'
                    }
                  >
                    {formatCurrency(cancelPreview?.valorEstornado || 0)}
                  </span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              className="bg-destructive hover:bg-destructive/90"
            >
              Confirmar Cancelamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
