import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Loader2, Briefcase, MapPin, FileText, Calendar, DollarSign } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { getCurrentEmpresa } from '@/services/empresas'
import { createVaga } from '@/services/vagas'

const formSchema = z.object({
  titulo: z.string().min(5, 'O título deve ter pelo menos 5 caracteres.'),
  natureza: z.string().min(1, 'Selecione a natureza do trabalho.'),
  escopo_trabalho: z.string().min(10, 'O escopo deve ter pelo menos 10 caracteres.'),
  endereco_vaga: z.string().min(5, 'O endereço deve ser preenchido.'),
  data_inicio: z.string().min(1, 'A data e hora de início são obrigatórias.'),
  data_fim: z.string().min(1, 'A data e hora de término são obrigatórias.'),
  valor_remuneracao: z.coerce.number().min(0.01, 'O valor da remuneração deve ser maior que zero.'),
})

type FormValues = z.infer<typeof formSchema>

export default function NovaVaga() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [empresaId, setEmpresaId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: '',
      natureza: '',
      escopo_trabalho: '',
      endereco_vaga: '',
      data_inicio: '',
      data_fim: '',
      valor_remuneracao: 0,
    },
  })

  useEffect(() => {
    const fetchEmpresa = async () => {
      if (user) {
        const { data } = await getCurrentEmpresa(user.id)
        if (data) {
          setEmpresaId(data.id)
        } else {
          toast({
            title: 'Erro de Perfil',
            description: 'Não foi possível encontrar sua empresa vinculada.',
            variant: 'destructive',
          })
        }
      }
      setLoading(false)
    }
    fetchEmpresa()
  }, [user, toast])

  const onSubmit = async (values: FormValues) => {
    if (!empresaId) {
      toast({
        title: 'Acesso Negado',
        description: 'Você precisa estar vinculado a uma empresa para criar vagas.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    const { error } = await createVaga({
      empresa_id: empresaId,
      titulo: values.titulo,
      natureza: values.natureza,
      escopo_trabalho: values.escopo_trabalho,
      endereco_vaga: values.endereco_vaga,
      data_inicio: new Date(values.data_inicio).toISOString(),
      data_fim: new Date(values.data_fim).toISOString(),
      valor_remuneracao: values.valor_remuneracao,
      status: 'aberta',
    })
    setIsSubmitting(false)

    if (error) {
      toast({
        title: 'Erro ao publicar vaga',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Vaga publicada com sucesso!',
        description: 'A vaga já está disponível para os freelancers.',
        variant: 'success',
      })
      navigate(-1)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 -ml-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      <Card className="border-blue-100 shadow-sm">
        <CardHeader className="bg-blue-50/50 border-b border-blue-100 pb-6 rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-blue-900 flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-blue-600" />
            Publicar Nova Vaga
          </CardTitle>
          <CardDescription className="text-blue-700">
            Preencha os detalhes da oportunidade para atrair os melhores freelancers.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-900">Título da Vaga</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Segurança para Evento Corporativo"
                        className="border-blue-200 focus-visible:ring-blue-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="natureza"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-900">Natureza</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-blue-200 focus:ring-blue-500">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Evento">Evento</SelectItem>
                          <SelectItem value="Diária">Diária</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="valor_remuneracao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-900 flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-blue-500" /> Remuneração (R$)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="border-blue-200 focus-visible:ring-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="endereco_vaga"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-900 flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-blue-500" /> Endereço da Vaga
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Rua, Número, Bairro, Cidade - Estado"
                        className="border-blue-200 focus-visible:ring-blue-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="data_inicio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-900 flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-blue-500" /> Início
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          className="border-blue-200 focus-visible:ring-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="data_fim"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-900 flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-blue-500" /> Término
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          className="border-blue-200 focus-visible:ring-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="escopo_trabalho"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-900 flex items-center gap-1">
                      <FileText className="h-4 w-4 text-blue-500" /> Escopo do Trabalho
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva as responsabilidades e requisitos..."
                        className="min-h-[120px] resize-y border-blue-200 focus-visible:ring-blue-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4 border-t border-blue-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="mr-3 border-blue-200 text-blue-700 hover:bg-blue-50"
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isSubmitting || !empresaId}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publicando...
                    </>
                  ) : (
                    'Publicar Vaga'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
