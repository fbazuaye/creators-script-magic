import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { FileText, Image, FolderOpen, User, LogOut, Coins, Shield } from "lucide-react";
import creatronLogo from "@/assets/creatron-logo.svg";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import InstallBanner from "@/components/InstallBanner";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { CreditBalance } from "@/components/CreditBalance";
import { useAdmin } from "@/hooks/useAdmin";
import type { User as SupaUser } from "@supabase/supabase-js";

const tabs = [
  { path: "/create", icon: FileText, label: "Script" },
  { path: "/thumbnails", icon: Image, label: "Thumbnail" },
  { path: "/projects", icon: FolderOpen, label: "Projects" },
];

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<SupaUser | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const { isAdmin } = useAdmin();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setShowMenu(false);
    toast.success("Signed out");
    navigate("/");
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <PaymentTestModeBanner />
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <img src={creatronLogo} alt="Creatron" className="h-8" />
        </div>
        </div>

        {user ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/buy-credits")}
              className="transition-all active:scale-95"
            >
              <CreditBalance />
            </button>
            <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-all active:scale-95"
            >
              <User className="h-3.5 w-3.5" />
              <span className="max-w-[100px] truncate">{user.email?.split("@")[0]}</span>
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border bg-card p-1 shadow-lg animate-fade-up">
                  <p className="px-3 py-2 text-xs text-muted-foreground truncate">{user.email}</p>
                  {isAdmin && (
                    <button
                      onClick={() => { navigate("/admin"); setShowMenu(false); }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted active:scale-[0.97]"
                    >
                      <Shield className="h-4 w-4" />
                      Admin Dashboard
                    </button>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10 active:scale-[0.97]"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate("/auth")}
            className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all active:scale-95"
          >
            Sign In
          </button>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-md">
          {tabs.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 min-h-[48px] py-3 text-xs transition-colors active:scale-95 ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.6} />
                <span className={active ? "font-medium" : ""}>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <InstallBanner />
    </div>
  );
}
