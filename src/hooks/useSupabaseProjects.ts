// src/hooks/useSupabaseProjects.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Global hook ที่ดึงข้อมูลจาก Supabase แทน static projects.ts
// มี in-memory cache ไม่ fetch ซ้ำระหว่าง session
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useState, useEffect, useRef } from "react";
import { getProjects, getCategories } from "../lib/supabase";
import type { FSProjectItem, Category } from "../lib/supabase";
import { youtubeThumbnail } from "../data/projects";
import {
  projects as staticProjects,
  projectCategories as staticCategories,
} from "../data/projects";

/* ── re-export helpers จาก projects.ts เพื่อ backward-compat ── */
export { youtubeThumbnail };

/* ── Types compat กับ pages เดิม ── */
export type MediaItem =
  | { type: "image"; src: string }
  | { type: "youtube"; videoId: string };

export interface Project {
  id: string;
  categoryId: string;
  category: string;
  title: string;
  tagline: string;
  description: string;
  coverImage: string;
  media: MediaItem[];
  images: string[];
  year: string;
  role: string;
  liveUrl?: string;
  githubUrl?: string;
  highlights: string[];
  tags: string[];
}

export interface ProjectCategory {
  id: string;
  category: string;
  icon: string;
  items: Project[];
}

/* ── In-memory cache (shared ระหว่าง component instances) ── */
let _cache: {
  projects: Project[];
  categories: ProjectCategory[];
  flat: Project[];
} | null = null;

let _fetchPromise: Promise<void> | null = null;

/** Convert static projects.ts data to the Project type used here */
function getStaticFallback(): { flat: Project[]; categories: ProjectCategory[] } {
  const flat: Project[] = staticProjects.map((p) => ({
    id: p.id,
    categoryId: p.categoryId,
    category: p.category,
    title: p.title,
    tagline: p.tagline,
    description: p.description,
    coverImage: p.coverImage,
    media: (p.media ?? []) as MediaItem[],
    images: p.images ?? [],
    year: p.year,
    role: p.role,
    liveUrl: p.liveUrl,
    githubUrl: p.githubUrl,
    highlights: p.highlights ?? [],
    tags: p.tags ?? [],
  }));

  const categories: ProjectCategory[] = staticCategories.map((cat) => ({
    id: cat.id,
    category: cat.category,
    icon: cat.icon,
    items: flat.filter((p) => p.categoryId === cat.id),
  }));

  return { flat, categories };
}

async function fetchData() {
  if (_cache) return;
  if (_fetchPromise) return _fetchPromise;

  _fetchPromise = (async () => {
    const [projs, cats] = await Promise.all([getProjects(), getCategories()]);

    const flat: Project[] = projs.map((p: FSProjectItem) => ({
      id: p.id,
      categoryId: p.categoryId,
      category: p.category,
      title: p.title,
      tagline: p.tagline,
      description: p.description,
      coverImage: p.coverImage,
      media: (p.media ?? []) as MediaItem[],
      images: p.images ?? [],
      year: p.year,
      role: p.role,
      liveUrl: p.liveUrl,
      githubUrl: p.githubUrl,
      highlights: p.highlights ?? [],
      tags: p.tags ?? [],
    }));

    /* ── Merge: เพิ่ม static projects ที่ไม่มีใน Supabase ── */
    const supabaseIds = new Set(flat.map((p) => p.id));
    const fallback = getStaticFallback();
    for (const sp of fallback.flat) {
      if (!supabaseIds.has(sp.id)) {
        flat.push(sp);
      }
    }

    const sortedCats = [...cats].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );

    /* ── Build categories จาก Supabase + merge static categories ที่ขาด ── */
    const catIds = new Set(sortedCats.map((c) => c.id));
    const categories: ProjectCategory[] = sortedCats.map((cat: Category) => ({
      id: cat.id,
      category: cat.category,
      icon: cat.icon,
      items: flat.filter((p) => p.categoryId === cat.id),
    }));

    // เพิ่ม static categories ที่ไม่มีใน Supabase
    for (const sc of fallback.categories) {
      if (!catIds.has(sc.id)) {
        categories.push({
          ...sc,
          items: flat.filter((p) => p.categoryId === sc.id),
        });
      } else {
        // update items ของ category ที่มีอยู่แล้วให้รวม static projects ด้วย
        const existing = categories.find((c) => c.id === sc.id);
        if (existing) {
          existing.items = flat.filter((p) => p.categoryId === sc.id);
        }
      }
    }

    _cache = { projects: flat, categories, flat };
    _fetchPromise = null;
  })();

  return _fetchPromise;
}

/* ── Public cache invalidation (เรียกหลัง admin แก้ข้อมูล) ── */
export function invalidateProjectsCache() {
  _cache = null;
  _fetchPromise = null;
}

/* ── Main hook ── */
interface UseSupabaseProjectsReturn {
  projects: Project[];
  projectCategories: ProjectCategory[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSupabaseProjects(): UseSupabaseProjectsReturn {
  const [data, setData] = useState<{
    projects: Project[];
    categories: ProjectCategory[];
  } | null>(() =>
    _cache ? { projects: _cache.flat, categories: _cache.categories } : null,
  );
  const [loading, setLoading] = useState(!_cache);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (_cache && tick === 0) {
      setData({ projects: _cache.flat, categories: _cache.categories });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetchData()
      .then(() => {
        if (!mountedRef.current || !_cache) return;
        setData({ projects: _cache.flat, categories: _cache.categories });
      })
      .catch((e: unknown) => {
        if (!mountedRef.current) return;
        setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (mountedRef.current) setLoading(false);
      });
  }, [tick]);

  return {
    projects: data?.projects ?? [],
    projectCategories: data?.categories ?? [],
    loading,
    error,
    refetch: () => {
      _cache = null;
      _fetchPromise = null;
      setTick((t) => t + 1);
    },
  };
}
