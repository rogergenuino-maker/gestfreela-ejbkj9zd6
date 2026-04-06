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
import AdminAlerts from './pages/AdminAlerts'
import MetricsDashboard from './pages/MetricsDashboard'
import ContractDetails from './pages/ContractDetails'
import Messages from './pages/Messages'
import CheckinOperacional from './pages/CheckinOperacional'
import AvaliacaoServico from './pages/AvaliacaoServico'
import RankingFreelancers from './pages/RankingFreelancers'
import MapaPresenca from './pages/MapaPresenca'
import RelatorioHoras from './pages/RelatorioHoras'
import RelatoriosAvancados from './pages/RelatoriosAvancados'
import Profile from './pages/Profile'
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
              <Route path="/vagas" element={<VagasFeed />} />
              <Route path="/vagas/:id" element={<VagaDetails />} />
              <Route path="/contracts" element={<Contracts />} />
              <Route path="/contratos/:id" element={<ContractDetails />} />
              <Route path="/contratos/:id/assinar" element={<AssinaturaContrato />} />
              <Route path="/contratos/:id/avaliar" element={<AvaliacaoServico />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/mensagens" element={<Messages />} />

              <Route element={<ProtectedRoute allowedRoles={['empresa']} />}>
                <Route path="/companies" element={<Companies />} />
                <Route path="/freelancers" element={<Freelancers />} />
                <Route path="/freelancers/new" element={<FreelancerForm />} />
                <Route path="/vagas/new" element={<NovaVaga />} />
                <Route path="/ranking-freelancers" element={<RankingFreelancers />} />
                <Route path="/mapa-presenca" element={<MapaPresenca />} />
                <Route path="/relatorio-horas" element={<RelatorioHoras />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['freelancer']} />}>
                <Route path="/freelancers/documentos" element={<DocumentosUpload />} />
                <Route path="/contratos/:id/checkin" element={<CheckinOperacional />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/documents" element={<DocumentsAdmin />} />
                <Route path="/admin/alertas" element={<AdminAlerts />} />
                <Route path="/admin/metrics" element={<MetricsDashboard />} />
                <Route path="/admin/relatorios-avancados" element={<RelatoriosAvancados />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AuthProvider>
)

export default App
