import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { FileText, Image, FolderOpen, Sparkles } from "lucide-react";

const tabs = [
  { path: "/", icon: FileText, label: "Script" },
  { path: "/thumbnails", icon: Image, label: "Thumbnail" },
  { path: "/projects", icon: FolderOpen, label: "Projects" },
];

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b bg-background/80 px-4 py-3 backdrop-blur-md">
        <Sparkles className="h-5 w-5 text-primary" />
        <h1 className="text-base font-semibold tracking-tight text-foreground">
          CreatorScript <span className="font-normal text-muted-foreground">AI</span>
        </h1>
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
                className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs transition-colors active:scale-95 ${
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
    </div>
  );
}
