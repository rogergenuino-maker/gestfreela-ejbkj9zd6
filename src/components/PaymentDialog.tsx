import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { CreditCard, Lock } from 'lucide-react'

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (data: any) => void
  contratoId: string
  freelancerId: string
  valorFinal: number
  freelancerNome?: string
}

export function PaymentDialog({
  open,
  onOpenChange,
  onSuccess,
  contratoId,
  freelancerId,
  valorFinal,
  freelancerNome,
}: PaymentDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          contrato_id: contratoId,
          freelancer_id: freelancerId,
          amount: valorFinal,
        },
      })

      if (error) throw error
      if (data?.error) throw new Error(data.error)

      toast({
        title: 'Pagamento Concluído',
        description: 'O pagamento via Stripe foi processado com sucesso!',
        variant: 'success',
      })

      onSuccess(data.pagamento)
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível processar o pagamento. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CreditCard className="w-5 h-5 text-primary" />
            Processar Pagamento
          </DialogTitle>
          <DialogDescription>
            Insira os dados do cartão para realizar o pagamento seguro ao freelancer via Stripe.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handlePayment} className="space-y-4 pt-4">
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-sm space-y-2 mb-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Beneficiário:</span>
              <span className="font-semibold text-slate-900">{freelancerNome || 'Freelancer'}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <span className="text-slate-500 font-medium">Valor Total:</span>
              <span className="font-bold text-primary text-lg">{formatCurrency(valorFinal)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardNumber">Número do Cartão</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                placeholder="0000 0000 0000 0000"
                required
                defaultValue="4242 4242 4242 4242"
                className="pl-10 font-mono"
              />
              <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Validade</Label>
              <Input
                id="expiry"
                placeholder="MM/AA"
                required
                defaultValue="12/28"
                className="font-mono text-center"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                placeholder="123"
                required
                defaultValue="123"
                className="font-mono text-center"
                maxLength={4}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nome Impresso no Cartão</Label>
            <Input
              id="name"
              placeholder="Ex: JOAO A SILVA"
              required
              defaultValue="EMPRESA EXEMPLO SA"
              className="uppercase"
            />
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-6 pt-4 border-t border-slate-100">
            <Lock className="w-3 h-3 text-slate-400" />
            Ambiente seguro protegido por criptografia de ponta a ponta
          </div>

          <DialogFooter className="mt-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground font-semibold"
            >
              {loading ? 'Processando Pagamento...' : `Confirmar Pagamento`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
