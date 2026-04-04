import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, CheckCircle2, Users, Building2, TrendingUp } from 'lucide-react'
import { getDashboardStats, DashboardStats } from '@/services/dashboard'

export default function Index() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getDashboardStats()
      setStats(data)
      setLoading(false)
    }
    fetchStats()
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard Executivo</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral do sistema e indicadores principais.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Contratos"
          value={loading ? '...' : stats?.contractsCount}
          icon={FileText}
          trend="+12% este mês"
          delay={100}
        />
        <StatCard
          title="Contratos Ativos"
          value={loading ? '...' : stats?.activeContractsCount}
          icon={CheckCircle2}
          trend="Estável"
          delay={200}
        />
        <StatCard
          title="Freelancers Cadastrados"
          value={loading ? '...' : stats?.freelancersCount}
          icon={Users}
          trend="+5 novos hoje"
          delay={300}
        />
        <StatCard
          title="Empresas Cadastradas"
          value={loading ? '...' : stats?.companiesCount}
          icon={Building2}
          trend="+2 esta semana"
          delay={400}
        />
      </div>

      {/* Placeholder for future charts or lists */}
      <div
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 animate-fade-in-up"
        style={{ animationDelay: '500ms' }}
      >
        <Card className="lg:col-span-4 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-md text-muted-foreground bg-muted/20">
              Gráfico de Atividades
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Últimos Contratos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-md text-muted-foreground bg-muted/20">
              Lista de Contratos Recentes
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  delay,
}: {
  title: string
  value: string | number | undefined
  icon: any
  trend: string
  delay: number
}) {
  return (
    <Card
      className="shadow-sm border-border/50 animate-fade-in-up hover:shadow-md transition-shadow"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-emerald-500" />
          {trend}
        </p>
      </CardContent>
    </Card>
  )
}
