import { useState } from "react";
import { Sparkles, Copy, Check, ChevronDown } from "lucide-react";

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

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setScript("");

    // Simulate AI generation (will connect to Lovable Cloud AI later)
    await new Promise((r) => setTimeout(r, 1500));

    setScript(
      `🎬 ${platform} Script — "${topic}"\n\n` +
        `[HOOK — 0:00]\nHey everyone! Today we're diving into ${topic}. ` +
        `Trust me, you don't want to miss this.\n\n` +
        `[INTRO — 0:15]\nSo here's the thing about ${topic}... ` +
        `Most people get this completely wrong. Let me break it down for you.\n\n` +
        `[MAIN CONTENT — 0:45]\nFirst, let's talk about why ${topic} matters right now. ` +
        `The key insight is that content creators who understand this see 3x more engagement.\n\n` +
        `Point 1: Start with your audience's biggest pain point.\n` +
        `Point 2: Share a personal story or case study.\n` +
        `Point 3: Give actionable takeaways they can use today.\n\n` +
        `[CTA — ${duration}:00]\nIf this helped you, smash that like button and subscribe. ` +
        `Drop a comment telling me what topic you want next!\n\n` +
        `---\nTone: ${tone} | Duration: ~${duration} min | Platform: ${platform}`
    );
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-lg space-y-5 animate-fade-up">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Script Generator</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Describe your video topic and get a ready-to-use script.
        </p>
      </div>

      {/* Topic Input */}
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

      {/* Options Row */}
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

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={loading || !topic.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-[0.97] disabled:opacity-50 disabled:shadow-none"
      >
        <Sparkles className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Generating…" : "Generate Script"}
      </button>

      {/* Output */}
      {script && (
        <div className="animate-fade-up space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Your Script</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-all active:scale-95"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="whitespace-pre-wrap rounded-xl border bg-card p-4 text-sm leading-relaxed text-card-foreground shadow-sm">
            {script}
          </div>
        </div>
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
