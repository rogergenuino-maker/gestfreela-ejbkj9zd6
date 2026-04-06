import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getMetricsData, MetricsData } from '@/services/metrics'
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Calendar as CalendarIcon,
  Users,
  Building,
  AlertCircle,
  DollarSign,
  Star,
  CheckCircle,
  FileText,
} from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { Download } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import * as Papa from 'papaparse'
import * as XLSX from 'xlsx'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'

export default function MetricsDashboard() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (date?.from && date?.to) {
      setLoading(true)
      getMetricsData(date.from, date.to)
        .then(setMetrics)
        .finally(() => setLoading(false))
    }
  }, [date])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const handleExport = (formatType: 'csv' | 'excel') => {
    if (!metrics || !date?.from) return

    const dataToExport = [
      {
        'Período Início': format(date.from, 'dd/MM/yyyy'),
        'Período Fim': date.to ? format(date.to, 'dd/MM/yyyy') : format(date.from, 'dd/MM/yyyy'),
        'Receita Total (R$)': metrics.receitaTotal,
        'Total de Contratos': metrics.totalContratos,
        'Contratos Ativos': metrics.contratosAtivos,
        'Contratos Concluídos': metrics.contratosConcluidos,
        'Contratos Cancelados': metrics.contratosCancelados,
        'Total de Freelancers': metrics.totalFreelancers,
        'Freelancers Aprovados': metrics.freelancersAprovados,
        'Freelancers Pendentes': metrics.freelancersPendentes,
        'Total de Empresas': metrics.totalEmpresas,
        'Taxa de Conclusão (%)': Number(metrics.taxaConclusao.toFixed(2)),
        'Avaliação Média': Number(metrics.avaliacaoMedia.toFixed(2)),
        'Denúncias Pendentes': metrics.denunciasPendentes,
      },
    ]

    if (formatType === 'csv') {
      const csv = Papa.unparse(dataToExport)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `metricas_${format(new Date(), 'yyyy-MM-dd')}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      const worksheet = XLSX.utils.json_to_sheet(dataToExport)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Métricas')
      XLSX.writeFile(workbook, `metricas_${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
    }
  }

  const chartConfig = {
    revenue: {
      label: 'Receita',
      color: '#3b82f6', // blue-500
    },
    ativos: {
      label: 'Ativos',
      color: '#3b82f6', // blue-500
    },
    concluidos: {
      label: 'Concluídos',
      color: '#10b981', // emerald-500
    },
    cancelados: {
      label: 'Cancelados',
      color: '#ef4444', // red-500
    },
    freelancers: {
      label: 'Freelancers',
      color: '#3b82f6', // blue-500
    },
    empresas: {
      label: 'Empresas',
      color: '#6366f1', // indigo-500
    },
  }

  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-blue-900 tracking-tight">Dashboard de Métricas</h1>
          <p className="text-blue-600/80 mt-1">
            Acompanhe os indicadores de desempenho da plataforma.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={'outline'}
                className={cn(
                  'w-full sm:w-[300px] justify-start text-left font-normal border-blue-200 text-blue-900 hover:bg-blue-50',
                  !date && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "dd 'de' MMM, yyyy", { locale: ptBR })} -{' '}
                      {format(date.to, "dd 'de' MMM, yyyy", { locale: ptBR })}
                    </>
                  ) : (
                    format(date.from, "dd 'de' MMM, yyyy", { locale: ptBR })
                  )
                ) : (
                  <span>Selecione o período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading || !metrics}
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar Relatório
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('csv')} className="cursor-pointer">
                Exportar como CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')} className="cursor-pointer">
                Exportar como Excel (.xlsx)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {loading || !metrics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl bg-blue-100/50" />
          ))}
        </div>
      ) : (
        <>
          {/* KPIs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-blue-600 text-white border-blue-700 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-blue-100">Receita Total</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-200" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(metrics.receitaTotal)}</div>
                <p className="text-xs text-blue-200 mt-1">Soma de pagamentos processados</p>
              </CardContent>
            </Card>

            <Card className="border-blue-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">Contratos</CardTitle>
                <FileText className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-950">{metrics.totalContratos}</div>
                <div className="text-xs text-blue-600 mt-1 flex gap-2">
                  <span className="text-blue-500">{metrics.contratosAtivos} ativos</span>
                  <span className="text-emerald-500">{metrics.contratosConcluidos} concl.</span>
                  <span className="text-red-500">{metrics.contratosCancelados} canc.</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">Freelancers</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-950">{metrics.totalFreelancers}</div>
                <div className="text-xs text-blue-600 mt-1 flex gap-2">
                  <span className="text-emerald-500">{metrics.freelancersAprovados} aprovados</span>
                  <span className="text-amber-500">{metrics.freelancersPendentes} pendentes</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">Empresas</CardTitle>
                <Building className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-950">{metrics.totalEmpresas}</div>
                <p className="text-xs text-blue-600 mt-1">Total de empresas cadastradas</p>
              </CardContent>
            </Card>

            <Card className="border-blue-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">
                  Taxa de Conclusão
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-950">
                  {metrics.taxaConclusao.toFixed(1)}%
                </div>
                <p className="text-xs text-blue-600 mt-1">Contratos finalizados com sucesso</p>
              </CardContent>
            </Card>

            <Card className="border-blue-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">Avaliação Média</CardTitle>
                <Star className="h-4 w-4 text-amber-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-950">
                  {metrics.avaliacaoMedia.toFixed(1)}{' '}
                  <span className="text-sm font-normal text-muted-foreground">/ 5.0</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">Média das avaliações dos freelancers</p>
              </CardContent>
            </Card>

            <Card className="border-blue-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">
                  Denúncias Pendentes
                </CardTitle>
                <AlertCircle
                  className={cn(
                    'h-4 w-4',
                    metrics.denunciasPendentes > 0 ? 'text-red-500' : 'text-blue-500',
                  )}
                />
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    'text-2xl font-bold',
                    metrics.denunciasPendentes > 0 ? 'text-red-600' : 'text-blue-950',
                  )}
                >
                  {metrics.denunciasPendentes}
                </div>
                <p className="text-xs text-blue-600 mt-1">Total de denúncias no período</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
            <Card className="border-blue-100 shadow-sm lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-blue-900">Evolução de Receita</CardTitle>
                <CardDescription>Receita processada no período selecionado</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics.revenueByDate.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <LineChart
                      data={metrics.revenueByDate}
                      margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(val) => val.substring(0, 5)}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `R$ ${val}`}
                        width={80}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--color-revenue)"
                        strokeWidth={3}
                        dot={{ r: 4, fill: 'var(--color-revenue)' }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-blue-400">
                    Nenhum dado de receita no período
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-blue-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-blue-900">Status dos Contratos</CardTitle>
                <CardDescription>Distribuição de contratos no período</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics.contractsByStatus.length > 0 ? (
                  <ChartContainer
                    config={chartConfig}
                    className="h-[300px] w-full [&_.recharts-pie-label-text]:fill-foreground"
                  >
                    <PieChart>
                      <Pie
                        data={metrics.contractsByStatus}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={90}
                        strokeWidth={2}
                        stroke="white"
                      >
                        {metrics.contractsByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                      <ChartLegend content={<ChartLegendContent />} />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-blue-400">
                    Nenhum contrato no período
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-blue-100 shadow-sm lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-blue-900">Novos Cadastros</CardTitle>
                <CardDescription>Crescimento de usuários na plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics.usersByDate.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <BarChart
                      data={metrics.usersByDate}
                      margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(val) => val.substring(0, 5)}
                      />
                      <YAxis tickLine={false} axisLine={false} width={40} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar
                        dataKey="freelancers"
                        fill="var(--color-freelancers)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar dataKey="empresas" fill="var(--color-empresas)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-blue-400">
                    Nenhum novo usuário no período
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
