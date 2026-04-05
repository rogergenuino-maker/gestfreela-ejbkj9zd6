/* Toaster Component - A component that displays a toaster (a component that displays a toast) - from shadcn/ui (exposes Toaster) */
import { useToast } from '@/hooks/use-toast'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider duration={4000}>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex gap-3 w-full">
              {variant === 'success' && (
                <CheckCircle2 className="h-5 w-5 mt-0.5 text-green-600 shrink-0" />
              )}
              {variant === 'destructive' && (
                <AlertCircle className="h-5 w-5 mt-0.5 text-red-600 shrink-0" />
              )}
              {variant === 'warning' && (
                <AlertTriangle className="h-5 w-5 mt-0.5 text-yellow-600 shrink-0" />
              )}
              {variant === 'info' && <Info className="h-5 w-5 mt-0.5 text-blue-600 shrink-0" />}
              <div className="grid gap-1 flex-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
