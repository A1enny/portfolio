import { useCallback, useEffect, useRef, useState } from "react";
import Container from "@/components/common/Container";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import GlobalBackground from "./styles/GlobalBackground.tsx";
import { motion, AnimatePresence } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import ProjectsHubPage from "./pages/ProjectsHubPage";
import IntroScreen from "./components/introscreen";
import { useNavigation } from "./hooks/useNavigation";
import { projects } from "./data/projects";
import type { Project } from "./data/projects";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Code2,
  Palette,
  Video,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

/* ─── ANIMATION VARIANTS ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

/* ─── BENTO CELL — borderless ─── */
function BentoCell({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div onClick={onClick} className={`relative overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

/* ─── GLASS CARD — for contact section only ─── */
function GlassCard({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] backdrop-blur-xl ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--color-text-primary)]/[0.02] to-transparent" />
      {children}
    </div>
  );
}

/* ─── PROJECT CARD ─── */
function ProjectCard({
  project,
  featured = false,
  onClick,
}: {
  project: Project;
  featured?: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl cursor-pointer w-full h-full"
    >
      <div className="absolute inset-0 bg-neutral-900">
        <img
          src={project.coverImage}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5" />
      <div className="absolute top-4 right-4 z-10">
        <span className="text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-full bg-black/30 border border-white/10 backdrop-blur-md text-white/50">
          {project.year}
        </span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 z-10">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <span className="block text-[9px] tracking-[0.16em] uppercase text-white/35 mb-1.5">
              {project.category}
            </span>
            <h3
              className={`font-semibold leading-[1.2] tracking-tight text-white ${featured ? "text-xl md:text-2xl" : "text-base md:text-lg"}`}
            >
              {project.title}
            </h3>
            {featured && (
              <p className="mt-1.5 text-xs text-white/45 line-clamp-1 max-w-[220px] leading-relaxed opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                {project.tagline}
              </p>
            )}
          </div>
          <div
            className={`flex-shrink-0 rounded-full flex items-center justify-center bg-white/10 border border-white/15 backdrop-blur-md text-white opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-white hover:text-black ${featured ? "w-10 h-10 md:w-11 md:h-11" : "w-9 h-9"}`}
          >
            <ArrowUpRight size={featured ? 15 : 13} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── STATIC DATA ─── */
const skillBentos = [
  {
    icon: Code2,
    label: "Full-Stack Dev",
    sub: "React · Node.js · TypeScript",
    accent: "#3b82f6",
  },
  {
    icon: Palette,
    label: "UI/UX Design",
    sub: "Figma · Design Systems",
    accent: "#a855f7",
  },
  {
    icon: Video,
    label: "Motion & Video",
    sub: "Premiere · After Effects",
    accent: "#f59e0b",
  },
];
const stats = [
  { num: "5 +", label: "Projects Built" },
  { num: "2", label: "Internships" },
];
const techTags = [
  "React",
  "TypeScript",
  "Figma",
  "Node.js",
  "Premiere Pro",
  "After Effects",
  "Photoshop",
  "Illustrator",
];
const contactItems = [
  {
    icon: Phone,
    label: "Phone",
    value: "+66 65-731-7994",
    href: "tel:0657317994",
  },
  {
    icon: Mail,
    label: "Email",
    value: "pasin.sp@gmail.com",
    href: "mailto:pasin.sp@gmail.com",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Pak Kret, Nonthaburi 11120",
    href: null,
  },
];
const infoRows = [
  { label: "Education", val: "RMUTT — CS" },
  { label: "Location", val: "Nonthaburi, TH" },
  { label: "Focus", val: "Graphic + UI/UX Design" },
  { label: "Available", val: "Freelance / Work" },
];
const sections = ["home", "about", "projects", "contact"];

/* ─── APP ─── */
export default function App() {
  const [introComplete, setIntroComplete] = useState(false);
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );
  const [page, setPage] = useState<null | "projects-hub" | string>(null);
  const nav = useNavigation(page, setPage);
  const [active, setActive] = useState("home");
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({
    home: null,
    about: null,
    projects: null,
    contact: null,
  });

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    dragFree: true,
  });

  const scrollPrev = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
    setActiveIndex(
      (emblaApi.selectedScrollSnap() - 1 + projects.length) % projects.length,
    );
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
    setActiveIndex((emblaApi.selectedScrollSnap() + 1) % projects.length);
  }, [emblaApi]);

  const scrollTo = (id: string) => {
    if (id === "projects") {
      nav.push("projects-hub");
      return;
    }
    if (page !== null) {
      nav.push(null);
      setTimeout(
        () =>
          sectionRefs.current[id]?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        350,
      );
      return;
    }
    sectionRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  /* Watch dark mode */
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains("dark")),
    );
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  /* IntersectionObserver for active nav */
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        }),
      { threshold: 0.35 },
    );
    sections.forEach((id) => {
      const el = sectionRefs.current[id];
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  /* Auto-rotate project */
  useEffect(() => {
    if (page !== null) return;
    const id = setInterval(
      () => setActiveIndex((p) => (p + 1) % projects.length),
      5500,
    );
    return () => clearInterval(id);
  }, [page]);

  const selectedProject =
    page && page !== "projects-hub"
      ? (projects.find((p) => p.id === page) ?? null)
      : null;
  const featured = projects[activeIndex];
  const rest = projects.filter((_, i) => i !== activeIndex).slice(0, 2);

  /* ── Route: Detail ── */
  if (selectedProject)
    return (
      <AnimatePresence mode="wait">
        <ProjectDetailPage
          key={selectedProject.id}
          project={selectedProject}
          isDark={isDark}
          onBack={() => nav.back()}
          onNavigate={(id) => nav.push(id)}
        />
      </AnimatePresence>
    );

  /* ── Route: Hub ── */
  if (page === "projects-hub")
    return (
      <>
        <Navbar
          active="projects"
          onNavigate={scrollTo}
          onLogoClick={() => nav.push(null)}
        />
        <AnimatePresence mode="wait">
          <ProjectsHubPage
            key="projects-hub"
            isDark={isDark}
            onSelectProject={(id) => nav.push(id)}
            onBack={() => nav.back()}
          />
        </AnimatePresence>
      </>
    );

  /* ── Route: Main ── */
  return (
    <>
      <AnimatePresence>
        {!introComplete && (
          <IntroScreen onDone={() => setIntroComplete(true)} />
        )}
      </AnimatePresence>

      <Navbar
        active={active}
        onNavigate={scrollTo}
        onLogoClick={() => scrollTo("home")}
      />
      <GlobalBackground isDark={isDark} />
      <main className="overflow-hidden text-[var(--color-text-primary)]">
        {/* ══════════════════════════════════════════════
            HOME — Borderless Bento Hero
        ══════════════════════════════════════════════ */}
        <section
          id="home"
          ref={(el) => {
            sectionRefs.current.home = el;
          }}
          className="relative min-h-screen flex flex-col overflow-hidden"
        >
          {/* ── BG image — clipped inside section ── */}
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <img
              src={isDark ? "/images/dark-bg.jpg" : "/images/light-bg.jpg"}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover object-center transition-opacity duration-700"
              style={{ opacity: isDark ? 0.2 : 0.18 }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg-primary)]/60 via-transparent to-[var(--color-bg-primary)]" />
          </div>

          {/* ── Ambient glows ── */}
          <div className="pointer-events-none absolute inset-0 z-[1]">
            <div className="absolute top-[-8%] left-[-4%] h-[550px] w-[550px] rounded-full bg-blue-500/[0.07] blur-[130px]" />
            <div className="absolute bottom-[5%] right-[-4%] h-[450px] w-[450px] rounded-full bg-violet-500/[0.06] blur-[110px]" />
          </div>

          {/* ── Main content — vertically centered with top navbar offset ── */}
          <div className="relative z-10 flex flex-col flex-1">
            <Container className="flex-1 flex flex-col justify-center pt-28 pb-32 md:pt-32 md:pb-36">
              <motion.div
                initial="hidden"
                animate={introComplete ? "visible" : "hidden"}
                variants={stagger}
              >
                {/* ── HERO BLOCK: headline left / meta right ── */}
                <motion.div
                  variants={fadeUp}
                  className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12 md:mb-16"
                >
                  {/* Headline */}
                  <div className="flex-1 min-w-0">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/[0.06] px-3.5 py-1.5 text-xs text-green-400">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                      </span>
                      Available for work
                    </div>
                    <h1 className="text-[clamp(3.4rem,8vw,7.5rem)] font-bold leading-[0.9] tracking-[-0.04em] text-[var(--color-text-primary)]">
                      Full-Stack
                      <br />
                      <span
                        style={{ opacity: 0.3 }}
                        className="text-[var(--color-text-primary)]"
                      >
                        Developer
                      </span>
                      <br />
                      <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                        &amp; Designer
                      </span>
                    </h1>
                  </div>

                  {/* Meta + CTAs */}
                  <div className="lg:max-w-[340px] flex flex-col gap-5 lg:pb-2 shrink-0">
                    <div>
                      <p className="text-[10px] tracking-[0.18em] uppercase text-[var(--color-text-secondary)] mb-2 opacity-50">
                        Pasin Promsopa · Nonthaburi, TH
                      </p>
                      <p className="text-sm md:text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
                        Crafting seamless user experiences through code, design,
                        and motion.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        onClick={() => nav.push("projects-hub")}
                        className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 hover:scale-[1.03] hover:opacity-85 bg-white text-black dark:bg-white dark:text-black"
                      >
                        View Projects <ArrowUpRight size={14} />
                      </button>
                      <button
                        onClick={() => scrollTo("contact")}
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium text-[var(--color-text-primary)] transition-all duration-300 hover:border-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
                      >
                        Contact Me
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* ── BOTTOM BENTO STRIP ── */}
                <div className="grid grid-cols-4 md:grid-cols-12 gap-2.5 md:gap-3">
                  {/* Skills */}
                  {skillBentos.map((skill) => (
                    <motion.div
                      key={skill.label}
                      variants={fadeUp}
                      className="col-span-4 md:col-span-4"
                    >
                      <BentoCell className="p-4 md:p-5 h-full flex items-center gap-4 rounded-xl border border-[var(--color-border)]/50 bg-[var(--color-surface)]/40 backdrop-blur-sm">
                        <div
                          className="flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-xl"
                          style={{ background: `${skill.accent}18` }}
                        >
                          <skill.icon
                            size={15}
                            style={{ color: skill.accent }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                            {skill.label}
                          </p>
                          <p className="text-[11px] text-[var(--color-text-secondary)] truncate">
                            {skill.sub}
                          </p>
                        </div>
                      </BentoCell>
                    </motion.div>
                  ))}

                  {/* Stats */}
                  {stats.map((stat) => (
                    <motion.div
                      key={stat.label}
                      variants={fadeUp}
                      className="col-span-6 md:col-span-6"
                    >
                      <BentoCell className="p-4 md:p-5 flex items-center gap-3 h-full rounded-xl border border-[var(--color-border)]/50 bg-[var(--color-surface)]/40 backdrop-blur-sm">
                        <span className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
                          {stat.num}
                        </span>
                        <span className="text-xs text-[var(--color-text-secondary)] leading-snug max-w-[72px]">
                          {stat.label}
                        </span>
                      </BentoCell>
                    </motion.div>
                  ))}

                  {/* Tech tags — full width */}
                  <motion.div
                    variants={fadeUp}
                    className="col-span-4 md:col-span-12"
                  >
                    <BentoCell className="px-4 py-3 flex flex-wrap items-center gap-2 rounded-xl border border-[var(--color-border)]/50 bg-[var(--color-surface)]/40 backdrop-blur-sm">
                      <span className="text-[9px] tracking-[0.18em] uppercase text-[var(--color-text-secondary)] mr-1 opacity-50">
                        Stack
                      </span>
                      {techTags.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full border border-[var(--color-border)] px-3 py-1 text-[11px] text-[var(--color-text-secondary)]"
                        >
                          {tech}
                        </span>
                      ))}
                    </BentoCell>
                  </motion.div>
                </div>
              </motion.div>
            </Container>

            {/* ── SCROLL INDICATOR — pinned below all content ── */}
            <motion.button
              onClick={() => scrollTo("about")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5
                text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors duration-300 group"
            >
              <span className="text-[9px] tracking-[0.22em] uppercase opacity-40 group-hover:opacity-70 transition-opacity">
                Scroll
              </span>
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.8,
                  ease: "easeInOut",
                }}
              >
                <ChevronDown
                  size={16}
                  className="opacity-40 group-hover:opacity-80 transition-opacity"
                />
              </motion.div>
            </motion.button>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            ABOUT — Borderless Bento
        ══════════════════════════════════════════════ */}
        <section
          id="about"
          ref={(el) => {
            sectionRefs.current.about = el;
          }}
          className="relative overflow-hidden py-24 md:py-32"
        >
          {/* Ambient glow */}
          <div className="pointer-events-none absolute inset-0 z-[1]">
            <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/[0.04] blur-[150px]" />
          </div>

          <div className="relative z-10">
            <Container>
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
              >
                <motion.div variants={fadeUp} className="mb-10 md:mb-14">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-text-secondary)] mb-3">
                    About me
                  </p>
                  <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-bold leading-none tracking-[-0.04em]">
                    Who I am
                  </h2>
                </motion.div>

                <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-3 md:gap-4">
                  {/* BIO */}
                  <motion.div
                    variants={fadeUp}
                    className="col-span-4 md:col-span-8 lg:col-span-7"
                  >
                    <BentoCell className="p-2 md:p-4 h-full">
                      <div className="flex items-start gap-3 mb-6">
                        <Sparkles
                          size={16}
                          className="mt-0.5 text-yellow-400 flex-shrink-0"
                        />
                        <span className="text-xs tracking-[0.12em] uppercase text-[var(--color-text-secondary)]">
                          Introduction
                        </span>
                      </div>

                      <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-5 text-[var(--color-text-primary)]">
                        PASIN
                        <br />
                        PROMSOPA
                      </h3>

                      <p className="text-sm md:text-base leading-[1.9] text-[var(--color-text-secondary)]">
                        ผมเป็นนักศึกษาวิทยาการคอมพิวเตอร์จาก{" "}
                        <strong className="text-[var(--color-text-primary)] font-medium">
                          มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี
                        </strong>{" "}
                        ที่ชอบเอาเทคโนโลยีมาผสมกับงานออกแบบ
                        เพื่อสร้างประสบการณ์ที่ใช้งานง่ายและรู้สึกเข้าถึงได้
                      </p>
                      <p className="mt-3 text-sm md:text-base leading-[1.9] text-[var(--color-text-secondary)]">
                        ผมสนุกกับการตัดต่อวิดีโอ ออกแบบ UI
                        และสร้างสื่อที่สื่อสารกับผู้คนได้ดี
                        โดยให้ความสำคัญกับความชัดเจน อารมณ์
                        และความรู้สึกของผู้ชม
                      </p>

                      <div className="mt-8 grid grid-cols-2 gap-3">
                        {infoRows.map(({ label, val }) => (
                          <div key={label}>
                            <p className="text-[10px] tracking-[0.12em] uppercase text-[var(--color-text-secondary)] mb-0.5">
                              {label}
                            </p>
                            <p className="text-sm font-medium text-[var(--color-text-primary)]">
                              {val}
                            </p>
                          </div>
                        ))}
                      </div>
                    </BentoCell>
                  </motion.div>

                  {/* PROFILE IMAGE */}
                  <motion.div
                    variants={fadeUp}
                    className="col-span-4 md:col-span-4 lg:col-span-5 row-span-2"
                  >
                    <BentoCell className="relative h-full min-h-[400px] md:min-h-[500px] rounded-2xl overflow-hidden">
                      <img
                        src="/images/profile.jpg"
                        alt="Pasin"
                        className="h-full w-full object-cover object-top"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    </BentoCell>
                  </motion.div>

                  {/* ABOUT CENTER IMAGE */}
                  <motion.div
                    variants={fadeUp}
                    className="col-span-4 md:col-span-4 lg:col-span-7"
                  >
                    <BentoCell className="relative h-[200px] md:h-[240px] rounded-2xl overflow-hidden">
                      <img
                        src="/images/about-center.png"
                        alt="workspace"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute bottom-4 left-5">
                        <p className="text-white/40 text-[10px] tracking-widest uppercase mb-0.5">
                          Focus
                        </p>
                        <p className="text-white font-medium text-sm">
                          Code · Design · Motion
                        </p>
                      </div>
                    </BentoCell>
                  </motion.div>
                </div>
              </motion.div>
            </Container>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            PROJECTS — Bento showcase (dark)
        ══════════════════════════════════════════════ */}
        <section
          id="projects"
          ref={(el) => {
            sectionRefs.current.projects = el;
          }}
          className="relative py-24 md:py-32 overflow-hidden"
        >
          <div className="pointer-events-none absolute inset-0 z-[1]">
            <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-blue-500/[0.07] blur-[120px]" />
            <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-violet-500/[0.06] blur-[100px]" />
          </div>

          <div className="relative z-10 mx-auto max-w-[1600px] px-5 md:px-10">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.05 }}
            >
              {/* Header */}
              <motion.div
                variants={fadeUp}
                className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 md:mb-12"
              >
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-text-secondary)] mb-3">
                    Selected works
                  </p>
                  <h2 className="text-[clamp(3rem,7vw,6rem)] font-bold leading-none tracking-[-0.04em] text-[var(--color-text-primary)]">
                    Projects
                  </h2>
                </div>
                <div className="flex items-center gap-3 pb-1">
                  <span className="text-sm text-[var(--color-text-secondary)] tabular-nums font-mono opacity-60">
                    {String(activeIndex + 1).padStart(2, "0")} /{" "}
                    {String(projects.length).padStart(2, "0")}
                  </span>
                  <div className="flex gap-1.5">
                    {[scrollPrev, scrollNext].map((fn, i) => (
                      <button
                        key={i}
                        onClick={fn}
                        className="h-9 w-9 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-text-primary)] hover:text-[var(--color-bg-primary)] hover:border-transparent backdrop-blur-md transition-all duration-200 flex items-center justify-center text-[var(--color-text-primary)]"
                      >
                        {i === 0 ? (
                          <ChevronLeft size={15} />
                        ) : (
                          <ChevronRight size={15} />
                        )}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => nav.push("projects-hub")}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-text-primary)] hover:text-[var(--color-bg-primary)] hover:border-transparent px-4 py-2 text-xs font-medium text-[var(--color-text-primary)] backdrop-blur-md transition-all duration-300 hover:scale-[1.03]"
                  >
                    View All <ArrowUpRight size={12} />
                  </button>
                </div>
              </motion.div>

              {/* Desktop bento grid */}
              <motion.div
                variants={fadeUp}
                className="hidden md:grid gap-3"
                style={{
                  gridTemplateColumns: "1.6fr 1fr",
                  gridTemplateRows: "290px 290px",
                  height: "592px",
                }}
              >
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={"featured-" + featured.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    style={{ gridColumn: 1, gridRow: "1 / 3" }}
                    className="rounded-2xl overflow-hidden"
                  >
                    <ProjectCard
                      project={featured}
                      featured
                      onClick={() => nav.push(featured.id)}
                    />
                  </motion.div>
                </AnimatePresence>
                {rest.map((proj, i) => (
                  <AnimatePresence key={"sm-" + proj?.id + i} mode="popLayout">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{
                        duration: 0.35,
                        ease: [0.16, 1, 0.3, 1],
                        delay: i * 0.05,
                      }}
                      style={{ gridColumn: 2, gridRow: i + 1 }}
                      className="rounded-2xl overflow-hidden"
                    >
                      {proj && (
                        <ProjectCard
                          project={proj}
                          onClick={() => nav.push(proj.id)}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                ))}
              </motion.div>

              {/* Mobile carousel */}
              <motion.div variants={fadeUp} className="md:hidden -mx-5">
                <div ref={emblaRef} className="overflow-hidden px-5">
                  <div className="flex gap-3">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="min-w-[85vw] h-[400px] rounded-2xl overflow-hidden flex-shrink-0"
                      >
                        <ProjectCard
                          project={project}
                          featured
                          onClick={() => nav.push(project.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Progress dots */}
              <motion.div variants={fadeUp} className="flex gap-1.5 mt-6">
                {projects.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className="h-[2px] rounded-full transition-all duration-500"
                    style={{
                      width: activeIndex === i ? 32 : 16,
                      background:
                        activeIndex === i
                          ? isDark
                            ? "rgba(255,255,255,0.9)"
                            : "rgba(0,0,0,0.75)"
                          : isDark
                            ? "rgba(255,255,255,0.15)"
                            : "rgba(0,0,0,0.12)",
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            CONTACT — Glass Bento (keeps borders)
        ══════════════════════════════════════════════ */}
        <section
          id="contact"
          ref={(el) => {
            sectionRefs.current.contact = el;
          }}
          className="relative min-h-screen overflow-hidden"
        >
          <div className="pointer-events-none absolute inset-0 z-[1]">
            <div className="absolute left-[-10%] top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-lime-400/[0.12] blur-[120px]" />
            <div className="absolute right-[-10%] top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-lime-400/[0.10] blur-[120px]" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-10 flex items-center min-h-screen py-24">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="w-full"
            >
              <motion.div variants={fadeUp} className="mb-10 md:mb-14">
                <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-text-secondary)] mb-3">
                  Get in touch
                </p>
                <h2 className="text-[clamp(3rem,8vw,7rem)] font-bold leading-none tracking-[-0.04em] text-[var(--color-text-primary)]">
                  Let's Work
                  <br />
                  <span className="text-[var(--color-text-secondary)] opacity-25">
                    Together
                  </span>
                </h2>
              </motion.div>

              <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-3 md:gap-4">
                {contactItems.map(({ icon: Icon, label, value, href }) => (
                  <motion.div
                    key={label}
                    variants={fadeUp}
                    className="col-span-4 md:col-span-8 lg:col-span-4"
                  >
                    <GlassCard className="group h-full p-6 hover:border-[var(--color-text-secondary)]/30 hover:bg-[var(--color-text-primary)]/[0.04] transition-all duration-500">
                      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400/10 border border-lime-400/20">
                        <Icon
                          size={16}
                          className="text-lime-500 dark:text-lime-400"
                        />
                      </div>
                      <p className="text-[10px] tracking-[0.12em] uppercase text-[var(--color-text-secondary)] mb-1">
                        {label}
                      </p>
                      {href ? (
                        <a
                          href={href}
                          className="group text-[var(--color-text-primary)] font-medium text-sm md:text-base hover:text-lime-600 dark:hover:text-lime-300 transition-colors duration-200 flex items-center gap-1"
                        >
                          {value}
                          <ExternalLink
                            size={11}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        </a>
                      ) : (
                        <p className="text-[var(--color-text-primary)] font-medium text-sm md:text-base">
                          {value}
                        </p>
                      )}
                    </GlassCard>
                  </motion.div>
                ))}

                {/* Profile photo */}
                <motion.div
                  variants={fadeUp}
                  className="col-span-4 md:col-span-4 lg:col-span-6"
                >
                  <div className="relative h-[280px] md:h-[340px] rounded-2xl overflow-hidden border border-white/[0.08]">
                    <img
                      src="/images/contact.png?v=1"
                      alt="Contact"
                      className="h-full w-full object-cover grayscale"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                  variants={fadeUp}
                  className="col-span-4 md:col-span-4 lg:col-span-6"
                >
                  <div className="h-full min-h-[280px] rounded-2xl p-7 md:p-8 border border-lime-400/20 bg-lime-400/[0.04] backdrop-blur-xl flex flex-col justify-between">
                    <div>
                      <div
                        className="mb-4 h-12 w-12 flex-shrink-0"
                        style={{
                          background: "#E6FF5B",
                          clipPath:
                            "polygon(50% 0%, 61% 20%, 82% 7%, 74% 30%, 100% 25%, 80% 45%, 100% 50%, 80% 55%, 100% 75%, 74% 70%, 82% 93%, 61% 80%, 50% 100%, 39% 80%, 18% 93%, 26% 70%, 0% 75%, 20% 55%, 0% 50%, 20% 45%, 0% 25%, 26% 30%, 18% 7%, 39% 20%)",
                        }}
                      />
                      <h3 className="text-[var(--color-text-primary)] font-bold text-2xl md:text-3xl leading-tight tracking-tight mb-3">
                        Ready to start a project?
                      </h3>
                      <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                        Let's create something meaningful together.
                      </p>
                    </div>
                    <a
                      href="mailto:pasin.sp@gmail.com"
                      className="inline-flex items-center gap-2 rounded-full bg-lime-400 px-5 py-2.5 text-sm font-semibold text-black hover:bg-lime-300 transition-all duration-200 hover:scale-[1.03] self-start mt-6"
                    >
                      Send Email <ArrowUpRight size={14} />
                    </a>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer onNavigate={scrollTo} isDark={isDark} />
    </>
  );
}
