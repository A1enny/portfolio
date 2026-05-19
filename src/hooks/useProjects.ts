// src/hooks/useProjects.ts

import { useState, useEffect } from "react";
import { getProjects, getCategories } from "../lib/supabase";
import type { FSProjectItem, Category } from "../lib/supabase";

interface UseProjectsReturn {
  projects: FSProjectItem[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<FSProjectItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([getProjects(), getCategories()])
      .then(([projs, cats]) => {
        if (cancelled) return;
        setProjects(projs);
        setCategories(cats);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tick]);

  return {
    projects,
    categories,
    loading,
    error,
    refetch: () => setTick((t) => t + 1),
  };
}
