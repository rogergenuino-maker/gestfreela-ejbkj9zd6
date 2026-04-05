import { useState, useEffect } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle } from 'lucide-react'

interface DangerConfirmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title: string
  description: string
  itemName?: string
  isLoading?: boolean
}

export function DangerConfirmModal({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  itemName,
  isLoading = false,
}: DangerConfirmModalProps) {
  const [confirmInput, setConfirmInput] = useState('')

  useEffect(() => {
    if (!open) {
      setConfirmInput('')
    }
  }, [open])

  const isConfirmValid = confirmInput === 'CONFIRMAR'

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl text-red-600">
            <AlertTriangle className="h-6 w-6" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-slate-600 space-y-4 pt-4">
            <p>{description}</p>
            {itemName && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900 break-words">
                {itemName}
              </div>
            )}
            <div className="space-y-2 mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <Label htmlFor="confirm-delete" className="text-slate-700 font-medium">
                Para confirmar, digite <strong className="text-red-600">CONFIRMAR</strong> abaixo:
              </Label>
              <Input
                id="confirm-delete"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="CONFIRMAR"
                className="border-slate-300 bg-white"
                autoComplete="off"
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel
            disabled={isLoading}
            className="border-slate-200 text-slate-600 hover:bg-slate-100"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              if (isConfirmValid) onConfirm()
            }}
            disabled={!isConfirmValid || isLoading}
            className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processando...' : 'Confirmar Exclusão'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
