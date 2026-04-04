import { useState } from 'react'
import { Plus, Search, Edit, Trash2, Building2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Empresa } from '@/pages/Companies'

interface CompanyListProps {
  empresas: Empresa[]
  isLoading: boolean
  onAddNew: () => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export default function CompanyList({
  empresas,
  isLoading,
  onAddNew,
  onEdit,
  onDelete,
}: CompanyListProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredEmpresas = empresas.filter((emp) => {
    const term = searchTerm.toLowerCase()
    return emp.nome_empresa.toLowerCase().includes(term) || (emp.cnpj && emp.cnpj.includes(term))
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Empresas</h1>
          <p className="text-muted-foreground mt-1">Gerencie as empresas cadastradas no sistema.</p>
        </div>
        <Button
          onClick={onAddNew}
          className="bg-blue-600 hover:bg-blue-700 w-fit shrink-0 shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Cadastrar Nova Empresa
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nome ou CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 border-slate-200 focus-visible:ring-blue-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : filteredEmpresas.length === 0 ? (
        <Card className="border-dashed border-2 shadow-none border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
              <Building2 className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-medium text-slate-900">Nenhuma empresa encontrada</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-6 max-w-sm">
              {searchTerm
                ? 'Tente buscar com outros termos ou limpe o filtro.'
                : 'Você ainda não tem nenhuma empresa cadastrada.'}
            </p>
            {!searchTerm && (
              <Button
                onClick={onAddNew}
                variant="outline"
                className="text-blue-700 border-blue-200 hover:bg-blue-50"
              >
                <Plus className="mr-2 h-4 w-4" /> Cadastrar Empresa
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="font-semibold text-slate-700">Nome da Empresa</TableHead>
                  <TableHead className="font-semibold text-slate-700">CNPJ</TableHead>
                  <TableHead className="font-semibold text-slate-700">Telefone</TableHead>
                  <TableHead className="font-semibold text-slate-700">Email</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmpresas.map((emp) => (
                  <TableRow key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-medium text-slate-900 flex items-center gap-3">
                      {emp.logo ? (
                        <img
                          src={emp.logo}
                          alt={emp.nome_empresa}
                          className="h-8 w-8 rounded-md object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-md bg-slate-100 flex items-center justify-center border border-slate-200">
                          <Building2 className="h-4 w-4 text-slate-400" />
                        </div>
                      )}
                      {emp.nome_empresa}
                    </TableCell>
                    <TableCell className="text-slate-600">{emp.cnpj || '-'}</TableCell>
                    <TableCell className="text-slate-600">{emp.telefone || '-'}</TableCell>
                    <TableCell className="text-slate-600">{emp.email || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(emp.id)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(emp.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
