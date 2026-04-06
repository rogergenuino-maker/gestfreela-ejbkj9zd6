import { supabase } from '@/lib/supabase/client'

export interface TendenciaData {
  date: string
  receita: number
  contratos: number
}

export interface StatusData {
  status: string
  quantidade: number
  fill: string
}

export interface FreelancerPerformance {
  id: string
  nome: string
  avaliacao: number
  horasTrabalhadas: number
  taxaConclusao: number
}

export interface EmpresaAnalysis {
  id: string
  nome: string
  totalContratos: number
  receitaGerada: number
  satisfacaoMedia: number
}

export interface DenunciaReport {
  tipo: string
  frequencia: number
  fill: string
}

export interface AdvancedReportsData {
  tendencias: TendenciaData[]
  statusContratos: StatusData[]
  freelancers: FreelancerPerformance[]
  empresas: EmpresaAnalysis[]
  denunciasRepo: DenunciaReport[]
}

export const fetchAdvancedReports = async (
  startDate: string,
  endDate: string,
  statusFilter: string,
  tipoFilter: string,
): Promise<AdvancedReportsData> => {
  const startStr = new Date(startDate).toISOString()
  const endPlusOne = new Date(endDate)
  endPlusOne.setDate(endPlusOne.getDate() + 1)
  const endStr = endPlusOne.toISOString()

  let query = supabase
    .from('contratos')
    .select(`
    id, status, created_at, empresa_id, freelancer_id,
    empresas(id, nome_empresa),
    freelancers(id, nome_completo),
    pagamentos(total_horas),
    pagamentos_processados(valor_pago, data_pagamento),
    avaliacoes_rating(nota_estrelas, empresa_id, freelancer_id),
    vagas(natureza)
  `)
    .gte('created_at', startStr)
    .lt('created_at', endStr)

  if (statusFilter && statusFilter !== 'todos') {
    query = query.eq('status', statusFilter)
  }

  const { data: contratosRaw, error } = await query

  if (error) {
    throw error
  }

  let contratos = contratosRaw || []
  if (tipoFilter && tipoFilter !== 'todos') {
    contratos = contratos.filter((c: any) => {
      return c.vagas?.natureza?.toLowerCase() === tipoFilter.toLowerCase()
    })
  }

  const { data: denuncias } = await supabase
    .from('denuncias')
    .select('id, tipo_denuncia, data_denuncia')
    .gte('data_denuncia', startStr)
    .lt('data_denuncia', endStr)

  const tendenciasMap = new Map<string, { receita: number; contratos: number }>()
  const statusMap = new Map<string, number>()
  const freelancersMap = new Map<string, any>()
  const empresasMap = new Map<string, any>()

  contratos.forEach((c) => {
    const st = c.status || 'desconhecido'
    statusMap.set(st, (statusMap.get(st) || 0) + 1)

    const dateObj = new Date(c.created_at)
    const date = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`

    const currentT = tendenciasMap.get(date) || { receita: 0, contratos: 0 }

    let receitaContrato = 0
    if (c.pagamentos_processados && Array.isArray(c.pagamentos_processados)) {
      c.pagamentos_processados.forEach((p: any) => {
        receitaContrato += Number(p.valor_pago) || 0
      })
    }

    tendenciasMap.set(date, {
      receita: currentT.receita + receitaContrato,
      contratos: currentT.contratos + 1,
    })

    if (c.freelancer_id && c.freelancers) {
      const f = c.freelancers as any
      const fData = freelancersMap.get(c.freelancer_id) || {
        id: c.freelancer_id,
        nome: f.nome_completo,
        avaliacoes: [],
        horas: 0,
        total: 0,
        concluidos: 0,
      }
      fData.total += 1
      if (st === 'concluido' || st === 'concluído') fData.concluidos += 1

      if (c.pagamentos) {
        const pags = Array.isArray(c.pagamentos) ? c.pagamentos : [c.pagamentos]
        pags.forEach((p: any) => (fData.horas += Number(p.total_horas) || 0))
      }

      if (c.avaliacoes_rating && Array.isArray(c.avaliacoes_rating)) {
        c.avaliacoes_rating.forEach((a: any) => {
          if (a.freelancer_id === c.freelancer_id && a.nota_estrelas) {
            fData.avaliacoes.push(a.nota_estrelas)
          }
        })
      }
      freelancersMap.set(c.freelancer_id, fData)
    }

    if (c.empresa_id && c.empresas) {
      const e = c.empresas as any
      const eData = empresasMap.get(c.empresa_id) || {
        id: c.empresa_id,
        nome: e.nome_empresa,
        totalContratos: 0,
        receitaGerada: 0,
        avaliacoes: [],
      }
      eData.totalContratos += 1
      eData.receitaGerada += receitaContrato

      if (c.avaliacoes_rating && Array.isArray(c.avaliacoes_rating)) {
        c.avaliacoes_rating.forEach((a: any) => {
          if (a.empresa_id === c.empresa_id && a.nota_estrelas) {
            eData.avaliacoes.push(a.nota_estrelas)
          }
        })
      }
      empresasMap.set(c.empresa_id, eData)
    }
  })

  const tendencias = Array.from(tendenciasMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => {
      const [d1, m1, y1] = a.date.split('/')
      const [d2, m2, y2] = b.date.split('/')
      return new Date(`${y1}-${m1}-${d1}`).getTime() - new Date(`${y2}-${m2}-${d2}`).getTime()
    })

  const statusColors: Record<string, string> = {
    ativo: 'hsl(var(--chart-1))',
    concluido: 'hsl(var(--chart-2))',
    concluído: 'hsl(var(--chart-2))',
    cancelado: 'hsl(var(--chart-3))',
  }

  const statusContratos = Array.from(statusMap.entries()).map(([status, quantidade], i) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    quantidade,
    fill: statusColors[status.toLowerCase()] || `hsl(var(--chart-${(i % 5) + 1}))`,
  }))

  const freelancersList: FreelancerPerformance[] = Array.from(freelancersMap.values())
    .map((f) => {
      const avg = f.avaliacoes.length
        ? f.avaliacoes.reduce((a: number, b: number) => a + b, 0) / f.avaliacoes.length
        : 0
      return {
        id: f.id,
        nome: f.nome,
        avaliacao: avg,
        horasTrabalhadas: f.horas,
        taxaConclusao: f.total > 0 ? (f.concluidos / f.total) * 100 : 0,
      }
    })
    .sort((a, b) => b.avaliacao - a.avaliacao)

  const empresasList: EmpresaAnalysis[] = Array.from(empresasMap.values())
    .map((e) => {
      const avg = e.avaliacoes.length
        ? e.avaliacoes.reduce((a: number, b: number) => a + b, 0) / e.avaliacoes.length
        : 0
      return {
        id: e.id,
        nome: e.nome,
        totalContratos: e.totalContratos,
        receitaGerada: e.receitaGerada,
        satisfacaoMedia: avg,
      }
    })
    .sort((a, b) => b.receitaGerada - a.receitaGerada)

  const denunciaMap = new Map<string, number>()
  denuncias?.forEach((d) => {
    const tipo = d.tipo_denuncia || 'Outros'
    denunciaMap.set(tipo, (denunciaMap.get(tipo) || 0) + 1)
  })

  const denunciasRepo: DenunciaReport[] = Array.from(denunciaMap.entries()).map(
    ([tipo, frequencia], i) => ({
      tipo,
      frequencia,
      fill: `hsl(var(--chart-${(i % 5) + 1}))`,
    }),
  )

  return {
    tendencias,
    statusContratos,
    freelancers: freelancersList,
    empresas: empresasList,
    denunciasRepo,
  }
}
