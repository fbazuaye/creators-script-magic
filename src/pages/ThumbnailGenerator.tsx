import { useState } from "react";
import { ImagePlus, Wand2, Sliders } from "lucide-react";

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

      {/* Mode Toggle */}
      <div className="flex gap-2 rounded-xl bg-secondary p-1">
        <ModeTab
          active={mode === "generate"}
          icon={<Wand2 className="h-4 w-4" />}
          label="Generate"
          onClick={() => setMode("generate")}
        />
        <ModeTab
          active={mode === "edit"}
          icon={<Sliders className="h-4 w-4" />}
          label="Edit"
          onClick={() => setMode("edit")}
        />
      </div>

      {mode === "generate" ? <GenerateView /> : <EditView />}
    </div>
  );
}

function ModeTab({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all active:scale-[0.97] ${
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function GenerateView() {
  const [prompt, setPrompt] = useState("");

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

      {/* Size Preset */}
      <div className="flex gap-2">
        {["1280×720", "1080×1080", "1080×1920"].map((size) => (
          <button
            key={size}
            className="rounded-lg border bg-card px-3 py-2 text-xs font-medium text-card-foreground transition-all first:border-primary first:bg-primary/5 first:text-primary active:scale-95"
          >
            {size}
          </button>
        ))}
      </div>

      <button
        disabled={!prompt.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-[0.97] disabled:opacity-50 disabled:shadow-none"
      >
        <Wand2 className="h-4 w-4" />
        Generate Thumbnail
      </button>

      {/* Placeholder Grid */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex aspect-video items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 text-muted-foreground"
          >
            <ImagePlus className="h-6 w-6" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EditView() {
  return (
    <div className="animate-fade-up space-y-4">
      {/* Upload Area */}
      <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/30 py-12 transition-colors hover:border-primary/40 hover:bg-muted/50 active:scale-[0.99]">
        <div className="rounded-full bg-primary/10 p-3">
          <ImagePlus className="h-6 w-6 text-primary" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Upload a thumbnail to edit</p>
          <p className="mt-0.5 text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
        </div>
        <input type="file" accept="image/*" className="hidden" />
      </label>

      <div className="space-y-2">
        <p className="text-sm font-medium">Quick Actions</p>
        <div className="flex flex-wrap gap-2">
          {["Add Text", "Remove Background", "Resize", "Add Border", "Color Grade"].map((action) => (
            <button
              key={action}
              className="rounded-lg border bg-card px-3 py-2 text-xs font-medium text-card-foreground transition-all active:scale-95"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
