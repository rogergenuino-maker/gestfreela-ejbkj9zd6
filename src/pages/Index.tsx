import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import {
  FileText,
  CheckCircle2,
  Users,
  Building2,
  TrendingUp,
  ShieldCheck,
  Clock,
  XCircle,
  ArrowRight,
} from 'lucide-react'
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

      <div
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 animate-fade-in-up"
        style={{ animationDelay: '500ms' }}
      >
        <Card className="lg:col-span-3 shadow-sm border-border/50 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xl">Status de Documentos</CardTitle>
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Pendentes
                </p>
                <p className="text-2xl font-bold">{loading ? '...' : stats?.docsPendentes}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Aprovados
                </p>
                <p className="text-2xl font-bold">{loading ? '...' : stats?.docsAprovados}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-1">
                  <XCircle className="w-4 h-4 text-rose-500" />
                  Rejeitados
                </p>
                <p className="text-2xl font-bold">{loading ? '...' : stats?.docsRejeitados}</p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/admin/documents"
                className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
              >
                Gerenciar Documentos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-md text-muted-foreground bg-muted/20">
              Gráfico de Atividades
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
