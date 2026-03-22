import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Sparkles,
  FileText,
  Image,
  Zap,
  TrendingUp,
  Users,
  ArrowRight,
  Play,
  Youtube,
  Instagram,
  Linkedin,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const platforms = [
  { icon: Youtube, label: "YouTube" },
  { icon: () => <span className="text-sm font-bold">T</span>, label: "TikTok" },
  { icon: Instagram, label: "Instagram" },
  { icon: Linkedin, label: "LinkedIn" },
];

const stats = [
  { value: "10K+", label: "Scripts Generated" },
  { value: "5K+", label: "Creators" },
  { value: "98%", label: "Satisfaction" },
];

const features = [
  {
    icon: FileText,
    title: "AI Script Generator",
    desc: "Create compelling, platform-optimized scripts for any audience in seconds.",
  },
  {
    icon: Image,
    title: "Thumbnail Creator",
    desc: "Generate eye-catching thumbnails that boost click-through rates.",
  },
  {
    icon: TrendingUp,
    title: "Multi-Platform",
    desc: "Tailored scripts for YouTube, TikTok, Instagram, LinkedIn, and more.",
  },
  {
    icon: Zap,
    title: "Instant Generation",
    desc: "Production-ready content in seconds — spend less time writing, more creating.",
  },
  {
    icon: Users,
    title: "Project Organization",
    desc: "Keep all your scripts and thumbnails organized by project and campaign.",
  },
  {
    icon: CheckCircle2,
    title: "Credit-Based Pricing",
    desc: "Pay only for what you use — no subscriptions, no hidden fees.",
  },
];

export default function Index() {
  const navigate = useNavigate();
  const [user, setUser] = useState<null | object>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ─── Navbar ─── */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-base font-semibold tracking-tight">
              CreatorScript <span className="font-normal text-muted-foreground">AI</span>
            </span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <button onClick={() => navigate("/create")} className="transition-colors hover:text-foreground">
              Create
            </button>
            <button onClick={() => navigate("/buy-credits")} className="transition-colors hover:text-foreground">
              Pricing
            </button>
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={() => navigate("/create")}
                className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 active:scale-[0.97]"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/auth")}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate("/auth")}
                  className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 active:scale-[0.97]"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section
        className={`relative flex flex-col items-center px-5 pt-20 pb-16 text-center transition-all duration-700 ease-out md:pt-28 md:pb-24 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* Decorative glow */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[420px] w-[620px] rounded-full bg-primary/8 blur-[120px]" />

        <span className="relative mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          AI-Powered Content Creation
        </span>

        <h1 className="relative max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl" style={{ textWrap: "balance" } as React.CSSProperties}>
          From Script to Screen{" "}
          <span className="text-primary">— Powered by AI</span>
        </h1>

        <p
          className="relative mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg"
          style={{ textWrap: "pretty" } as React.CSSProperties}
        >
          Generate scripts, thumbnails, and ready-to-publish content for YouTube,
          TikTok, Instagram, and more — optimized for engagement and growth.
        </p>

        {/* Platform badges */}
        <div className="relative mt-7 flex flex-wrap justify-center gap-2">
          {platforms.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="relative mt-9 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate(user ? "/create" : "/auth")}
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97]"
          >
            Start Creating Free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            onClick={() => navigate("/create")}
            className="inline-flex items-center gap-2 rounded-full border bg-card px-7 py-3 text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-secondary active:scale-[0.97]"
          >
            <Play className="h-4 w-4" />
            Try It Out
          </button>
        </div>

        {/* Stats */}
        <div className="relative mt-14 flex gap-10 md:gap-16">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-bold tracking-tight text-foreground md:text-3xl" style={{ fontVariantNumeric: "tabular-nums" }}>
                {value}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="mx-auto max-w-5xl px-5 py-16 md:py-24">
        <FadeInOnScroll className="text-center mb-12">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl" style={{ textWrap: "balance" } as React.CSSProperties}>
            Everything You Need to Create
          </h2>
          <p className="mt-3 text-muted-foreground text-sm md:text-base">
            Powerful AI tools designed for modern content creators who want to stand out.
          </p>
        </FadeInOnScroll>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <FadeInOnScroll key={title} delay={i * 80}>
              <div className="group rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            </FadeInOnScroll>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="mx-auto max-w-3xl px-5 py-16 text-center md:py-24">
        <FadeInOnScroll>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl" style={{ textWrap: "balance" } as React.CSSProperties}>
            Ready to Create Content That Converts?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground text-sm md:text-base">
            Join thousands of creators using CreatorScript AI to produce engaging content faster than ever.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate(user ? "/create" : "/auth")}
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97]"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={() => navigate("/create")}
              className="inline-flex items-center gap-2 rounded-full border bg-card px-7 py-3 text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-secondary active:scale-[0.97]"
            >
              Try Without Account
            </button>
          </div>
        </FadeInOnScroll>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} CreatorScript AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

/* ─── Scroll reveal wrapper ─── */
function FadeInOnScroll({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(ref);
    return () => obs.disconnect();
  }, [ref]);

  return (
    <div
      ref={setRef}
      className={className}
      style={{
        transition: `opacity 600ms ease-out ${delay}ms, transform 600ms ease-out ${delay}ms, filter 600ms ease-out ${delay}ms`,
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(18px)",
        filter: inView ? "blur(0)" : "blur(4px)",
      }}
    >
      {children}
    </div>
  );
}
