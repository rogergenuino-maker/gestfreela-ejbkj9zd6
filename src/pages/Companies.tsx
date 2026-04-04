import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
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

  return view === 'list' ? (
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
  )
}
