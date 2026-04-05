import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getContratoById, assinarContrato } from '@/services/contratos'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { FileSignature, AlertCircle, ArrowLeft, Building2, UserCircle2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function AssinaturaContrato() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [contrato, setContrato] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [aceito, setAceito] = useState(false)
  const [assinatura, setAssinatura] = useState('')
  const [assinarLoading, setAssinarLoading] = useState(false)

  useEffect(() => {
    if (id) {
      getContratoById(id).then(({ data }) => {
        setContrato(data)
        setLoading(false)
      })
    }
  }, [id])

  const handleAssinar = async () => {
    if (!aceito) {
      toast({
        title: 'Atenção',
        description: 'Você precisa declarar que leu e aceita os termos.',
        variant: 'destructive',
      })
      return
    }
    if (assinatura.trim().toLowerCase() !== contrato?.freelancer?.nome_completo?.toLowerCase()) {
      toast({
        title: 'Assinatura Inválida',
        description: 'O nome digitado não confere com o nome cadastrado no perfil.',
        variant: 'destructive',
      })
      return
    }

    setAssinarLoading(true)

    // Simula captura de IP
    const logData = {
      contrato_id: contrato.id,
      freelancer_id: contrato.freelancer_id,
      ip_dispositivo: '192.168.1.1', // Em um caso real, pegar via API ou Edge Function
    }

    const { error } = await assinarContrato(contrato.id, logData)
    setAssinarLoading(false)

    if (error) {
      toast({ title: 'Erro na assinatura', description: error.message, variant: 'destructive' })
    } else {
      toast({
        title: 'Sucesso!',
        description: 'Contrato assinado digitalmente com validade jurídica.',
      })
      navigate('/dashboard')
    }
  }

  if (loading)
    return (
      <div className="container mx-auto py-12 px-4 flex justify-center">
        <div className="animate-pulse h-12 w-64 bg-slate-200 rounded"></div>
      </div>
    )

  if (!contrato)
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-700">Contrato não encontrado</h2>
        <Button asChild className="mt-4">
          <Link to="/dashboard">Ir para Início</Link>
        </Button>
      </div>
    )

  return (
    <div className="container mx-auto py-8 max-w-4xl px-4 animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to={`/vagas/${contrato.vaga_id}`}
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Voltar para Detalhes da Vaga
        </Link>
      </div>

      <Card className="border-slate-200 shadow-lg overflow-hidden">
        <div className="bg-slate-900 py-6 px-8 text-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-lg">
              <FileSignature className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold m-0">Assinatura Digital de Contrato</h1>
              <p className="text-slate-300 text-sm opacity-90">
                ID: {contrato.id.split('-')[0].toUpperCase()}
              </p>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-sm text-slate-400">Data de Emissão</p>
            <p className="font-medium">
              {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>

        <CardContent className="p-0">
          <div className="p-8 bg-slate-50 border-b border-slate-100 font-serif">
            <h2 className="text-center font-bold text-lg mb-8 uppercase tracking-widest text-slate-800">
              Termo de Prestação de Serviços Freelance
            </h2>

            <div className="space-y-6 text-slate-700 text-justify leading-relaxed">
              <p>
                Pelo presente instrumento particular, de um lado, a empresa{' '}
                <strong>{contrato.empresa?.nome_empresa}</strong>, doravante denominada{' '}
                <strong>CONTRATANTE</strong>, e de outro lado, o profissional{' '}
                <strong>{contrato.freelancer?.nome_completo}</strong>, inscrito sob o CPF/CNPJ
                constante em seu perfil verificado, doravante denominado{' '}
                <strong>CONTRATADO(A)</strong>, firmam o presente acordo de prestação de serviços.
              </p>

              <div className="bg-white p-6 border border-slate-200 rounded-md shadow-sm my-6">
                <h3 className="font-bold text-slate-900 mb-4 border-b pb-2">
                  Resumo do Objeto (Vaga)
                </h3>
                <ul className="space-y-3 text-sm">
                  <li>
                    <strong className="text-slate-900">Serviço:</strong> {contrato.vaga?.titulo}
                  </li>
                  <li>
                    <strong className="text-slate-900">Natureza:</strong> {contrato.vaga?.natureza}
                  </li>
                  <li>
                    <strong className="text-slate-900">Local:</strong>{' '}
                    {contrato.vaga?.endereco_vaga || 'A definir'}
                  </li>
                  <li>
                    <strong className="text-slate-900">Período:</strong>{' '}
                    {contrato.vaga?.data_inicio
                      ? format(new Date(contrato.vaga.data_inicio), 'dd/MM/yyyy HH:mm')
                      : ''}{' '}
                    até{' '}
                    {contrato.vaga?.data_fim
                      ? format(new Date(contrato.vaga.data_fim), 'dd/MM/yyyy HH:mm')
                      : ''}
                  </li>
                  <li>
                    <strong className="text-slate-900">Remuneração:</strong> R${' '}
                    {contrato.vaga?.valor_remuneracao?.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </li>
                </ul>
              </div>

              <p>
                <strong>CLÁUSULA PRIMEIRA:</strong> O CONTRATADO compromete-se a executar os
                serviços descritos no escopo da vaga com diligência e profissionalismo, respeitando
                os prazos e as diretrizes estabelecidas pela CONTRATANTE.
              </p>
              <p>
                <strong>CLÁUSULA SEGUNDA:</strong> A remuneração acordada será devida após a
                conclusão satisfatória dos serviços, estando sujeita às regras de penalidade e
                estorno da plataforma caso haja descumprimento injustificado (no-show ou abandono).
              </p>
              <p>
                <strong>CLÁUSULA TERCEIRA:</strong> Este aceite possui validade jurídica equivalente
                a uma assinatura física, registrando o IP e o horário da concordância do usuário,
                conforme as normas legais vigentes para contratos eletrônicos.
              </p>
            </div>
          </div>

          <div className="p-8 space-y-6 bg-white">
            <Alert className="bg-blue-50/50 border-blue-200 text-blue-800">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="font-semibold text-blue-900">
                Validação Biométrica Simplificada
              </AlertTitle>
              <AlertDescription className="text-blue-700/90 mt-1">
                Para assinar, digite seu nome completo exatamente como consta em seu documento
                validado:{' '}
                <strong className="font-bold">{contrato.freelancer?.nome_completo}</strong>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assinatura" className="text-slate-700 font-semibold">
                  Assinatura Eletrônica (Digite seu nome)
                </Label>
                <Input
                  id="assinatura"
                  placeholder="Nome Completo"
                  value={assinatura}
                  onChange={(e) => setAssinatura(e.target.value)}
                  className="max-w-md h-12 text-lg font-medium tracking-wide bg-slate-50"
                />
              </div>

              <div className="flex items-start space-x-3 pt-4 border-t border-slate-100">
                <Checkbox
                  id="terms"
                  checked={aceito}
                  onCheckedChange={(c) => setAceito(c as boolean)}
                  className="mt-1 w-5 h-5 rounded data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 cursor-pointer"
                  >
                    Declaro que li, compreendi e concordo integralmente com os termos deste Contrato
                    de Prestação de Serviços.
                  </label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-slate-50 border-t border-slate-200 p-6 flex justify-end gap-4">
          <Button variant="outline" asChild className="h-12 px-6">
            <Link to={`/vagas/${contrato.vaga_id}`}>Cancelar</Link>
          </Button>
          <Button
            onClick={handleAssinar}
            disabled={!aceito || assinatura.length < 5 || assinarLoading}
            className="h-12 px-8 bg-blue-600 hover:bg-blue-700 font-bold shadow-md hover:shadow-lg transition-all text-white gap-2"
          >
            {assinarLoading ? (
              'Registrando...'
            ) : (
              <>
                <FileSignature className="w-5 h-5" />
                Assinar Digitalmente
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
