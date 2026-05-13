import { useCallback, useEffect, useRef, useState } from "react";
import Container from "@/components/common/Container";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import { motion, AnimatePresence, Trasition } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import { projects } from "./data/projects";
import type { Project } from "./data/projects";

import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

/* ================================================================== */
/*  DATA                                                                */
/* ================================================================== */

const sections = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
];

/* ================================================================== */
/*  ANIMATION VARIANTS                                                  */
/* ================================================================== */

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
  },
};

/* ================================================================== */
/*  PROJECT CARD                                                        */
/* ================================================================== */

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
      className="project-card relative overflow-hidden rounded-[20px] cursor-pointer w-full h-full"
    >
      <div className="absolute inset-0 bg-[#111]">
        <img
          src={project.coverImage}
          alt={project.title}
          className="project-card-img w-full h-full object-cover"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <div className="absolute top-4 right-4 z-10">
        <span className="text-[11px] tracking-widest uppercase px-3 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-white/60">
          {project.year}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 z-10 flex items-end justify-between">
        <div className="min-w-0 mr-3">
          <span className="block text-[10px] tracking-[0.14em] uppercase text-white/45 mb-1.5">
            {project.category}
          </span>
          <h3
            className={`font-semibold leading-[1.15] tracking-tight text-white ${
              featured
                ? "text-[22px] md:text-[28px]"
                : "text-[16px] md:text-[20px]"
            }`}
          >
            {project.title}
          </h3>

          {featured && (
            <p className="project-card-desc mt-2 text-xs md:text-sm text-white/50 max-w-[240px] leading-relaxed line-clamp-2">
              {project.tagline}
            </p>
          )}
        </div>

        <div
          className={`project-card-btn flex-shrink-0 rounded-full flex items-center justify-center
            bg-white/12 border border-white/20 backdrop-blur-md
            transition-colors duration-200 hover:bg-white hover:text-black text-white
            ${featured ? "w-10 h-10 md:w-12 md:h-12" : "w-9 h-9 md:w-10 md:h-10"}`}
        >
          <ArrowUpRight size={featured ? 16 : 14} />
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  APP                                                                 */
/* ================================================================== */

function App() {
  /* ---------------- THEME ---------------- */
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark"),
  );

  /* ---------------- PROJECT DETAIL PAGE ---------------- */
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const selectedProject =
    projects.find((p) => p.id === selectedProjectId) ?? null;

  /* ---------------- NAVIGATION ---------------- */
  const [active, setActive] = useState("home");

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({
    home: null,
    about: null,
    projects: null,
    contact: null,
  });

  const scrollTo = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  /* ---------------- PROJECTS CAROUSEL STATE ---------------- */
  const [activeIndex, setActiveIndex] = useState(0);

  /* ---------------- EMBLA (mobile carousel) ---------------- */
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

  /* ---------------- AUTO DARK MODE SYNC ---------------- */
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  /* ---------------- SECTION ACTIVE (scroll spy) ---------------- */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { threshold: 0.4 },
    );
    sections.forEach((section) => {
      const el = sectionRefs.current[section.id];
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  /* ---------------- AUTO CYCLE FEATURED CARD ---------------- */
  useEffect(() => {
    if (selectedProjectId) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % projects.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [selectedProjectId]);

  const featured = projects[activeIndex];
  const rest = projects.filter((_, i) => i !== activeIndex).slice(0, 2);

  /* ============================================================ */
  /*  PROJECT DETAIL PAGE (full-screen overlay)                   */
  /* ============================================================ */
  if (selectedProject) {
    return (
      <AnimatePresence mode="wait">
        <ProjectDetailPage
          key={selectedProject.id}
          project={selectedProject}
          isDark={isDark}
          onBack={() => setSelectedProjectId(null)}
          onNavigate={(id) => setSelectedProjectId(id)}
        />
      </AnimatePresence>
    );
  }

  /* ============================================================ */
  /*  MAIN SITE                                                    */
  /* ============================================================ */
  return (
    <>
      <Navbar
        active={active}
        onNavigate={scrollTo}
        onLogoClick={() => scrollTo("home")}
      />

      <main className="min-h-screen overflow-hidden bg-[var(--color-background)] text-[var(--color-text-primary)]">
        <div className="bg-glow pointer-events-none fixed inset-0 -z-10" />

        {/* ============================================================ */}
        {/* HERO                                                          */}
        {/* ============================================================ */}
        <section
          id="home"
          ref={(el) => (sectionRefs.current.home = el)}
          className="section-padding relative flex min-h-screen items-center overflow-hidden"
        >
          <div className="absolute inset-0 z-0">
            <img
              src={isDark ? "/images/dark-bg.jpg" : "/images/light-bg.jpg"}
              alt="Background"
              className="h-full w-full object-cover opacity-35 transition-opacity duration-500"
            />
          </div>
          <div className="absolute inset-0 z-10 bg-white/5 dark:bg-black/10" />
          <div className="absolute left-1/2 top-1/2 z-20 h-[300px] w-[300px] md:h-[500px] md:w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/15 blur-[120px]" />

          <div className="relative z-30 w-full">
            <Container>
              <motion.div
                className="max-w-6xl"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.1 } },
                }}
              >
                {/* STATUS BADGE */}
                <motion.div variants={fadeUp}>
                  <div className="glass mb-6 md:mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-[var(--color-text-secondary)]">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                    </span>
                    Available for work
                  </div>
                </motion.div>

                {/* HEADING */}
                <motion.h1
                  variants={fadeUp}
                  className="heading-xl pb-2 text-[var(--color-text-primary)]"
                >
                  <span className="block">Full-Stack Developer</span>
                  <span className="block">& Visual Designer</span>
                </motion.h1>

                {/* SUBTEXT */}
                <motion.p
                  variants={fadeUp}
                  className="text-muted mt-6 md:mt-8 max-w-2xl text-base md:text-lg leading-relaxed md:text-xl"
                >
                  Crafting seamless user experiences and engaging stories
                  through code, design, and motion.
                </motion.p>

                {/* CTA BUTTONS */}
                <motion.div
                  variants={fadeUp}
                  className="mt-8 md:mt-12 flex flex-wrap gap-4"
                >
                  <button
                    onClick={() => scrollTo("projects")}
                    className="button-primary px-6 py-3 font-medium"
                  >
                    View Projects
                  </button>
                  <button
                    onClick={() => scrollTo("contact")}
                    className="button-secondary px-6 py-3 font-medium"
                  >
                    Contact Me
                  </button>
                </motion.div>

                {/* TECH TAGS */}
                <motion.div
                  variants={fadeUp}
                  className="mt-12 md:mt-16 flex flex-wrap gap-3"
                >
                  {["Premier Pro", "Photoshop", "Figma", "React + Vite"].map(
                    (tech) => (
                      <div
                        key={tech}
                        className="glass rounded-full px-4 py-2 text-sm text-[var(--color-text-secondary)]"
                      >
                        {tech}
                      </div>
                    ),
                  )}
                </motion.div>
              </motion.div>
            </Container>
          </div>

          {/* SCROLL INDICATOR */}
          <motion.button
            onClick={() => scrollTo("about")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2
              text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors duration-300 group"
          >
            <span className="text-[10px] tracking-[0.2em] uppercase opacity-60">
              Scroll
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{
                repeat: Infinity,
                duration: 1.6,
                ease: "easeInOut",
              }}
            >
              <ChevronDown
                size={18}
                className="opacity-60 group-hover:opacity-100 transition-opacity"
              />
            </motion.div>
          </motion.button>
        </section>

        {/* ============================================================ */}
        {/* ABOUT — Responsive rewrite                                    */}
        {/* ============================================================ */}
        <section
          id="about"
          ref={(el) => (sectionRefs.current.about = el)}
          className="relative min-h-screen overflow-hidden bg-black text-white"
        >
          {/* BG */}
          <div className="absolute inset-0 z-0">
            <img
              src={isDark ? "/images/BG.png?v=1" : "/images/BGL.png?v=1"}
              alt="Background"
              className="h-full w-full object-cover opacity-90"
            />
          </div>
          <div className="absolute inset-0 z-10 bg-black/10" />

          <motion.div
            className="relative z-20 px-5 md:px-12 xl:px-[140px] pt-24 md:pt-36 pb-16 md:pb-[120px]"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {/* Title */}
            <h1 className="text-[clamp(3rem,8vw,8rem)] font-bold leading-none mb-10 md:mb-16">
              About Me
            </h1>

            {/* Mobile: stack layout */}
            <div className="flex flex-col gap-8 lg:hidden">
              {/* Profile image */}
              <div className="w-full max-w-sm mx-auto">
                <img
                  src="/images/profile.jpg"
                  alt="profile"
                  className="w-full h-[360px] object-cover rounded-2xl"
                />
              </div>

              {/* Name + intro */}
              <div>
                <h2 className="text-[clamp(2.5rem,10vw,5rem)] font-bold uppercase leading-[0.9] tracking-[-2px] mb-6 drop-shadow-[0_8px_20px_rgba(0,0,0,0.3)]">
                  PASIN
                  <br />
                  PROMSOPA
                </h2>
                <h4 className="text-xl font-bold text-[#E6FF5B] mb-3 drop-shadow-[0_8px_20px_rgba(0,0,0,0.8)]">
                  Introduction
                </h4>
                <p className="text-base leading-[1.8] text-[#F3F3F3] drop-shadow-[0_8px_20px_rgba(0,0,0,0.8)]">
                  ผมเป็นนักศึกษาวิทยาการคอมพิวเตอร์จากมหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี
                  <br />
                  ที่ชอบเอาเทคโนโลยีมาผสมกับงานออกแบบ
                  เพื่อสร้างประสบการณ์ที่ใช้งานง่ายและรู้สึกเข้าถึงได้
                  <br />
                  ผมสนุกกับการตัดต่อวิดีโอ ออกแบบ UI
                  และสร้างสื่อที่สื่อสารกับผู้คนได้ดี
                  โดยให้ความสำคัญกับความชัดเจน อารมณ์ และความรู้สึกของผู้ชม
                  <br />
                  ผมมีพื้นฐานทั้งด้าน UX/UI การเขียนโค้ด
                  และการผลิตสื่อหลากหลายรูปแบบ
                  <br />
                  ทำให้สามารถพัฒนาโปรเจกต์ตั้งแต่ไอเดีย
                  ไปจนถึงผลงานที่ใช้งานได้จริงครับ
                </p>
              </div>

              {/* Center image */}
              <img
                src="/images/about-center.png"
                alt="about"
                className="w-full h-[200px] object-cover rounded-2xl"
              />
            </div>

            {/* Desktop: 3-column grid */}
            <div
              className="hidden lg:grid items-start gap-10"
              style={{ gridTemplateColumns: "400px 1fr 280px" }}
            >
              {/* Col 1: profile image */}
              <div>
                <img
                  src="/images/profile.jpg"
                  alt="profile"
                  className="h-[900px] w-full object-cover"
                />
              </div>

              {/* Col 2: center image + name + text */}
              <div>
                <img
                  src="/images/about-center.png"
                  alt="about"
                  className="mb-10 h-[400px] w-full object-cover"
                />
                {/* Name LEFT — Intro RIGHT (2-col, no overlap) */}
                <div className="flex items-start gap-10 xl:gap-16">
                  {/* Left: Name */}
                  <div className="relative flex-shrink-0">
                    <h2 className="text-[2.8rem] xl:text-[3.5rem] font-bold uppercase leading-[0.9] tracking-[-2px] drop-shadow-[0_8px_20px_rgba(0,0,0,0.30)] whitespace-nowrap">
                      PASIN
                      <br />
                      PROMSOPA
                    </h2>
                    <div
                      className="absolute bottom-[-80px] left-[-40px] -z-10 h-[130px] w-[130px] opacity-40"
                      style={{
                        background: "#E6FF5B",
                        clipPath:
                          "polygon(50% 0%, 61% 20%, 82% 7%, 74% 30%, 100% 25%, 80% 45%, 100% 50%, 80% 55%, 100% 75%, 74% 70%, 82% 93%, 61% 80%, 50% 100%, 39% 80%, 18% 93%, 26% 70%, 0% 75%, 20% 55%, 0% 50%, 20% 45%, 0% 25%, 26% 30%, 18% 7%, 39% 20%)",
                      }}
                    />
                  </div>

                  {/* Right: Introduction */}
                  <div className="pt-1 min-w-0">
                    <h4 className="mb-3 text-[1.4rem] xl:text-[1.8rem] font-bold text-[#E6FF5B] drop-shadow-[0_8px_20px_rgba(0,0,0,0.8)]">
                      Introduction
                    </h4>
                    <p className="text-[0.95rem] xl:text-[1.4rem] leading-[1.8] text-[#F3F3F3] drop-shadow-[0_8px_20px_rgba(0,0,0,0.8)]">
                      ผมเป็นนักศึกษาวิทยาการคอมพิวเตอร์จากมหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี
                      <br />
                      ที่ชอบเอาเทคโนโลยีมาผสมกับงานออกแบบ
                      เพื่อสร้างประสบการณ์ที่ใช้งานง่ายและรู้สึกเข้าถึงได้
                      <br />
                      ผมสนุกกับการตัดต่อวิดีโอ ออกแบบ UI
                      และสร้างสื่อที่สื่อสารกับผู้คนได้ดี
                      โดยให้ความสำคัญกับความชัดเจน อารมณ์ และความรู้สึกของผู้ชม
                      <br />
                      ผมมีพื้นฐานทั้งด้าน UX/UI การเขียนโค้ด
                      และการผลิตสื่อหลากหลายรูปแบบ
                      <br />
                      ทำให้สามารถพัฒนาโปรเจกต์ตั้งแต่ไอเดีย
                      ไปจนถึงผลงานที่ใช้งานได้จริงครับ
                    </p>
                  </div>
                </div>
              </div>

              {/* Col 3: right image */}
              <div>
                <img
                  src="/images/about-right.png"
                  alt="flower"
                  className="h-[400px] w-full object-cover"
                />
              </div>
            </div>
          </motion.div>
        </section>

        {/* ============================================================ */}
        {/* PROJECTS                                                      */}
        {/* ============================================================ */}
        <section
          id="projects"
          ref={(el) => (sectionRefs.current.projects = el)}
          className="relative min-h-screen overflow-hidden bg-black text-white"
        >
          {/* BG */}
          <div className="absolute inset-0 z-0">
            <img
              src={isDark ? "/images/BG2.png?v=1" : "/images/BGL2.png?v=1"}
              alt="Background"
              className="h-full w-full object-cover opacity-90"
            />
          </div>
          <div className="absolute inset-0 z-[1] bg-black/10" />

          {/* CONTENT */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="relative z-20 mx-auto flex w-full max-w-[1700px] flex-col px-5 md:px-10 xl:px-20 py-20 md:py-24"
          >
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 md:mb-14 gap-4">
              <div>
                <p className="text-[11px] tracking-[0.16em] uppercase text-white/35 mb-3">
                  Selected works
                </p>
                <h2 className="text-[clamp(48px,7vw,100px)] font-bold leading-none tracking-[-3px] md:tracking-[-4px]">
                  Projects
                </h2>
              </div>

              <div className="flex items-center gap-4 pb-1">
                <span className="text-sm text-white/35 tabular-nums">
                  {String(activeIndex + 1).padStart(2, "0")} /{" "}
                  {String(projects.length).padStart(2, "0")}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={scrollPrev}
                    className="w-10 h-10 md:w-11 md:h-11 rounded-full border border-white/15 bg-white/5
                      hover:bg-white/10 hover:border-white/30 transition flex items-center justify-center text-white"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={scrollNext}
                    className="w-10 h-10 md:w-11 md:h-11 rounded-full border border-white/15 bg-white/5
                      hover:bg-white/10 hover:border-white/30 transition flex items-center justify-center text-white"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* ── BENTO GRID — Desktop (md+) ── */}
            <div
              className="hidden md:grid gap-4"
              style={{
                gridTemplateColumns: "1.55fr 1fr",
                gridTemplateRows: "280px 280px",
                height: "572px",
              }}
            >
              {/* FEATURED — col 1, row 1–2 */}
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={"featured-" + featured.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{
                    duration: 0.45,
                    ease: [0.16, 1, 0.3, 1] as const,
                  }}
                  style={{ gridColumn: 1, gridRow: "1 / 3" }}
                  className="h-full"
                >
                  <ProjectCard
                    project={featured}
                    featured
                    onClick={() => setSelectedProjectId(featured.id)}
                  />
                </motion.div>
              </AnimatePresence>

              {/* SMALL CARD — col 2, row 1 */}
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={"small-top-" + rest[0]?.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                  style={{ gridColumn: 2, gridRow: 1 }}
                  className="h-full"
                >
                  {rest[0] && (
                    <ProjectCard
                      project={rest[0]}
                      onClick={() => setSelectedProjectId(rest[0].id)}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* SMALL CARD — col 2, row 2 */}
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={"small-bot-" + rest[1]?.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{
                    duration: 0.38,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.05,
                  }}
                  style={{ gridColumn: 2, gridRow: 2 }}
                  className="h-full"
                >
                  {rest[1] && (
                    <ProjectCard
                      project={rest[1]}
                      onClick={() => setSelectedProjectId(rest[1].id)}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── EMBLA CAROUSEL — Mobile ── */}
            <div className="md:hidden -mx-5">
              <div ref={emblaRef} className="overflow-hidden px-5">
                <div className="flex gap-3">
                  {projects.map((project) => (
                    <div key={project.id} className="min-w-[85vw] h-[420px]">
                      <ProjectCard
                        project={project}
                        featured
                        onClick={() => setSelectedProjectId(project.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── PROGRESS DOTS ── */}
            <div className="flex gap-2 mt-6 md:mt-8">
              {projects.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className="h-[3px] rounded-full transition-all duration-500"
                  style={{
                    width: activeIndex === i ? 40 : 20,
                    background:
                      activeIndex === i ? "white" : "rgba(255,255,255,0.2)",
                  }}
                />
              ))}
            </div>
          </motion.div>
        </section>

        {/* ============================================================ */}
        {/* CONTACT — Responsive rewrite                                  */}
        {/* ============================================================ */}
        <section
          id="contact"
          ref={(el) => (sectionRefs.current.contact = el)}
          className="relative min-h-screen overflow-hidden bg-black text-white"
        >
          <div className="absolute inset-0 z-0">
            <img
              src={isDark ? "/images/BG.png?v=1" : "/images/BGL.png?v=1"}
              alt="Background"
              className="h-full w-full object-cover opacity-90"
            />
          </div>
          <div className="absolute inset-0 z-5 bg-black/10" />
          <div className="absolute left-[-80px] md:left-[-120px] top-1/2 h-[240px] w-[240px] md:h-[320px] md:w-[320px] -translate-y-1/2 rounded-full bg-lime-300/20 blur-[120px]" />
          <div className="absolute right-[-80px] md:right-[-120px] top-1/2 h-[240px] w-[240px] md:h-[320px] md:w-[320px] -translate-y-1/2 rounded-full bg-lime-300/20 blur-[120px]" />

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="relative z-20 mx-auto w-full max-w-7xl px-5 md:px-10 min-h-screen flex items-center"
          >
            {/* Mobile: stacked layout */}
            <div className="flex flex-col gap-10 w-full py-24 lg:hidden">
              {/* Headline */}
              <h1 className="text-[clamp(3rem,12vw,5rem)] font-black leading-[0.9] tracking-tight text-white drop-shadow-[0_8px_20px_rgba(0,0,0,0.3)]">
                Let's Work
                <br />
                Together
              </h1>

              {/* Contact items */}
              <div className="flex flex-col gap-8 drop-shadow-[0_8px_20px_rgba(0,0,0,0.8)]">
                <div className="flex items-start gap-4">
                  <div className="text-3xl text-lime-300">↗</div>
                  <div>
                    <h3 className="mb-1 text-xl font-bold">Phone Number</h3>
                    <p className="text-lg text-white/90">065 - 731 - 7994</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="text-3xl text-lime-300">↗</div>
                  <div>
                    <h3 className="mb-1 text-xl font-bold">Mail</h3>
                    <p className="text-lg text-white/90">pasin.sp@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="text-3xl text-lime-300">↗</div>
                  <div>
                    <h3 className="mb-1 text-xl font-bold">Address</h3>
                    <p className="text-lg leading-relaxed text-white/90">
                      2/10 Moo 2, Pak Kret District,
                      <br />
                      Nonthaburi Province, Thailand
                    </p>
                  </div>
                </div>
              </div>

              {/* Profile image (mobile) */}
              <div className="relative w-full max-w-xs mx-auto">
                <img
                  src="/images/contact.png?v=1"
                  alt="Contact"
                  className="w-full h-[320px] object-cover grayscale"
                />
                {/* Star decoration */}
                <div
                  className="absolute bottom-[-20px] right-[-20px] h-[100px] w-[100px]"
                  style={{
                    background: "#E6FF5B",
                    clipPath:
                      "polygon(50% 0%, 61% 20%, 82% 7%, 74% 30%, 100% 25%, 80% 45%, 100% 50%, 80% 55%, 100% 75%, 74% 70%, 82% 93%, 61% 80%, 50% 100%, 39% 80%, 18% 93%, 26% 70%, 0% 75%, 20% 55%, 0% 50%, 20% 45%, 0% 25%, 26% 30%, 18% 7%, 39% 20%)",
                  }}
                />
              </div>
            </div>

            {/* Desktop: side-by-side layout */}
            <div className="hidden lg:flex w-full items-center justify-between gap-10">
              {/* Left: contact info */}
              <div className="flex flex-col gap-12 drop-shadow-[0_8px_20px_rgba(0,0,0,0.8)]">
                <div className="flex items-start gap-5">
                  <div className="text-4xl text-lime-300">↗</div>
                  <div>
                    <h3 className="mb-2 text-3xl font-bold">Phone Number</h3>
                    <p className="text-2xl text-white/90">065 - 731 - 7994</p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="text-4xl text-lime-300">↗</div>
                  <div>
                    <h3 className="mb-2 text-3xl font-bold">Mail</h3>
                    <p className="text-2xl text-white/90">pasin.sp@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="text-4xl text-lime-300">↗</div>
                  <div>
                    <h3 className="mb-2 text-3xl font-bold">Address</h3>
                    <p className="max-w-md text-2xl leading-relaxed text-white/90">
                      2/10 Moo 2, Pak Kret District,
                      <br />
                      Nonthaburi Province, Thailand
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: image + headline */}
              <div className="relative flex items-center justify-center flex-shrink-0">
                <div className="relative overflow-visible">
                  <img
                    src="/images/contact.png?v=1"
                    alt="Contact"
                    className="h-[550px] xl:h-[650px] w-auto object-cover grayscale"
                  />
                  <div className="absolute left-[1vw] top-6 z-20">
                    <h1 className="whitespace-nowrap text-[clamp(50px,6vw,100px)] font-black leading-[0.9] tracking-tight text-white drop-shadow-[0_8px_20px_rgba(0,0,0,0.30)]">
                      Let's Work
                      <br />
                      Together
                    </h1>
                  </div>
                  <div
                    className="absolute bottom-[10px] left-[-65px] z-20 h-[140px] w-[140px] xl:h-[170px] xl:w-[170px]"
                    style={{
                      background: "#E6FF5B",
                      clipPath:
                        "polygon(50% 0%, 61% 20%, 82% 7%, 74% 30%, 100% 25%, 80% 45%, 100% 50%, 80% 55%, 100% 75%, 74% 70%, 82% 93%, 61% 80%, 50% 100%, 39% 80%, 18% 93%, 26% 70%, 0% 75%, 20% 55%, 0% 50%, 20% 45%, 0% 25%, 26% 30%, 18% 7%, 39% 20%)",
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* FOOTER */}
      <Footer onNavigate={scrollTo} isDark={isDark} />
    </>
  );
}

export default App;
