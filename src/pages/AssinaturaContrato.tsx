import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getContratoById, assinarContrato } from '@/services/contratos'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { FileSignature, ArrowLeft, ShieldCheck, Calendar, MapPin, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function AssinaturaContrato() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [contrato, setContrato] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [aceiteTermos, setAceiteTermos] = useState(false)
  const [aceiteNda, setAceiteNda] = useState(false)
  const [aceiteTributos, setAceiteTributos] = useState(false)

  const [assinarLoading, setAssinarLoading] = useState(false)

  useEffect(() => {
    if (id) {
      getContratoById(id).then(({ data }) => {
        setContrato(data)
        setLoading(false)
      })
    }
  }, [id])

  const todosAceitos = aceiteTermos && aceiteNda && aceiteTributos

  const handleAssinar = async () => {
    if (!todosAceitos) {
      toast({
        title: 'Atenção',
        description: 'Você precisa marcar todas as caixas de seleção obrigatórias.',
        variant: 'destructive',
      })
      return
    }

    setAssinarLoading(true)

    // Simula captura de IP e Timestamp
    const logData = {
      contrato_id: contrato.id,
      freelancer_id: contrato.freelancer_id,
      ip_dispositivo: '192.168.1.1', // Em um caso real, pegar via API ou Edge Function
      data_hora_aceite: new Date().toISOString(),
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
    <div className="container mx-auto py-8 max-w-4xl px-4 animate-fade-in-up">
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
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold m-0">Assinatura Eletrônica</h1>
              <p className="text-slate-300 text-sm opacity-90">
                Contrato #{contrato.id.split('-')[0].toUpperCase()}
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
          <div className="p-8 bg-slate-50 border-b border-slate-100">
            <h2 className="font-bold text-lg mb-6 text-slate-800">Resumo da Oportunidade</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500 font-medium">Valor</p>
                  <p className="font-bold text-slate-900">
                    R${' '}
                    {contrato.vaga?.valor_remuneracao?.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500 font-medium">Local</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    {contrato.vaga?.endereco_vaga || 'A definir'}
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500 font-medium">Datas</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    {contrato.vaga?.data_inicio
                      ? format(new Date(contrato.vaga.data_inicio), 'dd/MM/yyyy HH:mm')
                      : ''}
                    {' - '}
                    {contrato.vaga?.data_fim
                      ? format(new Date(contrato.vaga.data_fim), 'dd/MM/yyyy HH:mm')
                      : ''}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
              <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
                <h3 className="font-semibold text-slate-800">
                  Termos do Contrato de Prestação de Serviços
                </h3>
              </div>
              <ScrollArea className="h-64 p-6 text-sm text-slate-700 leading-relaxed">
                <p className="mb-4">
                  Pelo presente instrumento particular, de um lado, a empresa{' '}
                  <strong>{contrato.empresa?.nome_empresa}</strong> (CONTRATANTE), e de outro lado,
                  o profissional <strong>{contrato.freelancer?.nome_completo}</strong> (CONTRATADO),
                  firmam o presente acordo de prestação de serviços autônomos.
                </p>
                <h4 className="font-bold text-slate-900 mt-6 mb-2">1. DO OBJETO</h4>
                <p className="mb-4">
                  O objeto deste contrato é a prestação de serviços de forma autônoma e eventual
                  para a vaga "{contrato.vaga?.titulo}", conforme escopo descrito na plataforma.
                </p>
                <h4 className="font-bold text-slate-900 mt-6 mb-2">
                  2. DA ISENÇÃO DE VÍNCULO TRABALHISTA
                </h4>
                <p className="mb-4">
                  Fica expressamente acordado que a prestação de serviços se dá em caráter eventual,
                  sem subordinação jurídica, não eventualidade ou pessoalidade que caracterizem
                  vínculo empregatício nos termos da Consolidação das Leis do Trabalho (CLT). O
                  CONTRATADO atua com total autonomia na execução de suas atividades.
                </p>
                <h4 className="font-bold text-slate-900 mt-6 mb-2">
                  3. DA RESPONSABILIDADE CIVIL E TRIBUTÁRIA
                </h4>
                <p className="mb-4">
                  O CONTRATADO assume total responsabilidade por seus atos durante a prestação dos
                  serviços, isentando a CONTRATANTE de quaisquer danos materiais ou morais causados
                  a terceiros. Adicionalmente, o CONTRATADO declara-se exclusivamente responsável
                  pelo recolhimento de todos os tributos incidentes sobre sua atividade autônoma,
                  incluindo INSS, ISS, entre outros aplicáveis.
                </p>
                <h4 className="font-bold text-slate-900 mt-6 mb-2">4. DA CONFIDENCIALIDADE</h4>
                <p className="mb-4">
                  O CONTRATADO obriga-se a manter sigilo absoluto sobre quaisquer informações,
                  dados, materiais ou estratégias da CONTRATANTE aos quais venha a ter acesso
                  durante a execução deste contrato, sob pena de responsabilização legal.
                </p>
              </ScrollArea>
            </div>
          </div>

          <div className="p-8 space-y-5 bg-white">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="termo1"
                checked={aceiteTermos}
                onCheckedChange={(c) => setAceiteTermos(!!c)}
                className="mt-1 w-5 h-5 data-[state=checked]:bg-blue-600"
              />
              <label
                htmlFor="termo1"
                className="text-sm font-medium leading-relaxed text-slate-700 cursor-pointer select-none"
              >
                Li e aceito os Termos do Contrato e a Política de Tolerância Zero.
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="termo2"
                checked={aceiteNda}
                onCheckedChange={(c) => setAceiteNda(!!c)}
                className="mt-1 w-5 h-5 data-[state=checked]:bg-blue-600"
              />
              <label
                htmlFor="termo2"
                className="text-sm font-medium leading-relaxed text-slate-700 cursor-pointer select-none"
              >
                Concordo com o Acordo de Confidencialidade (NDA) e Cessão de Imagem.
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="termo3"
                checked={aceiteTributos}
                onCheckedChange={(c) => setAceiteTributos(!!c)}
                className="mt-1 w-5 h-5 data-[state=checked]:bg-blue-600"
              />
              <label
                htmlFor="termo3"
                className="text-sm font-medium leading-relaxed text-slate-700 cursor-pointer select-none"
              >
                Reconheço que atuo de forma autônoma, sendo responsável por meus tributos
                (INSS/ISS).
              </label>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-slate-50 border-t border-slate-200 p-6 flex justify-end gap-4">
          <Button variant="outline" asChild className="h-12 px-6">
            <Link to={`/vagas/${contrato.vaga_id}`}>Cancelar</Link>
          </Button>
          <Button
            onClick={handleAssinar}
            disabled={!todosAceitos || assinarLoading}
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
