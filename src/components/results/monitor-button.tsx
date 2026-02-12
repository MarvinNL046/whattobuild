"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";

interface MonitorButtonProps {
  niche: string;
  sourceUrl?: string;
  researchTypes?: ("saas" | "ecommerce" | "directory" | "website")[];
}

export function MonitorButton({ niche, sourceUrl, researchTypes }: MonitorButtonProps) {
  const monitor = useQuery(api.monitoredNiches.getMonitorByNiche, { niche });
  const create = useMutation(api.monitoredNiches.create);
  const remove = useMutation(api.monitoredNiches.remove);
  const [loading, setLoading] = useState(false);

  if (monitor === undefined) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="size-3.5 animate-spin" />
      </Button>
    );
  }

  const isMonitored = monitor !== null;

  async function handleToggle() {
    setLoading(true);
    try {
      if (isMonitored) {
        await remove({ monitorId: monitor!.monitorId });
      } else {
        await create({ niche, sourceUrl, researchTypes });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant={isMonitored ? "secondary" : "outline"}
      size="sm"
      onClick={handleToggle}
      disabled={loading}
      title={isMonitored ? "Stop monitoring this niche" : "Get weekly email alerts for this niche"}
    >
      {loading ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : isMonitored ? (
        <EyeOff className="size-3.5" />
      ) : (
        <Eye className="size-3.5" />
      )}
      <span className="hidden sm:inline">
        {isMonitored ? "Monitoring" : "Monitor"}
      </span>
    </Button>
  );
}
