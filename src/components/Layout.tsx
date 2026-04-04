import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { Briefcase } from 'lucide-react'

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-screen">
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-6 shadow-sm z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="flex items-center gap-2 text-primary">
              <Briefcase className="h-6 w-6" />
              <span className="font-bold text-lg hidden sm:inline-block">ContratosFreela</span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
              AD
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-8 animate-fade-in">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
