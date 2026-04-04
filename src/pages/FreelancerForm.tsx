import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ArrowLeft, Upload, Save } from 'lucide-react'
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
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

const formSchema = z.object({
  nome_completo: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido. Use o formato 000.000.000-00'),
  formacao: z.string().min(1, 'Selecione uma formação.'),
  experiencia_anos: z.coerce.number().min(0, 'A experiência deve ser igual ou maior que 0.'),
  descricao: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email('Email inválido.').or(z.literal('')),
  taxa_hora: z.coerce.number().min(0, 'A taxa deve ser igual ou maior que 0.').optional(),
  taxa_diaria: z.coerce.number().min(0, 'A taxa deve ser igual ou maior que 0.').optional(),
})

export default function FreelancerForm() {
  const { toast } = useToast()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fileName, setFileName] = useState('')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome_completo: '',
      cpf: '',
      formacao: '',
      experiencia_anos: 0,
      descricao: '',
      telefone: '',
      email: '',
      taxa_hora: 0,
      taxa_diaria: 0,
    },
  })

  const handleCpfChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void,
  ) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 11) value = value.slice(0, 11)
    value = value.replace(/(\d{3})(\d)/, '$1.$2')
    value = value.replace(/(\d{3})(\d)/, '$1.$2')
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    onChange(value)
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      // Simulate file upload with placeholder if a file was selected
      const fotoUrl = fileName
        ? `https://img.usecurling.com/ppl/thumbnail?seed=${encodeURIComponent(values.nome_completo)}`
        : null

      const { error } = await supabase.from('freelancers').insert({
        user_id: user?.id,
        nome_completo: values.nome_completo,
        cpf: values.cpf,
        formacao: values.formacao,
        experiencia_anos: values.experiencia_anos,
        descricao: values.descricao,
        telefone: values.telefone,
        email: values.email || null,
        taxa_hora: values.taxa_hora || null,
        taxa_diaria: values.taxa_diaria || null,
        foto_perfil: fotoUrl,
      })

      if (error) throw error

      toast({
        title: 'Cadastro realizado com sucesso!',
        description: 'O freelancer foi adicionado à base de talentos.',
        className: 'bg-green-50 border-green-200 text-green-900',
      })
      navigate('/freelancers')
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro ao cadastrar',
        description: 'Verifique os dados e tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
          asChild
        >
          <Link to="/freelancers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-900">Novo Freelancer</h1>
          <p className="text-muted-foreground mt-1">Preencha os dados do talento para registro.</p>
        </div>
      </div>

      <Card className="border-blue-100 shadow-md">
        <CardHeader className="bg-blue-50/50 border-b border-blue-100">
          <CardTitle className="text-blue-900">Informações do Profissional</CardTitle>
          <CardDescription>Os campos marcados com * são obrigatórios.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="nome_completo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Nome Completo *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: João da Silva"
                          className="focus-visible:ring-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">CPF *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="000.000.000-00"
                          className="focus-visible:ring-blue-500"
                          {...field}
                          onChange={(e) => handleCpfChange(e, field.onChange)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="formacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Formação *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger className="focus-visible:ring-blue-500">
                            <SelectValue placeholder="Selecione a formação" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Segurança Patrimonial">
                            Segurança Patrimonial
                          </SelectItem>
                          <SelectItem value="Bombeiro Civil">Bombeiro Civil</SelectItem>
                          <SelectItem value="Ambos">Ambos</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experiencia_anos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Anos de Experiência</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          className="focus-visible:ring-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="email@exemplo.com"
                          className="focus-visible:ring-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Telefone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(00) 00000-0000"
                          className="focus-visible:ring-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxa_hora"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Taxa por Hora (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          className="focus-visible:ring-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxa_diaria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Taxa por Diária (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          className="focus-visible:ring-blue-500"
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
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">
                      Descrição / Resumo Profissional
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Fale um pouco sobre a experiência e habilidades..."
                        className="resize-none h-24 focus-visible:ring-blue-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-3">
                <FormLabel className="text-slate-700">Foto de Perfil</FormLabel>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    onClick={() => document.getElementById('foto-upload')?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Escolher Arquivo
                  </Button>
                  <span className="text-sm text-slate-500">
                    {fileName || 'Nenhum arquivo selecionado'}
                  </span>
                  <input
                    id="foto-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setFileName(e.target.files[0].name)
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-slate-600 hover:text-slate-900"
                  asChild
                >
                  <Link to="/freelancers">Cancelar</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Salvando...' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
