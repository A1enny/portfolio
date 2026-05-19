// src/pages/ProjectsHubPage.tsx — ดึงข้อมูลจาก Supabase
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  Grid2X2,
  LayoutList,
  Loader2,
} from "lucide-react";
import { useSupabaseProjects } from "../hooks/useSupabaseProjects";
import type { Project } from "../hooks/useSupabaseProjects";
import Container from "../components/common/Container";
import GlobalBackground from "@/styles/GlobalBackground";

interface ProjectsHubPageProps {
  isDark: boolean;
  onSelectProject: (id: string) => void;
  onBack: () => void;
}

const ALL_ID = "all";

/* ── GRID CARD ── */
function GridCard({
  project,
  isDark,
  onClick,
}: {
  project: Project;
  isDark: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className="project-card group relative overflow-hidden rounded-2xl cursor-pointer aspect-[4/3]"
    >
      <img
        src={project.coverImage}
        alt={project.title}
        className="project-card-img absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <div className="absolute top-3 left-3 z-10">
        <span className="text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full bg-black/50 border border-white/10 backdrop-blur-md text-white/70">
          {project.category}
        </span>
      </div>
      <div className="absolute top-3 right-3 z-10">
        <span className="text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-white/60">
          {project.year}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 z-10 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] md:text-[17px] font-semibold leading-[1.2] tracking-tight text-white">
            {project.title}
          </h3>
          <p className="project-card-desc mt-1 text-xs text-white/50 line-clamp-2 leading-relaxed">
            {project.tagline}
          </p>
        </div>
        <div className="project-card-btn flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-white/12 border border-white/20 backdrop-blur-md hover:bg-white hover:text-black text-white">
          <ArrowUpRight size={14} />
        </div>
      </div>
    </motion.div>
  );
}

/* ── LIST CARD ── */
function ListCard({
  project,
  isDark,
  onClick,
}: {
  project: Project;
  isDark: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className={`group flex items-center gap-4 rounded-2xl border p-3 md:p-4 cursor-pointer transition-all duration-200
        ${
          isDark
            ? "border-white/8 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/15"
            : "border-black/8 bg-black/[0.03] hover:bg-black/[0.06] hover:border-black/12"
        }`}
    >
      <div className="relative h-16 w-24 md:h-[72px] md:w-[120px] flex-shrink-0 overflow-hidden rounded-xl">
        <img
          src={project.coverImage}
          alt={project.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="min-w-0 flex-1">
        <span
          className={`text-[10px] tracking-[0.14em] uppercase mb-1 block ${isDark ? "text-white/35" : "text-black/40"}`}
        >
          {project.category} · {project.year}
        </span>
        <h3
          className={`text-sm md:text-base font-semibold leading-snug line-clamp-1 ${isDark ? "text-white" : "text-black"}`}
        >
          {project.title}
        </h3>
        <p
          className={`mt-0.5 text-xs md:text-sm line-clamp-1 ${isDark ? "text-white/40" : "text-black/45"}`}
        >
          {project.tagline}
        </p>
      </div>

      <div className="hidden md:flex flex-shrink-0 gap-1.5 flex-wrap max-w-[150px] justify-end">
        {project.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className={`text-[10px] px-2 py-1 rounded-full border ${isDark ? "bg-white/6 text-white/45 border-white/8" : "bg-black/5 text-black/50 border-black/8"}`}
          >
            {tag}
          </span>
        ))}
      </div>

      <ArrowUpRight
        size={16}
        className={`flex-shrink-0 transition-colors duration-200 ${isDark ? "text-white/25 group-hover:text-white" : "text-black/25 group-hover:text-black"}`}
      />
    </motion.div>
  );
}

/* ── SKELETON ── */
function SkeletonGrid({ isDark }: { isDark: boolean }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 pb-24">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={`aspect-[4/3] rounded-2xl animate-pulse ${isDark ? "bg-white/6" : "bg-black/6"}`}
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  );
}

/* ── MAIN ── */
function ProjectsHubPage({
  isDark,
  onSelectProject,
  onBack,
}: ProjectsHubPageProps) {
  const [activeFilter, setActiveFilter] = useState(ALL_ID);
  const [layout, setLayout] = useState<"grid" | "list">("grid");

  /* ── Supabase ── */
  const { projects, projectCategories, loading, error } = useSupabaseProjects();

  const filters = useMemo(
    () => [
      { id: ALL_ID, label: "All", icon: "✦", count: projects.length },
      ...projectCategories.map((cat) => ({
        id: cat.id,
        label: cat.category,
        icon: cat.icon,
        count: cat.items.length,
      })),
    ],
    [projects.length, projectCategories],
  );

  const filtered = useMemo(
    () =>
      activeFilter === ALL_ID
        ? projects
        : projects.filter((p) => p.categoryId === activeFilter),
    [activeFilter, projects],
  );

  const muted = isDark ? "text-white/40" : "text-black/45";
  const divider = isDark ? "border-white/8" : "border-black/8";
  const text = isDark ? "text-white" : "text-black";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`min-h-screen ${text} transition-colors duration-300`}
    >
      <GlobalBackground isDark={isDark} />

      <div className="pt-20">
        <Container>
          {/* Toolbar */}
          <div
            className={`flex items-center justify-between py-4 md:py-5 border-b ${divider}`}
          >
            <button
              onClick={onBack}
              className={`flex items-center gap-2 text-sm transition-colors duration-200 group ${isDark ? "text-white/50 hover:text-white" : "text-black/50 hover:text-black"}`}
            >
              <ArrowLeft
                size={15}
                className="transition-transform duration-200 group-hover:-translate-x-1"
              />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div
              className={`flex items-center gap-1 rounded-full border p-1 ${isDark ? "border-white/10 bg-white/4" : "border-black/10 bg-black/[0.04]"}`}
            >
              {(["grid", "list"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setLayout(mode)}
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-200
                    ${
                      layout === mode
                        ? isDark
                          ? "bg-white/15 text-white"
                          : "bg-black/12 text-black"
                        : isDark
                          ? "text-white/35 hover:text-white"
                          : "text-black/35 hover:text-black"
                    }`}
                >
                  {mode === "grid" ? (
                    <Grid2X2 size={14} />
                  ) : (
                    <LayoutList size={14} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="pt-10 md:pt-14 pb-6 md:pb-8"
          >
            <p
              className={`text-[11px] tracking-[0.18em] uppercase mb-3 ${muted}`}
            >
              Selected works
            </p>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
              <h1
                className={`text-[clamp(40px,8vw,90px)] font-bold leading-none tracking-[-3px] ${text}`}
              >
                Projects
              </h1>
              <p className={`text-sm pb-1 ${muted}`}>
                {loading
                  ? "Loading…"
                  : `${filtered.length} ${filtered.length === 1 ? "work" : "works"}`}
              </p>
            </div>
          </motion.div>

          {/* Filters */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="flex gap-2 mb-8 md:mb-10 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {filters.map((f) => {
                const active = activeFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`flex-shrink-0 flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm whitespace-nowrap transition-all duration-200
                      ${
                        active
                          ? isDark
                            ? "border-white/30 bg-white text-black font-medium"
                            : "border-black/30 bg-black text-white font-medium"
                          : isDark
                            ? "border-white/10 bg-white/[0.04] text-white/55 hover:border-white/20 hover:text-white"
                            : "border-black/10 bg-black/[0.04] text-black/55 hover:border-black/20 hover:text-black"
                      }`}
                  >
                    <span className="text-[13px] leading-none">{f.icon}</span>
                    <span>{f.label}</span>
                    <span
                      className={`text-[11px] tabular-nums ${active ? (isDark ? "text-black/50" : "text-white/55") : isDark ? "text-white/30" : "text-black/30"}`}
                    >
                      {f.count}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <p className={`text-sm ${muted}`}>ไม่สามารถโหลดข้อมูลได้</p>
              <p className={`text-xs font-mono ${muted} opacity-60`}>{error}</p>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && <SkeletonGrid isDark={isDark} />}

          {/* Cards */}
          {!loading && !error && (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFilter + layout}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={
                  layout === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 pb-24"
                    : "flex flex-col gap-2.5 pb-24"
                }
              >
                {filtered.map((project, i) => (
                  <motion.div key={project.id} transition={{ delay: i * 0.04 }}>
                    {layout === "grid" ? (
                      <GridCard
                        project={project}
                        isDark={isDark}
                        onClick={() => onSelectProject(project.id)}
                      />
                    ) : (
                      <ListCard
                        project={project}
                        isDark={isDark}
                        onClick={() => onSelectProject(project.id)}
                      />
                    )}
                  </motion.div>
                ))}

                {filtered.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 gap-2">
                    <p className={`text-sm ${muted}`}>
                      No projects in this category yet
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </Container>
      </div>
    </motion.div>
  );
}

export default ProjectsHubPage;
