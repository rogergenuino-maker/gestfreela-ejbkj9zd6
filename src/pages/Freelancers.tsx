import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Search, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { DangerConfirmModal } from '@/components/ui/danger-confirm-modal'

interface Freelancer {
  id: string
  nome_completo: string
  formacao: string | null
  experiencia_anos: number | null
  taxa_hora: number | null
  taxa_diaria: number | null
}

export default function Freelancers() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [formacaoFilter, setFormacaoFilter] = useState('all')
  const [experienciaFilter, setExperienciaFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [freelancerToDelete, setFreelancerToDelete] = useState<Freelancer | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const fetchFreelancers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('freelancers')
      .select('id, nome_completo, formacao, experiencia_anos, taxa_hora, taxa_diaria')
      .order('created_at', { ascending: false })

    if (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar freelancers.', variant: 'destructive' })
    } else {
      setFreelancers(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchFreelancers()
  }, [])

  const executeDelete = async () => {
    if (!freelancerToDelete) return
    setIsDeleting(true)
    const { error } = await supabase.from('freelancers').delete().eq('id', freelancerToDelete.id)
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao excluir.', variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Freelancer excluído com sucesso.' })
      fetchFreelancers()
    }
    setIsDeleting(false)
    setFreelancerToDelete(null)
  }

  const filtered = freelancers.filter((f) => {
    const matchName = f.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchFormacao = formacaoFilter === 'all' || f.formacao === formacaoFilter

    let matchExp = true
    if (experienciaFilter !== 'all') {
      const exp = f.experiencia_anos || 0
      if (experienciaFilter === '1-3') matchExp = exp >= 1 && exp <= 3
      else if (experienciaFilter === '4-7') matchExp = exp >= 4 && exp <= 7
      else if (experienciaFilter === '8+') matchExp = exp >= 8
    }

    return matchName && matchFormacao && matchExp
  })

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return '-'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-900">Freelancers</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie sua base de profissionais e talentos.
          </p>
        </div>
        <Button
          asChild
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all"
        >
          <Link to="/freelancers/new">
            <Plus className="mr-2 h-4 w-4" />
            Cadastrar Novo Freelancer
          </Link>
        </Button>
      </div>

      <Card className="border-blue-100 shadow-sm overflow-hidden">
        <CardHeader className="bg-blue-50/50 border-b border-blue-100 pb-6">
          <CardTitle className="text-blue-900">Listagem de Freelancers</CardTitle>
          <CardDescription>
            Filtre e encontre rapidamente os profissionais cadastrados.
          </CardDescription>

          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-400" />
              <Input
                type="search"
                placeholder="Buscar por nome..."
                className="pl-9 border-blue-200 focus-visible:ring-blue-500 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={formacaoFilter} onValueChange={setFormacaoFilter}>
              <SelectTrigger className="w-full md:w-[220px] bg-white border-blue-200">
                <SelectValue placeholder="Filtrar por Formação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Formações</SelectItem>
                <SelectItem value="Segurança Patrimonial">Segurança Patrimonial</SelectItem>
                <SelectItem value="Bombeiro Civil">Bombeiro Civil</SelectItem>
                <SelectItem value="Ambos">Ambos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={experienciaFilter} onValueChange={setExperienciaFilter}>
              <SelectTrigger className="w-full md:w-[220px] bg-white border-blue-200">
                <SelectValue placeholder="Filtrar por Experiência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Qualquer Experiência</SelectItem>
                <SelectItem value="1-3">1 a 3 anos</SelectItem>
                <SelectItem value="4-7">4 a 7 anos</SelectItem>
                <SelectItem value="8+">8+ anos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white">
                <TableRow className="hover:bg-transparent border-blue-100">
                  <TableHead className="font-semibold text-blue-900">Nome</TableHead>
                  <TableHead className="font-semibold text-blue-900">Formação</TableHead>
                  <TableHead className="font-semibold text-blue-900">Experiência</TableHead>
                  <TableHead className="font-semibold text-blue-900">Taxa/Hora</TableHead>
                  <TableHead className="font-semibold text-blue-900">Taxa/Diária</TableHead>
                  <TableHead className="text-right font-semibold text-blue-900">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      Carregando freelancers...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      Nenhum freelancer encontrado com os filtros atuais.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((freelancer) => (
                    <TableRow key={freelancer.id} className="hover:bg-blue-50/50 transition-colors">
                      <TableCell className="font-medium text-slate-900">
                        {freelancer.nome_completo}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {freelancer.formacao || 'Não informada'}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {freelancer.experiencia_anos ? `${freelancer.experiencia_anos} anos` : '-'}
                      </TableCell>
                      <TableCell className="text-slate-600 font-medium">
                        {formatCurrency(freelancer.taxa_hora)}
                      </TableCell>
                      <TableCell className="text-slate-600 font-medium">
                        {formatCurrency(freelancer.taxa_diaria)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-500 hover:text-blue-700 hover:bg-blue-100"
                            title="Ver Perfil"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-500 hover:text-blue-700 hover:bg-blue-100"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setFreelancerToDelete(freelancer)}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <DangerConfirmModal
        open={!!freelancerToDelete}
        onOpenChange={(open) => !open && setFreelancerToDelete(null)}
        onConfirm={executeDelete}
        title="Excluir Freelancer"
        description="Esta ação não pode ser desfeita. Todos os dados deste freelancer serão removidos permanentemente do sistema."
        itemName={freelancerToDelete?.nome_completo}
        isLoading={isDeleting}
      />
    </div>
  )
}
