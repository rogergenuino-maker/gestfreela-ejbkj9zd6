import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface Freelancer {
  id: string
  nome_completo: string
  cpf: string | null
  formacao: string | null
  telefone: string | null
  email: string | null
}

export default function Freelancers() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  const fetchFreelancers = async () => {
    const { data, error } = await supabase
      .from('freelancers')
      .select('id, nome_completo, cpf, formacao, telefone, email')
      .order('created_at', { ascending: false })

    if (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar freelancers.', variant: 'destructive' })
    } else {
      setFreelancers(data || [])
    }
  }

  useEffect(() => {
    fetchFreelancers()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este freelancer?')) return
    const { error } = await supabase.from('freelancers').delete().eq('id', id)
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao excluir.', variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Freelancer excluído.' })
      fetchFreelancers()
    }
  }

  const filtered = freelancers.filter(
    (f) =>
      f.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.cpf && f.cpf.includes(searchTerm)),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Cadastro de Freelancers
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie a base de talentos disponíveis.</p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
          <Link to="/freelancers/new">
            <Plus className="mr-2 h-4 w-4" />
            Cadastrar Novo Freelancer
          </Link>
        </Button>
      </div>

      <Card className="border-blue-100 shadow-sm">
        <CardHeader className="bg-blue-50/50 border-b border-blue-100 pb-4">
          <CardTitle className="text-blue-900">Lista de Freelancers</CardTitle>
          <div className="relative mt-2 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-blue-400" />
            <Input
              type="search"
              placeholder="Buscar por nome ou CPF..."
              className="pl-8 border-blue-200 focus-visible:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-b-md">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-700">Nome</TableHead>
                  <TableHead className="font-semibold text-slate-700">CPF</TableHead>
                  <TableHead className="font-semibold text-slate-700">Formação</TableHead>
                  <TableHead className="font-semibold text-slate-700">Telefone</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum freelancer encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((freelancer) => (
                    <TableRow key={freelancer.id} className="hover:bg-blue-50/30">
                      <TableCell className="font-medium text-slate-900">
                        {freelancer.nome_completo}
                      </TableCell>
                      <TableCell className="text-slate-600">{freelancer.cpf || '-'}</TableCell>
                      <TableCell className="text-slate-600">{freelancer.formacao || '-'}</TableCell>
                      <TableCell className="text-slate-600">{freelancer.telefone || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(freelancer.id)}
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
