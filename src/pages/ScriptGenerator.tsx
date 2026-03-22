import { useState, useRef, useEffect } from "react";
import { Sparkles, Copy, Check, ChevronDown, Square, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PLATFORMS = ["YouTube", "TikTok", "Instagram Reels", "Podcast", "Blog"];
const TONES = ["Casual", "Professional", "Funny", "Educational", "Dramatic"];

export default function ScriptGenerator() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("YouTube");
  const [tone, setTone] = useState("Casual");
  const [duration, setDuration] = useState("5");
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setScript("");
    abortRef.current = new AbortController();

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-script`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ topic, platform, tone, duration }),
        signal: abortRef.current.signal,
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Generation failed" }));
        toast.error(err.error || "Something went wrong");
        setLoading(false);
        return;
      }

      if (!resp.body) throw new Error("No response body");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              full += content;
              setScript(full);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        toast.error("Failed to generate script");
        console.error(e);
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!script || !userId) {
      toast.error(userId ? "No script to save" : "Sign in to save scripts");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("scripts").insert({
      user_id: userId,
      topic,
      platform,
      tone,
      duration,
      content: script,
    });
    setSaving(false);
    if (error) {
      toast.error("Failed to save script");
      console.error(error);
    } else {
      toast.success("Script saved!");
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-5 animate-fade-up">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Script Generator</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Describe your video topic and get a ready-to-use script.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Topic</label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. How to grow on YouTube in 2025"
          rows={3}
          className="w-full rounded-xl border bg-card px-3.5 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <SelectField label="Platform" value={platform} options={PLATFORMS} onChange={setPlatform} />
        <SelectField label="Tone" value={tone} options={TONES} onChange={setTone} />
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Duration</label>
          <div className="relative">
            <input
              type="number"
              min={1}
              max={60}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full rounded-lg border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">min</span>
          </div>
        </div>
      </div>

      {loading ? (
        <button
          onClick={handleStop}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive bg-destructive/10 py-3.5 text-sm font-semibold text-destructive transition-all active:scale-[0.97]"
        >
          <Square className="h-4 w-4" />
          Stop Generating
        </button>
      ) : (
        <button
          onClick={handleGenerate}
          disabled={!topic.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-[0.97] disabled:opacity-50 disabled:shadow-none"
        >
          <Sparkles className="h-4 w-4" />
          Generate Script
        </button>
      )}

      {script && (
        <div className="animate-fade-up space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Your Script</span>
            <div className="flex items-center gap-2">
              {userId && (
                <button
                  onClick={handleSave}
                  disabled={saving || loading}
                  className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-all active:scale-95 disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  {saving ? "Saving…" : "Save"}
                </button>
              )}
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-all active:scale-95"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
          <div className="whitespace-pre-wrap rounded-xl border bg-card p-4 text-sm leading-relaxed text-card-foreground shadow-sm">
            {script}
            {loading && <span className="inline-block w-1.5 h-4 ml-0.5 bg-primary animate-pulse rounded-sm" />}
          </div>
        </div>
      )}

      {!userId && script && (
        <p className="text-center text-xs text-muted-foreground">
          Sign in to save scripts to your projects.
        </p>
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border bg-card px-3 py-2 pr-7 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  );
}
