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
import { useAuth } from '@/hooks/use-auth'
import { useUnreadMessages } from '@/hooks/use-messages'
import { Badge } from '@/components/ui/badge'

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Mensagens', url: '/mensagens', icon: MessageSquare },
  { title: 'Cadastro de Empresas', url: '/companies', icon: Building2 },
  { title: 'Cadastro de Freelancers', url: '/freelancers', icon: Users },
  { title: 'Gestão de Contratos', url: '/contracts', icon: FileText },
  { title: 'Validação de Documentos', url: '/admin/documents', icon: ShieldCheck },
  { title: 'Relatório de Horas', url: '/relatorio-horas', icon: Clock },
]

export function AppSidebar() {
  const location = useLocation()
  const { signOut } = useAuth()
  const unreadCount = useUnreadMessages()

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground mt-4 mb-2 px-4">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
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
