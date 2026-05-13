import {
  ArrowLeft,
  ExternalLink,
  ArrowUpRight,
  ChevronDown,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Play,
} from "lucide-react";

const IconGitHub = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback, useRef } from "react";
import type { Project, MediaItem } from "../data/projects";
import { projectCategories, youtubeThumbnail } from "../data/projects";

interface Props {
  project: Project;
  isDark: boolean;
  onBack: () => void;
  onNavigate: (id: string) => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
      delay: i * 0.07,
    },
  }),
};

const AUTO_CYCLE_MS = 10_000;

function isYouTube(
  item: MediaItem,
): item is Extract<MediaItem, { type: "youtube" }> {
  return item.type === "youtube";
}

function mediaThumbnail(item: MediaItem): string {
  if (isYouTube(item)) return youtubeThumbnail(item.videoId, "hqdefault");
  return item.src;
}

function YouTubeEmbed({
  videoId,
  autoplay = false,
  onPlay,
}: {
  videoId: string;
  autoplay?: boolean;
  onPlay?: () => void;
}) {
  const src = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1${autoplay ? "&autoplay=1" : ""}`;
  return (
    <iframe
      src={src}
      title="YouTube video"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="absolute inset-0 h-full w-full"
      onLoad={onPlay}
    />
  );
}

function YouTubeThumbnailSlide({
  videoId,
  onClick,
  isDark,
}: {
  videoId: string;
  onClick: () => void;
  isDark: boolean;
}) {
  const thumb = youtubeThumbnail(videoId, "hqdefault");
  return (
    <button
      onClick={onClick}
      className="absolute inset-0 flex items-center justify-center w-full h-full group/yt"
      aria-label="Play video"
    >
      <img
        src={thumb}
        alt="Video thumbnail"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Dark scrim */}
      <div className="absolute inset-0 bg-black/30 transition-opacity duration-200 group-hover/yt:bg-black/20" />
      {/* Play button */}
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-red-600 shadow-2xl transition-all duration-200 group-hover/yt:scale-110 group-hover/yt:bg-red-500">
        <Play size={22} className="translate-x-0.5 fill-white text-white" />
      </div>
      {/* YouTube badge */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[10px] text-white/80 backdrop-blur-sm">
        <svg
          width="12"
          height="9"
          viewBox="0 0 24 17"
          fill="currentColor"
          className="text-red-500"
        >
          <path d="M23.5 2.6s-.2-1.6-1-2.3c-.9-1-1.9-1-2.4-1C17 0 12 0 12 0S7 0 3.8.3c-.5.1-1.5.1-2.4 1-.7.7-1 2.3-1 2.3S0 4.4 0 6.3v1.7c0 1.8.4 3.7.4 3.7s.2 1.6 1 2.3c.9 1 2.1.9 2.6 1 1.9.2 8 .2 8 .2s5 0 8.2-.3c.5-.1 1.5-.1 2.4-1 .7-.7 1-2.3 1-2.3S24 9.8 24 8V6.3C24 4.4 23.5 2.6 23.5 2.6zM9.5 11.6V4.8l6.5 3.4-6.5 3.4z" />
        </svg>
        YouTube
      </div>
    </button>
  );
}

function ProjectDetailPage({ project, isDark, onBack, onNavigate }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playingVideo, setPlayingVideo] = useState(false); // true = iframe shown
  const [expandedCat, setExpandedCat] = useState<string | null>(
    project.categoryId,
  );
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressStartRef = useRef<number>(Date.now());

  const allMedia: MediaItem[] =
    project.media && project.media.length > 0
      ? project.media
      : [{ type: "image", src: project.coverImage }];

  const hasMultiple = allMedia.length > 1;
  const activeItem = allMedia[activeIndex];
  const isActiveYouTube = isYouTube(activeItem);

  const shouldPause = isHovered || lightboxOpen || playingVideo;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setActiveIndex(0);
    setPlayingVideo(false);
    setExpandedCat(project.categoryId);
    setLightboxOpen(false);
    setProgress(0);
  }, [project.id, project.categoryId]);

  useEffect(() => {
    setPlayingVideo(false);
  }, [activeIndex]);

  // ── auto-cycle ──
  const startCycle = useCallback(() => {
    if (!hasMultiple) return;
    progressStartRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % allMedia.length);
      setPlayingVideo(false);
      progressStartRef.current = Date.now();
    }, AUTO_CYCLE_MS);

    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - progressStartRef.current;
      setProgress(Math.min((elapsed / AUTO_CYCLE_MS) * 100, 100));
    }, 50);
  }, [hasMultiple, allMedia.length]);

  const stopCycle = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
  }, []);

  useEffect(() => {
    if (!shouldPause) {
      startCycle();
    } else {
      stopCycle();
    }
    return stopCycle;
  }, [shouldPause, startCycle, stopCycle]);

  const goToIndex = useCallback(
    (index: number) => {
      stopCycle();
      setActiveIndex(index);
      setPlayingVideo(false);
      setProgress(0);
      progressStartRef.current = Date.now();
      if (!shouldPause) startCycle();
    },
    [stopCycle, startCycle, shouldPause],
  );

  const prevSlide = useCallback(
    () => goToIndex((activeIndex - 1 + allMedia.length) % allMedia.length),
    [activeIndex, allMedia.length, goToIndex],
  );

  const nextSlide = useCallback(
    () => goToIndex((activeIndex + 1) % allMedia.length),
    [activeIndex, allMedia.length, goToIndex],
  );

  // ── lightbox ──
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);
  const lbPrev = useCallback(
    () => setLightboxIndex((p) => (p - 1 + allMedia.length) % allMedia.length),
    [allMedia.length],
  );
  const lbNext = useCallback(
    () => setLightboxIndex((p) => (p + 1) % allMedia.length),
    [allMedia.length],
  );

  // ── keyboard ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (lightboxOpen) {
        if (e.key === "ArrowLeft") lbPrev();
        if (e.key === "ArrowRight") lbNext();
        if (e.key === "Escape") closeLightbox();
      } else {
        if (e.key === "ArrowLeft") prevSlide();
        if (e.key === "ArrowRight") nextSlide();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen, lbPrev, lbNext, prevSlide, nextSlide]);

  // ── theme tokens ──
  const bg = isDark ? "bg-[#0a0a0a]" : "bg-neutral-50";
  const text = isDark ? "text-white" : "text-neutral-900";
  const muted = isDark ? "text-white/45" : "text-neutral-500";
  const border = isDark ? "border-white/8" : "border-neutral-200";
  const surface = isDark ? "bg-white/4" : "bg-white";
  const surfaceHover = isDark ? "hover:bg-white/7" : "hover:bg-neutral-50";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className={`min-h-screen ${bg} ${text}`}
    >
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-sm"
            onClick={closeLightbox}
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-200 hover:bg-white/20"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-xs text-white/70 backdrop-blur-sm">
              {lightboxIndex + 1} / {allMedia.length}
            </div>

            {/* Prev */}
            {hasMultiple && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  lbPrev();
                }}
                className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-200 hover:bg-white/20 hover:scale-110"
                aria-label="Previous"
              >
                <ChevronLeft size={22} />
              </button>
            )}

            {/* Media */}
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="relative mx-auto px-16"
              style={{ width: "90vw", maxWidth: 960 }}
              onClick={(e) => e.stopPropagation()}
            >
              {isYouTube(allMedia[lightboxIndex]) ? (
                <div
                  className="relative w-full overflow-hidden rounded-xl"
                  style={{ aspectRatio: "16/9" }}
                >
                  <YouTubeEmbed
                    videoId={
                      (
                        allMedia[lightboxIndex] as Extract<
                          MediaItem,
                          { type: "youtube" }
                        >
                      ).videoId
                    }
                    autoplay
                  />
                </div>
              ) : (
                <img
                  src={
                    (
                      allMedia[lightboxIndex] as Extract<
                        MediaItem,
                        { type: "image" }
                      >
                    ).src
                  }
                  alt={`${project.title} — ${lightboxIndex + 1}`}
                  className="max-h-[80vh] w-auto rounded-xl object-contain shadow-2xl mx-auto block"
                />
              )}
            </motion.div>

            {/* Next */}
            {hasMultiple && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  lbNext();
                }}
                className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-200 hover:bg-white/20 hover:scale-110"
                aria-label="Next"
              >
                <ChevronRight size={22} />
              </button>
            )}

            {/* Lightbox thumbnails */}
            {hasMultiple && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 rounded-2xl bg-black/50 p-2 backdrop-blur-sm">
                {allMedia.map((item, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex(i);
                    }}
                    className={`relative h-10 w-14 flex-shrink-0 overflow-hidden rounded-lg border transition-all duration-200 ${
                      lightboxIndex === i
                        ? "border-white/60 opacity-100 ring-1 ring-white/20"
                        : "border-white/15 opacity-40 hover:opacity-70"
                    }`}
                  >
                    <img
                      src={mediaThumbnail(item)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    {isYouTube(item) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play size={10} className="fill-white text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            <p className="absolute bottom-4 right-4 text-[10px] text-white/25">
              ← → arrow keys · esc to close
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`sticky top-0 z-40 border-b backdrop-blur-xl ${border} ${
          isDark ? "bg-black/60" : "bg-white/80"
        }`}
      >
        <div className="mx-auto flex h-14 md:h-16 max-w-7xl items-center justify-between px-4 md:px-12">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 text-sm transition-colors duration-200 ${muted} hover:${text}`}
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">Back to projects</span>
            <span className="sm:hidden">Back</span>
          </button>
          <div className="flex items-center gap-2">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs transition-all duration-200 hover:scale-105 ${border} ${surface} ${muted}`}
              >
                <IconGitHub size={13} />
                <span className="hidden sm:inline">GitHub</span>
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-all duration-200 hover:scale-105 ${
                  isDark
                    ? "bg-white text-black hover:bg-white/90"
                    : "bg-neutral-900 text-white hover:bg-neutral-700"
                }`}
              >
                Live site <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN LAYOUT ───────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-12 md:py-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
          {/* ── LEFT ── */}
          <div className="flex-1 min-w-0">
            {/* Meta badges */}
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mb-5 flex flex-wrap gap-2"
            >
              {[project.category, project.year, project.role].map((tag) => (
                <span
                  key={tag}
                  className={`rounded-full border px-3 py-1 text-xs ${border} ${surface} ${muted}`}
                >
                  {tag}
                </span>
              ))}
            </motion.div>

            {/* Title */}
            <motion.h1
              custom={1}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mb-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
            >
              {project.title}
            </motion.h1>

            {/* Tagline */}
            <motion.p
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className={`mb-8 md:mb-10 text-base md:text-lg leading-relaxed ${muted}`}
            >
              {project.tagline}
            </motion.p>

            {/* ── GALLERY ── */}
            {allMedia.length > 0 && (
              <motion.div
                custom={3}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="mb-8 md:mb-10"
              >
                {/* Main slide */}
                <div
                  className={`group relative overflow-hidden rounded-2xl border ${border} ${isDark ? "bg-black" : "bg-neutral-900"}`}
                  style={{ aspectRatio: "16/9" }}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0"
                    >
                      {isActiveYouTube ? (
                        playingVideo ? (
                          // Embed shown after user clicks play thumbnail
                          <YouTubeEmbed
                            videoId={
                              (
                                activeItem as Extract<
                                  MediaItem,
                                  { type: "youtube" }
                                >
                              ).videoId
                            }
                            autoplay
                          />
                        ) : (
                          <YouTubeThumbnailSlide
                            videoId={
                              (
                                activeItem as Extract<
                                  MediaItem,
                                  { type: "youtube" }
                                >
                              ).videoId
                            }
                            onClick={() => setPlayingVideo(true)}
                            isDark={isDark}
                          />
                        )
                      ) : (
                        <img
                          src={
                            (
                              activeItem as Extract<
                                MediaItem,
                                { type: "image" }
                              >
                            ).src
                          }
                          alt={`${project.title} — ${activeIndex + 1}`}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Progress bar (hidden when video is playing) */}
                  {hasMultiple && !shouldPause && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/30 pointer-events-none">
                      <div
                        className="h-full bg-white/60 transition-none"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}

                  {/* Paused pill */}
                  {hasMultiple && isHovered && !playingVideo && (
                    <div className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] text-white/70 backdrop-blur-sm pointer-events-none">
                      paused
                    </div>
                  )}

                  {/* Video playing pill */}
                  {playingVideo && (
                    <div className="absolute bottom-3 left-3 rounded-full bg-red-600/80 px-2.5 py-1 text-[10px] text-white backdrop-blur-sm pointer-events-none flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      Playing
                    </div>
                  )}

                  {/* Counter */}
                  {hasMultiple && (
                    <div className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] text-white/70 backdrop-blur-sm pointer-events-none">
                      {activeIndex + 1} / {allMedia.length}
                    </div>
                  )}

                  {/* Expand button (not shown when video is playing — YouTube already has fullscreen) */}
                  {!playingVideo && (
                    <button
                      onClick={() => openLightbox(activeIndex)}
                      className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg bg-black/50 text-white/70 opacity-0 backdrop-blur-sm transition-all duration-200 hover:bg-black/70 hover:text-white group-hover:opacity-100"
                      aria-label="Open fullscreen"
                    >
                      <ZoomIn size={14} />
                    </button>
                  )}

                  {/* Prev / Next arrows */}
                  {hasMultiple && !playingVideo && (
                    <>
                      <button
                        onClick={prevSlide}
                        className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white/80 opacity-0 backdrop-blur-sm transition-all duration-200 hover:bg-black/70 hover:scale-110 group-hover:opacity-100"
                        aria-label="Previous"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        onClick={nextSlide}
                        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white/80 opacity-0 backdrop-blur-sm transition-all duration-200 hover:bg-black/70 hover:scale-110 group-hover:opacity-100"
                        aria-label="Next"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </>
                  )}
                </div>

                {/* Dot indicators */}
                {hasMultiple && (
                  <div className="mt-3 flex justify-center gap-1.5">
                    {allMedia.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => goToIndex(i)}
                        className={`rounded-full transition-all duration-300 ${
                          activeIndex === i
                            ? isDark
                              ? "w-4 h-1.5 bg-white/70"
                              : "w-4 h-1.5 bg-neutral-700"
                            : isDark
                              ? "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"
                              : "w-1.5 h-1.5 bg-neutral-300 hover:bg-neutral-500"
                        }`}
                        aria-label={`Go to ${item.type === "youtube" ? "video" : "image"} ${i + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Thumbnail strip */}
                {allMedia.length > 1 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {allMedia.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => goToIndex(i)}
                        className={`relative flex-shrink-0 h-14 w-20 overflow-hidden rounded-lg border transition-all duration-200 ${
                          activeIndex === i
                            ? isDark
                              ? "border-white/50 ring-1 ring-white/20 opacity-100"
                              : "border-neutral-800 ring-1 ring-neutral-300 opacity-100"
                            : `${border} opacity-45 hover:opacity-75`
                        }`}
                        aria-label={`${item.type === "youtube" ? "Video" : "Image"} ${i + 1}`}
                      >
                        <img
                          src={mediaThumbnail(item)}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        {/* YouTube play icon overlay on thumbnail */}
                        {isYouTube(item) && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600/90">
                              <Play
                                size={8}
                                className="translate-x-px fill-white text-white"
                              />
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Hint */}
                {hasMultiple && (
                  <p
                    className={`mt-2 text-center text-[10px] ${isDark ? "text-white/20" : "text-neutral-400"}`}
                  >
                    Use ← → arrow keys to navigate · click image to expand
                  </p>
                )}
              </motion.div>
            )}

            {/* Description */}
            <motion.div
              custom={4}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mb-8 md:mb-10"
            >
              <p
                className={`mb-4 text-[10px] font-semibold uppercase tracking-[0.15em] ${isDark ? "text-white/25" : "text-neutral-400"}`}
              >
                About this project
              </p>
              <p
                className={`text-sm md:text-base leading-relaxed ${isDark ? "text-white/65" : "text-neutral-600"}`}
              >
                {project.description}
              </p>
            </motion.div>

            {/* Highlights */}
            {project.highlights.length > 0 && (
              <motion.div
                custom={5}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="mb-8 md:mb-10"
              >
                <p
                  className={`mb-4 text-[10px] font-semibold uppercase tracking-[0.15em] ${isDark ? "text-white/25" : "text-neutral-400"}`}
                >
                  Key highlights
                </p>
                <ul className="space-y-3">
                  {project.highlights.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className={`mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full ${isDark ? "bg-white/30" : "bg-neutral-400"}`}
                      />
                      <span
                        className={`text-sm leading-relaxed ${isDark ? "text-white/60" : "text-neutral-600"}`}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Tech stack */}
            <motion.div
              custom={6}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              <p
                className={`mb-4 text-[10px] font-semibold uppercase tracking-[0.15em] ${isDark ? "text-white/25" : "text-neutral-400"}`}
              >
                Tech stack
              </p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${border} ${surface} ${isDark ? "text-white/65" : "text-neutral-700"}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT: SIDEBAR ── */}
          <div className="w-full lg:w-64 xl:w-72 flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <p
                className={`mb-4 text-[10px] font-semibold uppercase tracking-[0.15em] ${isDark ? "text-white/25" : "text-neutral-400"}`}
              >
                All projects
              </p>
              <div className="flex flex-col gap-2">
                {projectCategories.map((cat, ci) => {
                  const isExpanded = expandedCat === cat.id;
                  const hasCurrentProject = cat.items.some(
                    (item) => item.id === project.id,
                  );
                  return (
                    <motion.div
                      key={cat.id}
                      custom={ci}
                      initial="hidden"
                      animate="visible"
                      variants={fadeUp}
                      className={`rounded-xl border overflow-hidden ${border} ${surface}`}
                    >
                      <button
                        onClick={() =>
                          setExpandedCat(isExpanded ? null : cat.id)
                        }
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors duration-200 ${surfaceHover}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{cat.icon}</span>
                          <span
                            className={`text-xs font-medium ${hasCurrentProject ? (isDark ? "text-white" : "text-neutral-900") : isDark ? "text-white/60" : "text-neutral-600"}`}
                          >
                            {cat.category}
                          </span>
                          <span
                            className={`text-[10px] rounded-full px-1.5 py-0.5 ${isDark ? "bg-white/8 text-white/35" : "bg-neutral-100 text-neutral-400"}`}
                          >
                            {cat.items.length}
                          </span>
                        </div>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown
                            size={13}
                            className={
                              isDark ? "text-white/30" : "text-neutral-400"
                            }
                          />
                        </motion.div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                              duration: 0.25,
                              ease: [0.16, 1, 0.3, 1] as const,
                            }}
                            className="overflow-hidden"
                          >
                            <div
                              className={`border-t px-2 py-2 flex flex-col gap-1 ${border}`}
                            >
                              {cat.items.map((item) => {
                                const isActive = item.id === project.id;
                                return (
                                  <button
                                    key={item.id}
                                    onClick={() =>
                                      !isActive && onNavigate(item.id)
                                    }
                                    className={`group flex items-start gap-2.5 rounded-lg p-2 text-left transition-all duration-200 ${
                                      isActive
                                        ? isDark
                                          ? "bg-white/10 cursor-default"
                                          : "bg-neutral-100 cursor-default"
                                        : `${surfaceHover} hover:scale-[1.01] cursor-pointer`
                                    }`}
                                  >
                                    <div
                                      className={`h-10 w-14 flex-shrink-0 overflow-hidden rounded-md border ${border} ${isDark ? "bg-white/5" : "bg-neutral-100"}`}
                                    >
                                      <img
                                        src={item.coverImage}
                                        alt={item.title}
                                        className="h-full w-full object-cover"
                                      />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-start justify-between gap-1">
                                        <p
                                          className={`text-xs font-medium leading-snug ${isActive ? (isDark ? "text-white" : "text-neutral-900") : isDark ? "text-white/70" : "text-neutral-700"}`}
                                        >
                                          {item.title}
                                        </p>
                                        {!isActive && (
                                          <ArrowUpRight
                                            size={11}
                                            className={`mt-0.5 flex-shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-50 ${isDark ? "text-white" : "text-neutral-900"}`}
                                          />
                                        )}
                                        {isActive && (
                                          <span
                                            className={`mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${isDark ? "bg-white/50" : "bg-neutral-500"}`}
                                          />
                                        )}
                                      </div>
                                      <p
                                        className={`mt-0.5 text-[10px] leading-snug line-clamp-1 ${isDark ? "text-white/30" : "text-neutral-400"}`}
                                      >
                                        {item.tagline}
                                      </p>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ProjectDetailPage;
