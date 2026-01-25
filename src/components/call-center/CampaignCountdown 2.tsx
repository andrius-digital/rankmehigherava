import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { differenceInDays, addDays } from "date-fns";

interface CampaignCountdownProps {
  campaignStartDate: string;
  campaignLength: number;
  compact?: boolean;
}

export default function CampaignCountdown({ campaignStartDate, campaignLength, compact = false }: CampaignCountdownProps) {
  const endDate = addDays(new Date(campaignStartDate), campaignLength);
  const remaining = differenceInDays(endDate, new Date());

  const isUrgent = remaining <= 5;
  const isEnded = remaining <= 0;

  if (compact) {
    return (
      <span className={`font-bold ${isUrgent ? "text-destructive" : "text-foreground"}`}>
        {isEnded ? "Ended" : `${remaining}d`}
      </span>
    );
  }

  return (
    <Badge 
      variant={isUrgent ? "destructive" : "secondary"} 
      className="flex items-center gap-1 whitespace-nowrap"
    >
      <Clock className="h-3 w-3" />
      {isEnded ? "Campaign ended" : `${remaining} days left`}
    </Badge>
  );
}
