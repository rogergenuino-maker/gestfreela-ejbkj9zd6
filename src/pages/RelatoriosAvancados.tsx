import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Loader2, ArrowLeft } from 'lucide-react'
import { fetchAdvancedReports, AdvancedReportsData } from '@/services/relatorios-avancados'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'

export default function RelatoriosAvancados() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    return d.toISOString().split('T')[0]
  })

  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0]
  })

  const [statusFilter, setStatusFilter] = useState('todos')
  const [tipoFilter, setTipoFilter] = useState('todos')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<AdvancedReportsData | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await fetchAdvancedReports(startDate, endDate, statusFilter, tipoFilter)
      setData(result)
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao carregar relatórios',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const tendenciaConfig = {
    receita: { label: 'Receita (R$)', color: 'hsl(var(--chart-1))' },
    contratos: { label: 'Contratos', color: 'hsl(var(--chart-2))' },
  }

  const statusConfig = {
    quantidade: { label: 'Quantidade' },
  }

  const denunciaConfig = {
    frequencia: { label: 'Frequência', color: 'hsl(var(--chart-3))' },
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
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
            <h1 className="text-3xl font-bold tracking-tight text-blue-900">
              Relatórios Avançados
            </h1>
            <p className="text-blue-600/80 mt-1">
              Análise profunda de tendências, performance e métricas.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-auto"
          />
          <span className="text-muted-foreground">até</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-auto"
          />

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Status</SelectItem>
              <SelectItem value="ativo">Ativos</SelectItem>
              <SelectItem value="concluido">Concluídos</SelectItem>
              <SelectItem value="cancelado">Cancelados</SelectItem>
            </SelectContent>
          </Select>

          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Tipos</SelectItem>
              <SelectItem value="presencial">Presencial</SelectItem>
              <SelectItem value="remoto">Remoto</SelectItem>
              <SelectItem value="hibrido">Híbrido</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={loadData} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Atualizar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="tendencias" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto mb-6">
          <TabsTrigger value="tendencias">Tendências</TabsTrigger>
          <TabsTrigger value="freelancers">Freelancers</TabsTrigger>
          <TabsTrigger value="empresas">Empresas</TabsTrigger>
          <TabsTrigger value="denuncias">Denúncias</TabsTrigger>
        </TabsList>

        <TabsContent value="tendencias" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Receita ao Longo do Tempo</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={tendenciaConfig} className="h-[300px] w-full">
                  <LineChart
                    data={data?.tendencias || []}
                    margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickFormatter={(val) => `R$ ${val}`} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="receita"
                      stroke="var(--color-receita)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contratos por Status</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ChartContainer config={statusConfig} className="h-[300px] w-full">
                  <PieChart>
                    <Pie
                      data={data?.statusContratos || []}
                      dataKey="quantidade"
                      nameKey="status"
                      innerRadius={60}
                      strokeWidth={2}
                    >
                      {(data?.statusContratos || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="freelancers">
          <Card>
            <CardHeader>
              <CardTitle>Performance de Freelancers</CardTitle>
              <CardDescription>
                Ranking por avaliação, horas trabalhadas e taxa de conclusão.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Freelancer</TableHead>
                    <TableHead className="text-right">Avaliação</TableHead>
                    <TableHead className="text-right">Horas</TableHead>
                    <TableHead className="text-right">Taxa Conclusão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.freelancers.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.nome}</TableCell>
                      <TableCell className="text-right">{f.avaliacao.toFixed(1)} ⭐</TableCell>
                      <TableCell className="text-right">{f.horasTrabalhadas.toFixed(1)}h</TableCell>
                      <TableCell className="text-right">{f.taxaConclusao.toFixed(0)}%</TableCell>
                    </TableRow>
                  ))}
                  {!data?.freelancers?.length && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Nenhum dado encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="empresas">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Empresas</CardTitle>
              <CardDescription>Receita gerada e satisfação média.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead className="text-right">Contratos</TableHead>
                    <TableHead className="text-right">Receita (R$)</TableHead>
                    <TableHead className="text-right">Satisfação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.empresas.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.nome}</TableCell>
                      <TableCell className="text-right">{e.totalContratos}</TableCell>
                      <TableCell className="text-right">R$ {e.receitaGerada.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        {e.satisfacaoMedia.toFixed(1)} ⭐
                      </TableCell>
                    </TableRow>
                  ))}
                  {!data?.empresas?.length && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Nenhum dado encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="denuncias">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Frequência por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={denunciaConfig} className="h-[300px] w-full">
                  <BarChart
                    data={data?.denunciasRepo || []}
                    layout="vertical"
                    margin={{ top: 0, right: 20, left: 40, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" tickLine={false} axisLine={false} />
                    <YAxis dataKey="tipo" type="category" tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="frequencia" fill="var(--color-frequencia)" radius={[0, 4, 4, 0]}>
                      {(data?.denunciasRepo || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Relatório Detalhado</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo de Denúncia</TableHead>
                      <TableHead className="text-right">Frequência</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.denunciasRepo.map((d) => (
                      <TableRow key={d.tipo}>
                        <TableCell className="font-medium">{d.tipo}</TableCell>
                        <TableCell className="text-right">{d.frequencia}</TableCell>
                      </TableRow>
                    ))}
                    {!data?.denunciasRepo?.length && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                          Nenhuma denúncia registrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
