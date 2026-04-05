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
import Register from './pages/Register'
import Companies from './pages/Companies'
import Freelancers from './pages/Freelancers'
import FreelancerForm from './pages/FreelancerForm'
import DocumentosUpload from './pages/DocumentosUpload'
import VagasFeed from './pages/VagasFeed'
import NovaVaga from './pages/NovaVaga'
import VagaDetails from './pages/VagaDetails'
import AssinaturaContrato from './pages/AssinaturaContrato'
import Contracts from './pages/Contracts'
import DocumentsAdmin from './pages/DocumentsAdmin'
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
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Index />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/freelancers" element={<Freelancers />} />
              <Route path="/freelancers/new" element={<FreelancerForm />} />
              <Route path="/freelancers/documentos" element={<DocumentosUpload />} />
              <Route path="/vagas" element={<VagasFeed />} />
              <Route path="/vagas/new" element={<NovaVaga />} />
              <Route path="/vagas/:id" element={<VagaDetails />} />
              <Route path="/contratos/:id/assinar" element={<AssinaturaContrato />} />
              <Route path="/contracts" element={<Contracts />} />
              <Route path="/admin/documents" element={<DocumentsAdmin />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AuthProvider>
)

export default App
