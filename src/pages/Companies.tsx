import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import CompanyList from '@/components/companies/CompanyList'
import CompanyForm from '@/components/companies/CompanyForm'

export type Empresa = {
  id: string
  nome_empresa: string
  cnpj: string | null
  email: string | null
  telefone: string | null
  endereco: string | null
  descricao: string | null
  logo: string | null
}

export default function Companies() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()

  const [view, setView] = useState<'list' | 'form'>('list')
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)

  const fetchEmpresas = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setEmpresas(data || [])
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user && view === 'list') {
      fetchEmpresas()
    }
  }, [user, view])

  const handleEdit = (id: string) => {
    setEditingId(id)
    setView('form')
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta empresa?')) return
    try {
      const { error } = await supabase.from('empresas').delete().eq('id', id)
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Empresa excluída com sucesso.' })
      fetchEmpresas()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  const handleAddNew = () => {
    setEditingId(null)
    setView('form')
  }

  const editingEmpresa = empresas.find((e) => e.id === editingId)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {view === 'list' && (
        <div className="flex items-center gap-4 bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0 text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-blue-900">
              Cadastro de Empresas
            </h1>
            <p className="text-blue-600/80 mt-1">Gerencie as empresas cadastradas no sistema.</p>
          </div>
        </div>
      )}

      {view === 'list' ? (
        <CompanyList
          empresas={empresas}
          isLoading={isLoading}
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <CompanyForm
          empresa={editingEmpresa}
          onBack={() => setView('list')}
          onSuccess={() => {
            setView('list')
            fetchEmpresas()
          }}
        />
      )}
    </div>
  )
}
