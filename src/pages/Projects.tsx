import { useState, useEffect } from "react";
import { Plus, FolderOpen, FileText, Image, Clock, MoreVertical, Trash2, Edit2, X, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Project = Tables<"projects"> & { script_count: number };

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [scripts, setScripts] = useState<Tables<"scripts">[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      if (data.user) fetchProjects(data.user.id);
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (uid) fetchProjects(uid);
      else { setProjects([]); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchProjects = async (uid: string) => {
    setLoading(true);
    const { data: projectsData, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", uid)
      .order("updated_at", { ascending: false });

    if (error) { console.error(error); setLoading(false); return; }

    // Get script counts
    const { data: scriptCounts } = await supabase
      .from("scripts")
      .select("project_id")
      .eq("user_id", uid)
      .not("project_id", "is", null);

    const countMap: Record<string, number> = {};
    scriptCounts?.forEach((s) => {
      if (s.project_id) countMap[s.project_id] = (countMap[s.project_id] || 0) + 1;
    });

    setProjects(
      (projectsData || []).map((p) => ({ ...p, script_count: countMap[p.id] || 0 }))
    );
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!newName.trim() || !userId) return;
    setCreating(true);
    const { error } = await supabase.from("projects").insert({
      user_id: userId,
      name: newName.trim(),
      description: newDesc.trim() || null,
    });
    setCreating(false);
    if (error) {
      toast.error("Failed to create project");
    } else {
      toast.success("Project created!");
      setNewName("");
      setNewDesc("");
      setShowNew(false);
      fetchProjects(userId);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else if (userId) fetchProjects(userId);
  };

  const handleExpand = async (projectId: string) => {
    if (expandedId === projectId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(projectId);
    const { data } = await supabase
      .from("scripts")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    setScripts(data || []);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  if (!userId) {
    return (
      <div className="mx-auto max-w-lg animate-fade-up">
        <h2 className="text-xl font-semibold tracking-tight">Projects</h2>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to create and manage projects.</p>
        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <div className="rounded-full bg-muted p-4">
            <FolderOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Sign in to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Projects</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize scripts & thumbnails by project.
          </p>
        </div>
        <button
          onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all active:scale-95"
        >
          {showNew ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showNew ? "Cancel" : "New"}
        </button>
      </div>

      {/* New Project Form */}
      {showNew && (
        <div className="animate-fade-up space-y-3 rounded-xl border bg-card p-4 shadow-sm">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Project name"
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={handleCreate}
            disabled={!newName.trim() || creating}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all active:scale-[0.97] disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            {creating ? "Creating…" : "Create Project"}
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="rounded-full bg-muted p-4">
            <FolderOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No projects yet</p>
          <p className="text-xs text-muted-foreground">Create your first project to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project, i) => (
            <div key={project.id} style={{ animationDelay: `${i * 80}ms` }}>
              <div
                onClick={() => handleExpand(project.id)}
                className="animate-fade-up cursor-pointer rounded-xl border bg-card p-4 shadow-sm transition-all active:scale-[0.98]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-card-foreground">{project.name}</h3>
                    {project.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{project.description}</p>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive active:scale-90"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    {project.script_count} scripts
                  </span>
                  <span className="flex items-center gap-1 ml-auto">
                    <Clock className="h-3.5 w-3.5" />
                    {timeAgo(project.updated_at)}
                  </span>
                </div>
              </div>

              {/* Expanded scripts */}
              {expandedId === project.id && (
                <div className="mt-1 ml-3 space-y-2 border-l-2 border-border pl-3 pt-2">
                  {scripts.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2">No scripts in this project yet.</p>
                  ) : (
                    scripts.map((s) => (
                      <div key={s.id} className="rounded-lg border bg-card/50 p-3 text-xs">
                        <p className="font-medium text-card-foreground">{s.topic}</p>
                        <p className="mt-1 text-muted-foreground">
                          {s.platform} · {s.tone} · {s.duration}min · {timeAgo(s.created_at)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
