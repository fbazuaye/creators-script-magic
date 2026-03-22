import { useState, useEffect } from "react";
import { Coins, Zap, Crown, Sparkles, ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import { useCredits } from "@/hooks/useCredits";
import { toast } from "sonner";

const PACKS = [
  {
    id: "credits_10",
    credits: 10,
    price: "$4.99",
    icon: Coins,
    label: "Starter",
    description: "Try it out",
    accent: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  },
  {
    id: "credits_50",
    credits: 50,
    price: "$19.99",
    icon: Zap,
    label: "Creator",
    description: "Most popular",
    popular: true,
    accent: "bg-primary/10 text-primary border-primary/30",
  },
  {
    id: "credits_100",
    credits: 100,
    price: "$34.99",
    icon: Crown,
    label: "Power",
    description: "Best value",
    accent: "bg-amber-500/10 text-amber-700 border-amber-200",
  },
];

export default function BuyCredits() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { openCheckout, loading } = usePaddleCheckout();
  const { credits, userId, refetch } = useCredits();
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser({ id: data.user.id, email: data.user.email ?? undefined });
    });
  }, []);

  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      toast.success("Purchase complete! Credits will appear shortly.");
      // Poll for credit update
      const interval = setInterval(() => refetch(), 2000);
      setTimeout(() => clearInterval(interval), 20000);
    }
  }, [searchParams, refetch]);

  const handleBuy = async (pack: typeof PACKS[0]) => {
    if (!user) {
      toast.error("Please sign in to purchase credits");
      navigate("/auth");
      return;
    }

    setBuyingId(pack.id);
    try {
      await openCheckout({
        priceId: pack.id,
        customerEmail: user.email,
        customData: { userId: user.id },
        successUrl: `${window.location.origin}/buy-credits?checkout=success`,
      });
    } catch (err) {
      toast.error("Something went wrong opening checkout");
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg p-2 transition-colors hover:bg-secondary active:scale-95"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Buy Credits</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Each script or thumbnail generation uses 1 credit
          </p>
        </div>
      </div>

      {userId && (
        <div className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-3">
          <Sparkles className="h-4 w-4 text-amber-600" />
          <span className="text-sm text-muted-foreground">Current balance:</span>
          <span className="font-semibold tabular-nums">{credits}</span>
          <span className="text-sm text-muted-foreground">credits</span>
        </div>
      )}

      <div className="space-y-3">
        {PACKS.map((pack) => {
          const Icon = pack.icon;
          const isBuying = buyingId === pack.id;
          return (
            <button
              key={pack.id}
              onClick={() => handleBuy(pack)}
              disabled={loading || isBuying}
              className={`relative flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-60 ${pack.accent}`}
            >
              {pack.popular && (
                <span className="absolute -top-2.5 right-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm">
                  Popular
                </span>
              )}
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-background shadow-sm">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold">{pack.label}</span>
                  <span className="text-xs opacity-70">{pack.description}</span>
                </div>
                <div className="mt-0.5 text-sm">
                  <span className="font-bold tabular-nums">{pack.credits}</span>{" "}
                  <span className="opacity-70">credits</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold tabular-nums">{pack.price}</span>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        One-time purchases · Secure checkout · No subscription
      </p>
    </div>
  );
}
