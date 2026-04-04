import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { fetchAllDocuments, updateDocumentStatus, DocumentInfo } from '@/services/documents'
import { CheckCircle2, XCircle, FileSearch, ShieldCheck, Download, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

export default function DocumentsAdmin() {
  const [documents, setDocuments] = useState<DocumentInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [rejectingDoc, setRejectingDoc] = useState<DocumentInfo | null>(null)
  const [rejectComment, setRejectComment] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadDocs()
  }, [])

  const loadDocs = async () => {
    try {
      const data = await fetchAllDocuments()
      setDocuments(data)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os documentos.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (doc: DocumentInfo) => {
    try {
      setIsProcessing(true)
      await updateDocumentStatus(doc.id, 'Aprovado')
      toast({
        title: 'Documento aprovado',
        description: 'O freelancer agora pode acessar as vagas.',
      })
      await loadDocs()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível aprovar o documento.',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectConfirm = async () => {
    if (!rejectingDoc) return
    try {
      setIsProcessing(true)
      await updateDocumentStatus(rejectingDoc.id, 'Rejeitado', rejectComment)
      toast({
        title: 'Documento rejeitado',
        description: 'O freelancer foi notificado sobre a rejeição.',
      })
      setRejectingDoc(null)
      setRejectComment('')
      await loadDocs()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível rejeitar o documento.',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const parts = dateString.split('T')[0].split('-')
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
    return dateString
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'aprovado':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Aprovado</Badge>
      case 'rejeitado':
        return <Badge variant="destructive">Rejeitado</Badge>
      default:
        return (
          <Badge
            variant="secondary"
            className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20"
          >
            Pendente
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-blue-950 flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-blue-600" />
          Validação de Documentos
        </h1>
        <p className="text-muted-foreground">
          Gerencie e valide os documentos obrigatórios enviados pelos freelancers.
        </p>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-muted-foreground" />
            Documentos Recebidos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
              <p>Carregando documentos...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ShieldCheck className="w-12 h-12 mb-4 text-muted/30" />
              <p>Nenhum documento encontrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/10">
                  <TableHead>Freelancer</TableHead>
                  <TableHead>Tipo de Documento</TableHead>
                  <TableHead>Data de Validade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id} className="group">
                    <TableCell className="font-medium">
                      {doc.freelancers?.nome_completo || 'Desconhecido'}
                    </TableCell>
                    <TableCell>{doc.tipo_documento}</TableCell>
                    <TableCell>{formatDate(doc.data_validade)}</TableCell>
                    <TableCell>{getStatusBadge(doc.status_verificacao)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        {doc.arquivo_url && (
                          <Button variant="outline" size="sm" asChild className="h-8 px-2">
                            <a
                              href={doc.arquivo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Ver Arquivo"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        {doc.status_verificacao?.toLowerCase() === 'pendente' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                              onClick={() => handleApprove(doc)}
                              disabled={isProcessing}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                              onClick={() => setRejectingDoc(doc)}
                              disabled={isProcessing}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Rejeitar
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!rejectingDoc} onOpenChange={(open) => !open && setRejectingDoc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Documento</DialogTitle>
            <DialogDescription>
              Por favor, informe o motivo da rejeição. O freelancer verá este comentário.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Ex: Documento ilegível, validade vencida..."
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectingDoc(null)} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={!rejectComment.trim() || isProcessing}
            >
              {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirmar Rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
