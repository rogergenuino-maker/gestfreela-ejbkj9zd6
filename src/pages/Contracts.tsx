import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Contracts() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Contratos</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe o status e detalhes dos contratos ativos.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Contratos Recentes</CardTitle>
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
