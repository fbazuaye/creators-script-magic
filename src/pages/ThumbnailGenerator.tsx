import { useState, useRef } from "react";
import { ImagePlus, Wand2, Sliders, Download, Loader2, X } from "lucide-react";
import { toast } from "sonner";

type Size = { label: string; w: number; h: number };
const SIZES: Size[] = [
  { label: "1280×720", w: 1280, h: 720 },
  { label: "1080×1080", w: 1080, h: 1080 },
  { label: "1080×1920", w: 1080, h: 1920 },
];

export default function ThumbnailGenerator() {
  const [mode, setMode] = useState<"generate" | "edit">("generate");

  return (
    <div className="mx-auto max-w-lg space-y-5 animate-fade-up">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Thumbnails</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Create eye-catching thumbnails with AI or edit your own.
        </p>
      </div>

      <div className="flex gap-2 rounded-xl bg-secondary p-1">
        <ModeTab active={mode === "generate"} icon={<Wand2 className="h-4 w-4" />} label="Generate" onClick={() => setMode("generate")} />
        <ModeTab active={mode === "edit"} icon={<Sliders className="h-4 w-4" />} label="Edit" onClick={() => setMode("edit")} />
      </div>

      {mode === "generate" ? <GenerateView /> : <EditView />}
    </div>
  );
}

function ModeTab({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all active:scale-[0.97] ${
        active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function GenerateView() {
  const [prompt, setPrompt] = useState("");
  const [sizeIdx, setSizeIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);

    const size = SIZES[sizeIdx];
    const fullPrompt = `${prompt}. Aspect ratio suitable for ${size.label} (${size.w}x${size.h}).`;

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-thumbnail`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ prompt: fullPrompt }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Generation failed" }));
        toast.error(err.error || "Something went wrong");
        setLoading(false);
        return;
      }

      const data = await resp.json();
      if (data.imageUrl) {
        setImages((prev) => [data.imageUrl, ...prev].slice(0, 8));
        toast.success("Thumbnail generated!");
      } else {
        toast.error("No image returned");
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to generate thumbnail");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (dataUrl: string, index: number) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `thumbnail-${index + 1}.png`;
    a.click();
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Describe your thumbnail</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. A person looking shocked at a laptop screen, bold text 'I QUIT MY JOB', red and yellow colors"
          rows={3}
          className="w-full rounded-xl border bg-card px-3.5 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>

      <div className="flex gap-2">
        {SIZES.map((size, i) => (
          <button
            key={size.label}
            onClick={() => setSizeIdx(i)}
            className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all active:scale-95 ${
              i === sizeIdx
                ? "border-primary bg-primary/5 text-primary"
                : "bg-card text-card-foreground"
            }`}
          >
            {size.label}
          </button>
        ))}
      </div>

      <button
        onClick={handleGenerate}
        disabled={!prompt.trim() || loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-[0.97] disabled:opacity-50 disabled:shadow-none"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
        {loading ? "Generating…" : "Generate Thumbnail"}
      </button>

      {/* Results */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {images.map((src, i) => (
            <div key={i} className="group relative overflow-hidden rounded-xl border shadow-sm animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <img src={src} alt={`Generated thumbnail ${i + 1}`} className="aspect-video w-full object-cover" />
              <button
                onClick={() => handleDownload(src, i)}
                className="absolute bottom-2 right-2 rounded-lg bg-background/80 p-1.5 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100 active:scale-90"
              >
                <Download className="h-4 w-4 text-foreground" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex aspect-video items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 text-muted-foreground">
              <ImagePlus className="h-6 w-6" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EditView() {
  const [editImage, setEditImage] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [editResult, setEditResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large (max 10MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setEditImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleEdit = async () => {
    if (!editImage || !editPrompt.trim()) return;
    setLoading(true);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-thumbnail`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ prompt: editPrompt, editImage }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Edit failed" }));
        toast.error(err.error || "Something went wrong");
        setLoading(false);
        return;
      }

      const data = await resp.json();
      if (data.imageUrl) {
        setEditResult(data.imageUrl);
        toast.success("Image edited!");
      } else {
        toast.error("No image returned");
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to edit image");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (dataUrl: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "edited-thumbnail.png";
    a.click();
  };

  return (
    <div className="animate-fade-up space-y-4">
      {editImage ? (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-xl border">
            <img src={editImage} alt="Upload preview" className="w-full object-contain max-h-64" />
            <button
              onClick={() => { setEditImage(null); setEditResult(null); setEditPrompt(""); }}
              className="absolute top-2 right-2 rounded-lg bg-background/80 p-1.5 shadow-sm backdrop-blur-sm transition-all active:scale-90"
            >
              <X className="h-4 w-4 text-foreground" />
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">What do you want to change?</label>
            <textarea
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder="e.g. Add bold text 'SUBSCRIBE', make colors more vibrant, remove background"
              rows={2}
              className="w-full rounded-xl border bg-card px-3.5 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <button
            onClick={handleEdit}
            disabled={!editPrompt.trim() || loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-[0.97] disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sliders className="h-4 w-4" />}
            {loading ? "Editing…" : "Apply Edit"}
          </button>

          {editResult && (
            <div className="space-y-2 animate-fade-up">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Result</span>
                <button
                  onClick={() => handleDownload(editResult)}
                  className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-all active:scale-95"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
              </div>
              <div className="overflow-hidden rounded-xl border shadow-sm">
                <img src={editResult} alt="Edited thumbnail" className="w-full object-contain" />
              </div>
            </div>
          )}
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/30 py-12 transition-colors hover:border-primary/40 hover:bg-muted/50 active:scale-[0.99]">
          <div className="rounded-full bg-primary/10 p-3">
            <ImagePlus className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Upload a thumbnail to edit</p>
            <p className="mt-0.5 text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
      )}
    </div>
  );
}
