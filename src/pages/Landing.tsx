import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import {
  ShieldCheck,
  FileSignature,
  CalendarDays,
  BellRing,
  History,
  UserPlus,
  FilePlus,
  Smartphone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Landing() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // If the user is already logged in, seamlessly redirect them to the dashboard.
  // This also catches anyone clicking the "Dashboard" link in Layout if it's hardcoded to "/"
  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  )
}

function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-blue-100 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 flex h-20 items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-blue-950 tracking-tight">ContratosFreela</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-6">
          <Link
            to="/login"
            className="text-sm font-medium text-blue-900 hover:text-blue-600 transition-colors hidden sm:inline-block"
          >
            Login
          </Link>
          <Link to="/login">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 shadow-sm">
              Cadastro
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="relative pt-24 pb-32 sm:pt-32 sm:pb-40 overflow-hidden bg-white">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 via-white/80 to-white/95 z-10" />
        <img
          src="https://img.usecurling.com/p/1920/1080?q=security%20guard&color=blue&dpr=1"
          className="w-full h-full object-cover opacity-20"
          alt="Profissionais de Segurança"
        />
      </div>
      <div className="container mx-auto px-4 relative z-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800 mb-8 animate-fade-in-up">
          <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
          Plataforma Nº1 em Segurança Patrimonial
        </div>
        <h1
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-blue-950 tracking-tight max-w-5xl mb-6 animate-fade-in-up"
          style={{ animationDelay: '100ms' }}
        >
          Conecte Empresas e Freelancers de{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
            Segurança Patrimonial
          </span>
        </h1>
        <p
          className="text-lg sm:text-xl md:text-2xl text-blue-800/80 max-w-3xl mb-12 animate-fade-in-up"
          style={{ animationDelay: '200ms' }}
        >
          A plataforma definitiva para gerenciar contratos, agendamentos e históricos de serviços
          com total controle, segurança jurídica e eficiência.
        </p>
        <div
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-fade-in-up"
          style={{ animationDelay: '300ms' }}
        >
          <Link to="/login" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 h-14 text-lg rounded-full shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
            >
              Começar Gratuitamente
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-blue-200 text-blue-700 hover:bg-blue-50 h-14 px-8 text-lg rounded-full bg-white/50 backdrop-blur-sm transition-all hover:scale-105"
            >
              Acessar Minha Conta
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

function Features() {
  const features = [
    {
      title: 'Gestão de Contratos',
      desc: 'Crie, assine e gerencie contratos digitalmente com validade jurídica e controle total de vigência.',
      icon: FileSignature,
    },
    {
      title: 'Agendamento de Eventos',
      desc: 'Organize escalas, defina turnos de forma inteligente e evite conflitos de horário entre profissionais.',
      icon: CalendarDays,
    },
    {
      title: 'Notificações em Tempo Real',
      desc: 'Receba alertas instantâneos sobre novos contratos, pendências de assinatura e atualizações de status.',
      icon: BellRing,
    },
    {
      title: 'Histórico de Serviços',
      desc: 'Mantenha um registro completo e detalhado de todos os serviços prestados para fácil consulta e auditoria.',
      icon: History,
    },
  ]

  return (
    <section className="py-24 bg-white relative z-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-950 mb-4 tracking-tight">
            Tudo que você precisa em um só lugar
          </h2>
          <p className="text-lg text-blue-600/80 max-w-2xl mx-auto">
            Nossas ferramentas foram desenhadas para simplificar a sua rotina administrativa e
            garantir a máxima segurança nas negociações.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <Card
              key={i}
              className="group border-blue-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up bg-white"
              style={{ animationDelay: `${i * 100 + 200}ms` }}
            >
              <CardHeader>
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <f.icon className="h-7 w-7" />
                </div>
                <CardTitle className="text-xl text-blue-950">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-900/60 leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    {
      title: 'Cadastre-se',
      desc: 'Crie sua conta como empresa de segurança ou freelancer em poucos minutos, de forma totalmente gratuita.',
      icon: UserPlus,
    },
    {
      title: 'Crie Contratos',
      desc: 'Utilize nossos modelos validados ou crie propostas personalizadas para cada novo serviço prestado.',
      icon: FilePlus,
    },
    {
      title: 'Receba Notificações',
      desc: 'Acompanhe o status em tempo real e gerencie seus serviços de forma simplificada pelo celular ou computador.',
      icon: Smartphone,
    },
  ]

  return (
    <section className="py-24 bg-blue-950 text-white relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-blue-900/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-blue-900/20 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Como Funciona</h2>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto">
            Três passos simples para transformar a gestão dos seus serviços e permitir que você
            foque no que realmente importa.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-12 relative max-w-5xl mx-auto">
          {/* Connecting Line (Desktop Only) */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent z-0" />

          {steps.map((s, i) => (
            <div
              key={i}
              className="relative z-10 flex flex-col items-center text-center animate-fade-in-up"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mb-8 border-4 border-blue-950 shadow-2xl shadow-blue-900/50 relative">
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-sm font-bold border-2 border-blue-950">
                  {i + 1}
                </div>
                <s.icon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{s.title}</h3>
              <p className="text-blue-200/90 leading-relaxed px-4">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-white border-t border-blue-100 pt-16 pb-8">
      <div className="container mx-auto px-4 grid md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-950 tracking-tight">ContratosFreela</span>
          </div>
          <p className="text-blue-900/60 max-w-md leading-relaxed mb-6">
            Conectando oportunidades e profissionais de segurança patrimonial com transparência,
            tecnologia avançada e eficiência operacional.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-blue-950 mb-6 text-lg">Plataforma</h4>
          <ul className="space-y-4 text-blue-900/70">
            <li>
              <Link
                to="/login"
                className="hover:text-blue-600 hover:translate-x-1 inline-block transition-all"
              >
                Acessar Conta
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                className="hover:text-blue-600 hover:translate-x-1 inline-block transition-all"
              >
                Criar Cadastro
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                className="hover:text-blue-600 hover:translate-x-1 inline-block transition-all"
              >
                Nossos Planos
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-blue-950 mb-6 text-lg">Contato e Legal</h4>
          <ul className="space-y-4 text-blue-900/70">
            <li>
              <a
                href="mailto:contato@contratosfreela.com"
                className="hover:text-blue-600 hover:translate-x-1 inline-block transition-all"
              >
                contato@contratosfreela.com
              </a>
            </li>
            <li>
              <Link
                to="/"
                className="hover:text-blue-600 hover:translate-x-1 inline-block transition-all"
              >
                Termos de Uso
              </Link>
            </li>
            <li>
              <Link
                to="/"
                className="hover:text-blue-600 hover:translate-x-1 inline-block transition-all"
              >
                Política de Privacidade
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 pt-8 border-t border-blue-50 flex flex-col md:flex-row items-center justify-between text-blue-900/40 text-sm">
        <p>&copy; {new Date().getFullYear()} ContratosFreela. Todos os direitos reservados.</p>
        <p className="mt-2 md:mt-0">Desenvolvido para Segurança Patrimonial.</p>
      </div>
    </footer>
  )
}
