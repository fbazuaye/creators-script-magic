import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosBanner, setShowIosBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("pwa-install-dismissed")) return;

    // Android / Chrome
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS Safari detection
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone = ("standalone" in navigator && (navigator as any).standalone) ||
      window.matchMedia("(display-mode: standalone)").matches;
    if (isIos && !isStandalone) setShowIosBanner(true);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setDeferredPrompt(null);
    handleDismiss();
  };

  const handleDismiss = () => {
    setDismissed(true);
    setDeferredPrompt(null);
    setShowIosBanner(false);
    localStorage.setItem("pwa-install-dismissed", "1");
  };

  // Already installed or in standalone mode
  if (window.matchMedia("(display-mode: standalone)").matches) return null;
  if (dismissed) return null;
  if (!deferredPrompt && !showIosBanner) return null;

  return (
    <div className="fixed inset-x-0 bottom-[4.5rem] z-40 mx-auto w-[calc(100%-2rem)] max-w-md animate-fade-up">
      <div className="flex items-center gap-3 rounded-2xl border bg-card p-3.5 shadow-xl shadow-black/10">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Download className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-card-foreground">Install Creatron</p>
          <p className="text-xs text-muted-foreground truncate">
            {showIosBanner
              ? "Tap Share ⎋ then \"Add to Home Screen\""
              : "Add to home screen for quick access"}
          </p>
        </div>
        {deferredPrompt ? (
          <button
            onClick={handleInstall}
            className="shrink-0 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all active:scale-95"
          >
            Install
          </button>
        ) : null}
        <button
          onClick={handleDismiss}
          className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted active:scale-90"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
