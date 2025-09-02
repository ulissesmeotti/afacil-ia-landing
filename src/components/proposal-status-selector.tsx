import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ProposalStatus = 'pending' | 'accepted' | 'rejected'

interface ProposalStatusSelectorProps {
  value: ProposalStatus
  onValueChange: (value: ProposalStatus) => void
  disabled?: boolean
}

export function ProposalStatusSelector({ value, onValueChange, disabled }: ProposalStatusSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-background border">
        <SelectItem value="pending">Aguardando</SelectItem>
        <SelectItem value="accepted">Aceita</SelectItem>
        <SelectItem value="rejected">Rejeitada</SelectItem>
      </SelectContent>
    </Select>
  )
}