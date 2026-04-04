import { supabase } from '@/lib/supabase/client'

export interface DashboardStats {
  companiesCount: number
  freelancersCount: number
  contractsCount: number
  activeContractsCount: number
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // using 'as any' to bypass strict type checking before types are generated
    const client = supabase as any

    const [empresas, freelancers, contratos, activeContracts] = await Promise.all([
      client.from('empresas').select('*', { count: 'exact', head: true }),
      client.from('freelancers').select('*', { count: 'exact', head: true }),
      client.from('contratos').select('*', { count: 'exact', head: true }),
      client.from('contratos').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
    ])

    return {
      companiesCount: empresas.count || 0,
      freelancersCount: freelancers.count || 0,
      contractsCount: contratos.count || 0,
      activeContractsCount: activeContracts.count || 0,
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      companiesCount: 0,
      freelancersCount: 0,
      contractsCount: 0,
      activeContractsCount: 0,
    }
  }
}
