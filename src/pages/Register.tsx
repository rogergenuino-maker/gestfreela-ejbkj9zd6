import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Briefcase } from 'lucide-react'

const registerSchema = z
  .object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string(),
    userType: z.enum(['company', 'freelancer'], {
      required_error: 'Selecione um tipo de conta',
    }),
    terms: z.boolean().refine((val) => val === true, {
      message: 'Você deve aceitar os termos de uso',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export default function Register() {
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      userType: undefined,
      terms: false,
    },
  })

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    setIsLoading(true)

    const { data, error } = await signUp(values.email, values.password, {
      name: values.name,
      user_type: values.userType,
    })

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro no cadastro',
        description: error.message,
      })
      setIsLoading(false)
      return
    }

    if (data?.user) {
      const userId = data.user.id
      if (values.userType === 'company') {
        await supabase.from('companies').insert({
          id: userId,
          name: values.name,
        })
      } else {
        await supabase.from('freelancers').insert({
          id: userId,
          name: values.name,
        })
      }
    }

    toast({
      title: 'Cadastro realizado',
      description: 'Sua conta foi criada com sucesso! Você já pode acessar a plataforma.',
    })

    navigate('/')
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left side: Image */}
      <div className="hidden md:flex md:w-1/2 bg-zinc-900 relative">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img
          src="https://img.usecurling.com/p/800/1200?q=workspace&color=gray"
          alt="Ambiente de trabalho"
          className="absolute inset-0 w-full h-full object-cover grayscale"
        />
        <div className="relative z-20 flex flex-col justify-between p-12 h-full text-white w-full">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-black" />
            </div>
            <span className="text-2xl font-bold">ContratosFreela</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-4">Junte-se à nossa rede.</h1>
            <p className="text-zinc-300 text-lg max-w-md">
              Crie sua conta agora mesmo e comece a gerenciar ou encontrar novas oportunidades com
              segurança e praticidade.
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-12 lg:p-24 overflow-y-auto">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-3xl font-bold text-black">Criar conta</h2>
            <p className="text-zinc-500">Preencha os dados abaixo para se cadastrar.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black">Nome Completo / Razão Social</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="João da Silva"
                        className="border-zinc-300 focus-visible:ring-black"
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
                    <FormLabel className="text-black">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="nome@exemplo.com"
                        className="border-zinc-300 focus-visible:ring-black"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black">Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="border-zinc-300 focus-visible:ring-black"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black">Confirmar Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="border-zinc-300 focus-visible:ring-black"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="userType"
                render={({ field }) => (
                  <FormItem className="space-y-3 pt-2">
                    <FormLabel className="text-black">Eu sou um(a):</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem
                              value="company"
                              className="border-zinc-300 text-black"
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-zinc-700 cursor-pointer">
                            Empresa
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem
                              value="freelancer"
                              className="border-zinc-300 text-black"
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-zinc-700 cursor-pointer">
                            Freelancer
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-zinc-300 data-[state=checked]:bg-black data-[state=checked]:text-white mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal text-zinc-600 cursor-pointer leading-tight">
                        Aceito os{' '}
                        <Link to="#" className="text-black hover:underline">
                          Termos de Uso
                        </Link>{' '}
                        e a{' '}
                        <Link to="#" className="text-black hover:underline">
                          Política de Privacidade
                        </Link>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-black text-white hover:bg-zinc-800 mt-2"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Cadastrar
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm text-zinc-600 mt-6">
            Já tem uma conta?{' '}
            <Link to="/login" className="font-semibold text-black hover:underline">
              Fazer login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
