import { useState } from "react";
import { Plus, FolderOpen, FileText, Image, Clock, MoreVertical } from "lucide-react";

interface Project {
  id: string;
  name: string;
  scripts: number;
  thumbnails: number;
  updatedAt: string;
}

const DEMO_PROJECTS: Project[] = [
  { id: "1", name: "YouTube Growth Series", scripts: 5, thumbnails: 3, updatedAt: "2 hours ago" },
  { id: "2", name: "Product Launch Campaign", scripts: 2, thumbnails: 4, updatedAt: "Yesterday" },
  { id: "3", name: "Weekly Vlogs", scripts: 8, thumbnails: 7, updatedAt: "3 days ago" },
];

export default function Projects() {
  const [projects] = useState<Project[]>(DEMO_PROJECTS);

  return (
    <div className="mx-auto max-w-lg space-y-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Projects</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize scripts & thumbnails by project.
          </p>
        </div>
        <button className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all active:scale-95">
          <Plus className="h-4 w-4" />
          New
        </button>
      </div>

      {projects.length === 0 ? (
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
            <div
              key={project.id}
              className="animate-fade-up rounded-xl border bg-card p-4 shadow-sm transition-all active:scale-[0.98]"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start justify-between">
                <h3 className="font-medium text-card-foreground">{project.name}</h3>
                <button className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted active:scale-90">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  {project.scripts} scripts
                </span>
                <span className="flex items-center gap-1">
                  <Image className="h-3.5 w-3.5" />
                  {project.thumbnails} thumbnails
                </span>
                <span className="flex items-center gap-1 ml-auto">
                  <Clock className="h-3.5 w-3.5" />
                  {project.updatedAt}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
