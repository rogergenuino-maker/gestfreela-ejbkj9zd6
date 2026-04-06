import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  ShieldCheck,
  Clock,
  LogOut,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  BookOpen,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useUnreadMessages } from '@/hooks/use-messages'
import { Badge } from '@/components/ui/badge'

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Mensagens', url: '/mensagens', icon: MessageSquare },
  { title: 'Cadastro de Empresas', url: '/empresas', icon: Building2, roles: ['empresa', 'admin'] },
  {
    title: 'Cadastro de Freelancers',
    url: '/freelancers',
    icon: Users,
    roles: ['empresa', 'admin'],
  },
  { title: 'Gestão de Contratos', url: '/contratos', icon: FileText },
  { title: 'Validação de Documentos', url: '/documentos', icon: ShieldCheck, roles: ['admin'] },
  { title: 'Alertas', url: '/alertas', icon: AlertTriangle, roles: ['admin'] },
  { title: 'Dashboard de Métricas', url: '/metricas', icon: TrendingUp, roles: ['admin'] },
  { title: 'Relatórios Avançados', url: '/relatorios', icon: BarChart3, roles: ['admin'] },
  { title: 'Relatório de Horas', url: '/horas', icon: Clock, roles: ['empresa', 'admin'] },
  { title: 'Documentação', url: '/documentacao', icon: BookOpen },
]

export function AppSidebar() {
  const location = useLocation()
  const { signOut, user } = useAuth()
  const unreadCount = useUnreadMessages()
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      supabase
        .from('users')
        .select('user_type')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) setUserRole(data.user_type)
        })
    }
  }, [user])

  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.roles) return true
    if (!userRole) return false
    return item.roles.includes(userRole)
  })

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground mt-4 mb-2 px-4">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => {
                const isActive = location.pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link to={item.url} className="flex items-center gap-3 w-full">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.title === 'Mensagens' && unreadCount > 0 && (
                          <Badge
                            variant="destructive"
                            className="ml-auto flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px]"
                          >
                            {unreadCount}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut()}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
