import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ArrowLeft, Loader2, ImagePlus, Building2 } from 'lucide-react'

import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { Empresa } from '@/pages/Companies'

const formSchema = z.object({
  nome_empresa: z.string().min(2, 'O nome da empresa é obrigatório'),
  cnpj: z
    .string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido')
    .or(z.literal('')),
  email: z.string().email('Email inválido').or(z.literal('')),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  descricao: z.string().optional(),
  logo: z.any().optional(),
})

type FormValues = z.infer<typeof formSchema>

const formatCNPJ = (v: string) =>
  v
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18)
const formatPhone = (v: string) =>
  v
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{4,5})(\d{4})$/, '$1-$2')
    .slice(0, 15)

interface CompanyFormProps {
  empresa?: Empresa
  onBack: () => void
  onSuccess: () => void
}

export default function CompanyForm({ empresa, onBack, onSuccess }: CompanyFormProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(empresa?.logo || null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome_empresa: empresa?.nome_empresa || '',
      cnpj: empresa?.cnpj || '',
      email: empresa?.email || '',
      telefone: empresa?.telefone || '',
      endereco: empresa?.endereco || '',
      descricao: empresa?.descricao || '',
    },
  })

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoPreview(URL.createObjectURL(file))
      form.setValue('logo', file)
    }
  }

  const onSubmit = async (data: FormValues) => {
    if (!user) return
    setIsSubmitting(true)
    try {
      const logoUrl = data.logo
        ? 'https://img.usecurling.com/i?q=company+logo&color=blue'
        : empresa?.logo || null
      const payload = {
        user_id: user.id,
        nome_empresa: data.nome_empresa,
        cnpj: data.cnpj || null,
        email: data.email || null,
        telefone: data.telefone || null,
        endereco: data.endereco || null,
        descricao: data.descricao || null,
        logo: logoUrl,
      }

      const { error } = empresa
        ? await supabase.from('empresas').update(payload).eq('id', empresa.id)
        : await supabase.from('empresas').insert(payload)

      if (error) throw error
      toast({
        title: 'Sucesso!',
        description: `Empresa ${empresa ? 'atualizada' : 'cadastrada'} com sucesso.`,
      })
      onSuccess()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {empresa ? 'Editar Empresa' : 'Cadastro de Empresa'}
          </h1>
          <p className="text-muted-foreground mt-1">Preencha os dados abaixo.</p>
        </div>
        <Button variant="outline" onClick={onBack} className="shrink-0 w-fit">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>
      <Card className="border-t-4 border-t-blue-600 shadow-md">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="flex items-center gap-2 text-xl text-blue-900">
            <Building2 className="h-6 w-6 text-blue-600" />
            Dados da Empresa
          </CardTitle>
          <CardDescription>As informações com asterisco (*) são obrigatórias.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="nome_empresa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Empresa *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Tech Corp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="00.000.000/0000-00"
                          {...field}
                          onChange={(e) => field.onChange(formatCNPJ(e.target.value))}
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contato@empresa.com.br" {...field} />
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
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(00) 00000-0000"
                          {...field}
                          onChange={(e) => field.onChange(formatPhone(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endereco"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Endereço Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua, Número, Bairro, Cidade - Estado" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Breve descrição sobre a empresa..."
                          className="min-h-[100px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="md:col-span-2 space-y-3">
                  <FormLabel>Logo da Empresa</FormLabel>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg bg-slate-50/50">
                    <div className="h-20 w-20 shrink-0 rounded-md border-2 border-dashed border-slate-300 flex items-center justify-center bg-white overflow-hidden relative group">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Preview"
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <ImagePlus className="h-8 w-8 text-slate-400 group-hover:text-blue-500 transition-colors" />
                      )}
                    </div>
                    <div className="flex-1 w-full">
                      <Input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleLogoChange}
                        className="cursor-pointer file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-md file:px-4 file:py-1.5 file:mr-4 file:text-sm file:font-medium hover:file:bg-blue-100 h-auto py-2"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Formatos aceitos: JPG, PNG. Tamanho máximo recomendado: 2MB.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-6 flex justify-end gap-3 border-t">
                <Button type="button" variant="ghost" onClick={onBack} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white min-w-[150px]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Salvar'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
