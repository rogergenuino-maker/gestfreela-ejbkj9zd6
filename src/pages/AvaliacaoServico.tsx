import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AvaliacaoServico() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [rating, setRating] = useState<number>(0)
  const [hoveredRating, setHoveredRating] = useState<number>(0)
  const [comentario, setComentario] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [contrato, setContrato] = useState<any>(null)

  useEffect(() => {
    const fetchContrato = async () => {
      if (!id) return

      try {
        const { data, error } = await supabase
          .from('contratos')
          .select(`
            id,
            empresa_id,
            freelancer_id,
            status,
            freelancers ( nome_completo )
          `)
          .eq('id', id)
          .single()

        if (error) throw error
        setContrato(data)
      } catch (error: any) {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do contrato.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchContrato()
  }, [id, toast])

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: 'Atenção',
        description: 'Por favor, selecione uma nota de 1 a 5 estrelas.',
        variant: 'destructive',
      })
      return
    }

    if (!contrato) return

    setSubmitting(true)

    try {
      const { error } = await supabase.from('avaliacoes_rating').insert({
        contrato_id: contrato.id,
        empresa_id: contrato.empresa_id,
        freelancer_id: contrato.freelancer_id,
        nota_estrelas: rating,
        comentario: comentario || null,
      })

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: 'Avaliação enviada com sucesso!',
      })

      navigate('/dashboard')
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao enviar avaliação.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-slate-500">Carregando...</div>
    )
  }

  if (!contrato) {
    return (
      <div className="flex justify-center items-center h-full text-slate-500">
        Contrato não encontrado.
      </div>
    )
  }

  return (
    <div className="container max-w-2xl mx-auto p-6 animate-fade-in-up">
      <Card className="border-blue-100 shadow-sm">
        <CardHeader className="bg-blue-50/50 rounded-t-lg pb-8">
          <CardTitle className="text-2xl text-blue-900">Avaliação de Serviço</CardTitle>
          <CardDescription className="text-blue-700/70">
            Como foi trabalhar com {contrato.freelancers?.nome_completo}? Sua opinião ajuda a manter
            a qualidade da plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 space-y-8">
          <div className="space-y-4 text-center">
            <h3 className="text-sm font-medium text-slate-700">Selecione uma nota (Obrigatório)</h3>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={cn(
                      'w-12 h-12 transition-colors duration-200',
                      (hoveredRating || rating) >= star
                        ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm'
                        : 'text-slate-200',
                    )}
                  />
                </button>
              ))}
            </div>
            <div className="h-6">
              {rating > 0 && (
                <span className="text-sm text-blue-600 font-medium animate-fade-in">
                  {rating === 1 && 'Muito Ruim'}
                  {rating === 2 && 'Ruim'}
                  {rating === 3 && 'Regular'}
                  {rating === 4 && 'Bom'}
                  {rating === 5 && 'Excelente'}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-700">Comentário (Opcional)</h3>
            <Textarea
              placeholder="Deixe um comentário detalhado sobre o serviço prestado..."
              className="resize-none h-32 border-blue-100 focus-visible:ring-blue-500"
              maxLength={500}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
            <div className="text-right text-xs text-slate-400">
              {comentario.length}/500 caracteres
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50/50 border-t pt-6 pb-6">
          <div className="flex justify-end w-full space-x-3">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={submitting}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              Cancelar
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              onClick={handleSubmit}
              disabled={submitting || rating === 0}
            >
              {submitting ? 'Enviando...' : 'Enviar Avaliação'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
