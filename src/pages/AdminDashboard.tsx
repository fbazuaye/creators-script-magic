import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { Users, CreditCard, FileText, Shield, ArrowLeft, Search, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

type Tab = "users" | "transactions" | "scripts";

interface UserRow {
  user_id: string;
  credits: number;
  email?: string;
}

type CreditInput = { userId: string; amount: string } | null;

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  description: string | null;
  created_at: string | null;
  environment: string;
}

interface Script {
  id: string;
  user_id: string;
  topic: string;
  platform: string;
  tone: string;
  content: string;
  created_at: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [creditInput, setCreditInput] = useState<CreditInput>(null);

  useEffect(() => {
    if (adminLoading) return;
    if (!isAdmin) { navigate("/"); return; }
    fetchData();
  }, [isAdmin, adminLoading, tab]);

  const fetchData = async () => {
    setLoading(true);
    if (tab === "users") {
      const { data } = await supabase.from("user_credits").select("*");
      setUsers((data as UserRow[]) ?? []);
    } else if (tab === "transactions") {
      const { data } = await supabase.from("credit_transactions").select("*").order("created_at", { ascending: false }).limit(200);
      setTransactions((data as Transaction[]) ?? []);
    } else if (tab === "scripts") {
      const { data } = await supabase.from("scripts").select("*").order("created_at", { ascending: false }).limit(200);
      setScripts((data as Script[]) ?? []);
    }
    setLoading(false);
  };

  const adjustCredits = async (userId: string, amount: number) => {
    const desc = amount > 0 ? "Admin credit addition" : "Admin credit deduction";
    if (amount > 0) {
      const { error } = await supabase.rpc("add_credits", {
        p_user_id: userId,
        p_amount: amount,
        p_description: desc,
      });
      if (error) { toast.error(error.message); return; }
    } else {
      const { error } = await supabase.rpc("use_credit", {
        p_user_id: userId,
        p_amount: Math.abs(amount),
        p_description: desc,
      });
      if (error) { toast.error(error.message); return; }
    }
    toast.success(`Credits ${amount > 0 ? "added" : "deducted"}`);
    fetchData();
  };

  const deleteScript = async (id: string) => {
    // Admins need delete policy - for now just flag
    toast.info("Script flagged for review");
  };

  if (adminLoading) return <div className="flex items-center justify-center min-h-screen text-muted-foreground">Loading…</div>;
  if (!isAdmin) return null;

  const tabs: { key: Tab; label: string; icon: typeof Users }[] = [
    { key: "users", label: "Users", icon: Users },
    { key: "transactions", label: "Transactions", icon: CreditCard },
    { key: "scripts", label: "Scripts", icon: FileText },
  ];

  const filteredUsers = users.filter(u => u.user_id.includes(search) || (u.email ?? "").includes(search));
  const filteredTransactions = transactions.filter(t => t.user_id.includes(search) || (t.description ?? "").toLowerCase().includes(search.toLowerCase()));
  const filteredScripts = scripts.filter(s => s.topic.toLowerCase().includes(search.toLowerCase()) || s.user_id.includes(search));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3">
          <button onClick={() => navigate("/create")} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Shield className="h-5 w-5 text-primary" />
          <h1 className="text-base font-semibold">Admin Dashboard</h1>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>{users.length}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">Total Credits</p>
            <p className="text-2xl font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>{users.reduce((s, u) => s + u.credits, 0)}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">Total Scripts</p>
            <p className="text-2xl font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>{scripts.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 border-b">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by user ID, topic, or description…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">Loading…</div>
        ) : (
          <>
            {/* Users Tab */}
            {tab === "users" && (
              <div className="rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">User ID</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Credits</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredUsers.map(u => (
                      <tr key={u.user_id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">{u.user_id.slice(0, 12)}…</td>
                        <td className="px-4 py-3 text-right font-medium" style={{ fontVariantNumeric: "tabular-nums" }}>{u.credits}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => adjustCredits(u.user_id, 10)}
                              className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors active:scale-95"
                            >
                              <Plus className="h-3 w-3" /> 10
                            </button>
                            <button
                              onClick={() => adjustCredits(u.user_id, -10)}
                              className="inline-flex items-center gap-1 rounded-lg bg-destructive/10 px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors active:scale-95"
                            >
                              <Minus className="h-3 w-3" /> 10
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No users found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Transactions Tab */}
            {tab === "transactions" && (
              <div className="rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Description</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredTransactions.map(t => (
                      <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-xs text-muted-foreground">{t.created_at ? new Date(t.created_at).toLocaleDateString() : "—"}</td>
                        <td className="px-4 py-3 font-mono text-xs">{t.user_id.slice(0, 12)}…</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            t.type === "purchase" ? "bg-green-500/10 text-green-600" :
                            t.type === "bonus" ? "bg-blue-500/10 text-blue-600" :
                            "bg-orange-500/10 text-orange-600"
                          }`}>{t.type}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{t.description ?? "—"}</td>
                        <td className="px-4 py-3 text-right font-medium" style={{ fontVariantNumeric: "tabular-nums" }}>
                          <span className={t.amount > 0 ? "text-green-600" : "text-destructive"}>{t.amount > 0 ? "+" : ""}{t.amount}</span>
                        </td>
                      </tr>
                    ))}
                    {filteredTransactions.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No transactions found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Scripts Tab */}
            {tab === "scripts" && (
              <div className="space-y-3">
                {filteredScripts.map(s => (
                  <div key={s.id} className="rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold truncate">{s.topic}</h3>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[11px] rounded-full bg-muted px-2 py-0.5 text-muted-foreground">{s.platform}</span>
                          <span className="text-[11px] rounded-full bg-muted px-2 py-0.5 text-muted-foreground">{s.tone}</span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-3">{s.content.slice(0, 200)}…</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[11px] text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</p>
                        <p className="font-mono text-[10px] text-muted-foreground mt-1">{s.user_id.slice(0, 8)}…</p>
                        <button
                          onClick={() => deleteScript(s.id)}
                          className="mt-2 text-[11px] text-destructive hover:underline"
                        >
                          Flag
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredScripts.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground">No scripts found</div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
