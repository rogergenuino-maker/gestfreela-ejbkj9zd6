import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ArrowLeft, Building2, Loader2, ImagePlus, Plus, MapPin, Phone, Mail } from 'lucide-react'

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const formSchema = z.object({
  nome_empresa: z.string().min(2, 'O nome da empresa é obrigatório'),
  cnpj: z
    .string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido (XX.XXX.XXX/XXXX-XX)'),
  email: z.string().min(1, 'O email é obrigatório').email('Email inválido'),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  descricao: z.string().optional(),
  logo: z.any().optional(),
})

type FormValues = z.infer<typeof formSchema>

type Empresa = {
  id: string
  nome_empresa: string
  cnpj: string | null
  email: string | null
  telefone: string | null
  endereco: string | null
  logo: string | null
}

const formatCNPJ = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18)
}

const formatPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{4,5})(\d{4})$/, '$1-$2')
    .slice(0, 15)
}

export default function Companies() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [view, setView] = useState<'list' | 'form'>('list')
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      nome_empresa: '',
      cnpj: '',
      email: '',
      telefone: '',
      endereco: '',
      descricao: '',
    },
  })

  useEffect(() => {
    if (user && view === 'list') {
      fetchEmpresas()
    }
  }, [user, view])

  const fetchEmpresas = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('id, nome_empresa, cnpj, email, telefone, endereco, logo')
        .order('created_at', { ascending: false })

      if (error) throw error
      setEmpresas(data || [])
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar empresas',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setLogoPreview(url)
      form.setValue('logo', file)
    }
  }

  const onSubmit = async (data: FormValues) => {
    if (!user) return

    setIsSubmitting(true)

    try {
      const logoUrl = data.logo ? 'https://img.usecurling.com/i?q=company+logo&color=blue' : null

      const { error } = await supabase.from('empresas').insert({
        user_id: user.id,
        nome_empresa: data.nome_empresa,
        cnpj: data.cnpj,
        email: data.email,
        telefone: data.telefone || null,
        endereco: data.endereco || null,
        descricao: data.descricao || null,
        logo: logoUrl,
      })

      if (error) throw error

      toast({
        title: 'Empresa cadastrada!',
        description: 'Os dados foram salvos com sucesso no sistema.',
      })

      form.reset()
      setLogoPreview(null)
      setView('list')
    } catch (error: any) {
      toast({
        title: 'Erro ao cadastrar',
        description: error.message || 'Verifique os dados e tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (view === 'list') {
    return (
      <div className="max-w-6xl mx-auto space-y-6 pb-10 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Empresas</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie as empresas cadastradas no sistema.
            </p>
          </div>
          <Button
            onClick={() => setView('form')}
            className="bg-blue-600 hover:bg-blue-700 w-fit shrink-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Empresa
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : empresas.length === 0 ? (
          <Card className="border-dashed shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-medium text-slate-900">Nenhuma empresa encontrada</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm mb-6">
                Você ainda não tem nenhuma empresa cadastrada. Clique no botão abaixo para adicionar
                a primeira.
              </p>
              <Button
                onClick={() => setView('form')}
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar Empresa
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {empresas.map((empresa) => (
              <Card key={empresa.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="p-0 border-b bg-slate-50/50">
                  <div className="p-6 flex items-center gap-4">
                    <div className="h-14 w-14 rounded-lg border bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                      {empresa.logo ? (
                        <img
                          src={empresa.logo}
                          alt={empresa.nome_empresa}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Building2 className="h-7 w-7 text-slate-300" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg text-slate-900 line-clamp-1">
                        {empresa.nome_empresa}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1 font-mono bg-slate-100 w-fit px-2 py-0.5 rounded text-slate-600">
                        {empresa.cnpj || 'CNPJ não informado'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3 text-sm">
                    {empresa.email && (
                      <div className="flex items-center gap-3 text-slate-600 group">
                        <div className="p-1.5 rounded-md bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                          <Mail className="h-3.5 w-3.5" />
                        </div>
                        <span className="truncate">{empresa.email}</span>
                      </div>
                    )}
                    {empresa.telefone && (
                      <div className="flex items-center gap-3 text-slate-600 group">
                        <div className="p-1.5 rounded-md bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                          <Phone className="h-3.5 w-3.5" />
                        </div>
                        <span>{empresa.telefone}</span>
                      </div>
                    )}
                    {empresa.endereco && (
                      <div className="flex items-center gap-3 text-slate-600 group">
                        <div className="p-1.5 rounded-md bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                          <MapPin className="h-3.5 w-3.5" />
                        </div>
                        <span className="truncate">{empresa.endereco}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Cadastro de Empresa</h1>
          <p className="text-muted-foreground mt-1">
            Preencha os dados abaixo para registrar uma nova empresa parceira no sistema.
          </p>
        </div>
        <Button variant="outline" onClick={() => setView('list')} className="shrink-0 w-fit">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para a lista
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
                        <Input placeholder="Ex: Tech Security Ltda" {...field} />
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
                      <FormLabel>CNPJ *</FormLabel>
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
                      <FormLabel>Email *</FormLabel>
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
                          placeholder="Breve descrição sobre a empresa, área de atuação e necessidades..."
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
                          alt="Preview do Logo"
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

              <div className="pt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t">
                <Button
                  variant="ghost"
                  type="button"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    form.reset()
                    setLogoPreview(null)
                  }}
                  disabled={isSubmitting}
                >
                  Limpar
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white min-w-[150px] shadow-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Cadastrar'
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
