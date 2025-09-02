import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type ProposalStatus = 'pending' | 'accepted' | 'rejected'

interface ProposalStatusBadgeProps {
  status: ProposalStatus
  className?: string
}

const statusConfig = {
  pending: {
    label: 'Aguardando',
    variant: 'secondary' as const,
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  },
  accepted: {
    label: 'Aceita',
    variant: 'default' as const,
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  },
  rejected: {
    label: 'Rejeitada',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
}

export function ProposalStatusBadge({ status, className }: ProposalStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending
  
  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}