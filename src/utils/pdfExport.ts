import { format, parseISO } from 'date-fns'

export const generateCancelamentoHTML = (
  contrato: any,
  motivo: string,
  isPenalty: boolean,
  valorEstornado: number,
  formatCurrency: (v: number) => string,
) => {
  const { empresa, freelancer } = contrato
  const cancelHash = btoa(`cancel_${contrato.id}_${Date.now()}`).substring(0, 20)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=cancel_${contrato.id}`
  const dataCancelamento = format(new Date(), 'dd/MM/yyyy HH:mm')
  const penaltyText = isPenalty ? 'Sim (10% de multa)' : 'Nenhuma'

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Termo_Cancelamento_${contrato.id}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { margin: 1.5cm; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body class="bg-blue-50 text-slate-900 py-8 px-4 font-sans min-h-screen">
      <div class="max-w-4xl mx-auto bg-white border border-slate-200 p-10 rounded-lg shadow-sm">
        <div class="no-print mb-6 flex justify-end">
          <button onclick="window.print()" class="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition-colors">
            Salvar como PDF
          </button>
        </div>
        <div class="flex justify-between items-start border-b border-blue-200 pb-6 mb-6">
          <div>
            <h1 class="text-3xl font-bold text-blue-700">Termo de Cancelamento de Contrato</h1>
            <p class="text-slate-500 mt-1">ID do Contrato: ${contrato.id}</p>
          </div>
          <div class="text-right">
            <p class="font-semibold text-slate-700">Data de Geração</p>
            <p class="text-slate-500">${dataCancelamento}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 class="text-lg font-semibold text-blue-800 border-b border-blue-100 pb-2 mb-3">Dados da Empresa</h2>
            <p class="mb-1"><strong>Razão Social:</strong> ${empresa?.nome_empresa || 'N/A'}</p>
            <p class="mb-1"><strong>CNPJ:</strong> ${empresa?.cnpj || 'N/A'}</p>
            <p class="mb-1"><strong>Email:</strong> ${empresa?.email || 'N/A'}</p>
          </div>
          <div>
            <h2 class="text-lg font-semibold text-blue-800 border-b border-blue-100 pb-2 mb-3">Dados do Freelancer</h2>
            <p class="mb-1"><strong>Nome Completo:</strong> ${freelancer?.nome_completo || 'N/A'}</p>
            <p class="mb-1"><strong>CPF:</strong> ${freelancer?.cpf || 'N/A'}</p>
            <p class="mb-1"><strong>Email:</strong> ${freelancer?.email || 'N/A'}</p>
          </div>
        </div>

        <div class="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h2 class="text-lg font-semibold text-blue-800 mb-2">Motivo do Cancelamento</h2>
          <p class="text-slate-700">${motivo}</p>
        </div>

        <div class="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h2 class="text-sm font-semibold text-slate-500 mb-1">Multa/Penalidade</h2>
            <p class="text-xl font-bold text-slate-900">${penaltyText}</p>
          </div>
          <div class="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h2 class="text-sm font-semibold text-slate-500 mb-1">Valor Estornado</h2>
            <p class="text-xl font-bold text-slate-900">${formatCurrency(valorEstornado)}</p>
          </div>
        </div>

        <div class="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div class="text-center sm:text-left">
            <h2 class="text-lg font-semibold text-blue-800 mb-2">Assinatura Digital de Cancelamento</h2>
            <p class="text-sm text-slate-500 mb-1">Hash de Autenticidade:</p>
            <p class="text-xs font-mono bg-slate-100 p-2 rounded text-slate-600 break-all max-w-[250px] mx-auto sm:mx-0">${cancelHash}</p>
          </div>
          <div class="text-center">
            <img src="${qrCodeUrl}" alt="QR Code" class="w-32 h-32 mx-auto border p-1 rounded bg-white" />
            <p class="text-xs text-slate-400 mt-2">Validação via QR Code</p>
          </div>
        </div>
      </div>
      <script>
        window.onload = () => {
          setTimeout(() => {
            window.print();
          }, 800);
        };
      </script>
    </body>
    </html>
  `
}

export const exportContractPDF = (contrato: any, formatCurrency: (v: number) => string) => {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return false

  const { empresa, freelancer, vaga } = contrato
  const contractHash = btoa(contrato.id || '').substring(0, 20)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${contrato.id}`

  const dataInicio = vaga?.data_inicio
    ? format(parseISO(vaga.data_inicio), "dd/MM/yyyy 'às' HH:mm")
    : 'N/A'
  const dataFim = vaga?.data_fim ? format(parseISO(vaga.data_fim), "dd/MM/yyyy 'às' HH:mm") : 'N/A'
  const dataGeracao = format(new Date(), 'dd/MM/yyyy HH:mm')
  const valor = formatCurrency(vaga?.valor_remuneracao || 0)

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Contrato_${contrato.id}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { margin: 1.5cm; }
        }
      </style>
    </head>
    <body class="bg-white text-slate-900 p-8 font-sans">
      <div class="max-w-4xl mx-auto border border-slate-200 p-10 rounded-lg shadow-sm">
        <div class="flex justify-between items-start border-b border-slate-200 pb-6 mb-6">
          <div>
            <h1 class="text-3xl font-bold text-blue-700">Contrato de Prestação de Serviços</h1>
            <p class="text-slate-500 mt-1">ID do Contrato: ${contrato.id}</p>
          </div>
          <div class="text-right">
            <p class="font-semibold text-slate-700">Data de Geração</p>
            <p class="text-slate-500">${dataGeracao}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h2 class="text-lg font-semibold text-blue-800 border-b border-blue-100 pb-2 mb-3">Dados da Empresa</h2>
            <p class="mb-1"><strong>Razão Social:</strong> ${empresa?.nome_empresa || 'N/A'}</p>
            <p class="mb-1"><strong>CNPJ:</strong> ${empresa?.cnpj || 'N/A'}</p>
            <p class="mb-1"><strong>Email:</strong> ${empresa?.email || 'N/A'}</p>
            <p class="mb-1"><strong>Telefone:</strong> ${empresa?.telefone || 'N/A'}</p>
          </div>
          <div>
            <h2 class="text-lg font-semibold text-blue-800 border-b border-blue-100 pb-2 mb-3">Dados do Freelancer</h2>
            <p class="mb-1"><strong>Nome Completo:</strong> ${freelancer?.nome_completo || 'N/A'}</p>
            <p class="mb-1"><strong>CPF:</strong> ${freelancer?.cpf || 'N/A'}</p>
            <p class="mb-1"><strong>Email:</strong> ${freelancer?.email || 'N/A'}</p>
            <p class="mb-1"><strong>Telefone:</strong> ${freelancer?.telefone || 'N/A'}</p>
          </div>
        </div>

        <div class="mb-8">
          <h2 class="text-lg font-semibold text-blue-800 border-b border-blue-100 pb-2 mb-3">Detalhes da Vaga</h2>
          <p class="mb-1"><strong>Título:</strong> ${vaga?.titulo || 'N/A'}</p>
          <p class="mb-1"><strong>Natureza:</strong> ${vaga?.natureza || 'N/A'}</p>
          <p class="mb-1"><strong>Início:</strong> ${dataInicio}</p>
          <p class="mb-1"><strong>Fim:</strong> ${dataFim}</p>
          <p class="mb-1"><strong>Local:</strong> ${vaga?.endereco_vaga || 'N/A'}</p>
        </div>

        <div class="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h2 class="text-lg font-semibold text-blue-800 mb-2">Valor do Contrato</h2>
          <p class="text-2xl font-bold text-slate-900">${valor}</p>
        </div>

        <div class="mb-8">
          <h2 class="text-lg font-semibold text-blue-800 border-b border-blue-100 pb-2 mb-3">Termos e Condições</h2>
          <p class="text-sm text-slate-600 text-justify leading-relaxed">
            Pelo presente instrumento, as partes acima qualificadas firmam este Contrato de Prestação de Serviços, que se regerá pelas cláusulas e condições a seguir: O Contratado compromete-se a executar os serviços descritos nos Detalhes da Vaga, com zelo e diligência. A Contratante compromete-se a efetuar o pagamento do Valor do Contrato estipulado. O presente contrato tem validade a partir da data de início do evento até a sua conclusão. Qualquer cancelamento deve obedecer às políticas da plataforma GestFreela.
          </p>
        </div>

        <div class="mt-12 pt-8 border-t border-slate-200 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-blue-800 mb-2">Assinatura Digital</h2>
            <p class="text-sm text-slate-500 mb-1">Hash de Autenticidade:</p>
            <p class="text-xs font-mono bg-slate-100 p-2 rounded text-slate-600 break-all w-64">${contractHash}</p>
            <p class="text-sm text-slate-500 mt-4">Status atual: <strong class="uppercase text-slate-700">${contrato.status}</strong></p>
          </div>
          <div class="text-center">
            <img src="${qrCodeUrl}" alt="QR Code" class="w-32 h-32 mx-auto border p-1 rounded bg-white" />
            <p class="text-xs text-slate-400 mt-2">Validação via QR Code</p>
          </div>
        </div>
      </div>
      <script>
        window.onload = () => {
          setTimeout(() => {
            window.print();
            window.close();
          }, 800);
        };
      </script>
    </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
  return true
}
