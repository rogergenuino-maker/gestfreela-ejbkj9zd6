import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Index from './pages/Index'
import Login from './pages/Login'
import Companies from './pages/Companies'
import Freelancers from './pages/Freelancers'
import Contracts from './pages/Contracts'
import NotFound from './pages/NotFound'

const App = () => (
  <AuthProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Index />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/freelancers" element={<Freelancers />} />
              <Route path="/contracts" element={<Contracts />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AuthProvider>
)

export default App
