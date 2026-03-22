import { Coins } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";

export function CreditBalance() {
  const { credits, isLoading } = useCredits();

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-700">
        <Coins className="h-3.5 w-3.5" />
        <span className="tabular-nums">...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-700">
      <Coins className="h-3.5 w-3.5" />
      <span className="tabular-nums">{credits}</span>
      <span>credits</span>
    </div>
  );
}
