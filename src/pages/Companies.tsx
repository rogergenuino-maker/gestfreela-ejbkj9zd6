import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Companies() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cadastro de Empresas</h1>
        <p className="text-muted-foreground mt-1">Gerencie as empresas parceiras do sistema.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Empresas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-md text-muted-foreground">
            Módulo em desenvolvimento
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
