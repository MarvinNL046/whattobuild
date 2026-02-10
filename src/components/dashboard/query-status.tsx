import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { label: "Queued", variant: "secondary" },
  scraping: { label: "Scraping", variant: "outline" },
  analyzing: { label: "Analyzing", variant: "outline" },
  fetching_volume: { label: "Volume data", variant: "outline" },
  done: { label: "Done", variant: "default" },
  failed: { label: "Failed", variant: "destructive" },
};

export function QueryStatus({
  status,
  animate = false,
}: {
  status: string;
  animate?: boolean;
}) {
  const config = STATUS_CONFIG[status] ?? { label: status, variant: "secondary" as const };
  const isDone = status === "done";
  const isFailed = status === "failed";

  return (
    <Badge variant={config.variant} className={cn("gap-1 text-xs")}>
      {isDone && <CheckCircle2 className="size-3" />}
      {isFailed && <XCircle className="size-3" />}
      {animate && !isDone && !isFailed && (
        <Loader2 className="size-3 animate-spin" />
      )}
      {config.label}
    </Badge>
  );
}
