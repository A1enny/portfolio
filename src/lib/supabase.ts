// src/lib/supabase.ts
// แทนที่ firebase.ts ทั้งหมด

import { createClient } from "@supabase/supabase-js";

/* ══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════ */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* ══════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════ */

export type MediaItem =
  | { type: "image"; src: string }
  | { type: "youtube"; videoId: string };

export type FSMediaItem = MediaItem;

export interface Category {
  id: string;
  category: string;
  icon: string;
  order: number;
}

export interface Project {
  id: string;
  category_id: string;
  category: string;
  title: string;
  tagline: string;
  description: string;
  cover_image: string;
  media: MediaItem[];
  images?: string[];
  year: string;
  role: string;
  live_url?: string;
  github_url?: string;
  highlights: string[];
  tags: string[];
  order: number;
  created_at?: string;
  updated_at?: string;
}

// Alias ที่ AdminPage.tsx ใช้ (camelCase compat)
export interface FSProjectItem {
  id: string;
  categoryId: string;
  category: string;
  title: string;
  tagline: string;
  description: string;
  coverImage: string;
  media: MediaItem[];
  images?: string[];
  year: string;
  role: string;
  liveUrl?: string;
  githubUrl?: string;
  highlights: string[];
  tags: string[];
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FSCategory extends Category {
  items: FSProjectItem[];
}

/* ══════════════════════════════════════════════
   AUTH HELPERS
══════════════════════════════════════════════ */

export const adminLogin = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
};

export const adminLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const onAdminAuthChange = (
  cb: (user: import("@supabase/supabase-js").User | null) => void,
) => {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    cb(session?.user ?? null);
  });
  // คืน unsubscribe function เหมือน Firebase
  return () => data.subscription.unsubscribe();
};

/* ══════════════════════════════════════════════
   HELPERS — แปลง DB row → FSProjectItem (camelCase)
══════════════════════════════════════════════ */

function rowToProject(row: Project): FSProjectItem {
  return {
    id: row.id,
    categoryId: row.category_id,
    category: row.category,
    title: row.title,
    tagline: row.tagline,
    description: row.description,
    coverImage: row.cover_image,
    media: row.media ?? [],
    images: row.images ?? [],
    year: row.year,
    role: row.role,
    liveUrl: row.live_url,
    githubUrl: row.github_url,
    highlights: row.highlights ?? [],
    tags: row.tags ?? [],
    order: row.order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function projectToRow(
  data: Partial<FSProjectItem>,
): Partial<Omit<Project, "id">> {
  const row: Partial<Omit<Project, "id">> = {};
  if (data.categoryId !== undefined) row.category_id = data.categoryId;
  if (data.category !== undefined) row.category = data.category;
  if (data.title !== undefined) row.title = data.title;
  if (data.tagline !== undefined) row.tagline = data.tagline;
  if (data.description !== undefined) row.description = data.description;
  if (data.coverImage !== undefined) row.cover_image = data.coverImage;
  if (data.media !== undefined) row.media = data.media;
  if (data.images !== undefined) row.images = data.images;
  if (data.year !== undefined) row.year = data.year;
  if (data.role !== undefined) row.role = data.role;
  if (data.liveUrl !== undefined) row.live_url = data.liveUrl;
  if (data.githubUrl !== undefined) row.github_url = data.githubUrl;
  if (data.highlights !== undefined) row.highlights = data.highlights;
  if (data.tags !== undefined) row.tags = data.tags;
  if (data.order !== undefined) row.order = data.order;
  return row;
}

/* ══════════════════════════════════════════════
   CATEGORIES
══════════════════════════════════════════════ */

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchCategories(): Promise<FSCategory[]> {
  const [{ data: cats, error: catErr }, { data: projs, error: projErr }] =
    await Promise.all([
      supabase
        .from("categories")
        .select("*")
        .order("order", { ascending: true }),
      supabase.from("projects").select("*").order("order", { ascending: true }),
    ]);

  if (catErr) throw catErr;
  if (projErr) throw projErr;

  const allProjects: FSProjectItem[] = (projs ?? []).map(rowToProject);

  return (cats ?? []).map((cat: Category) => ({
    ...cat,
    items: allProjects.filter((p) => p.categoryId === cat.id),
  }));
}

export async function addCategory(
  data: Omit<FSCategory, "items">,
): Promise<void> {
  const { error } = await supabase.from("categories").insert({
    id: data.id,
    category: data.category,
    icon: data.icon,
    order: data.order,
  });
  if (error) throw error;
}

export async function updateCategory(
  catId: string,
  data: Partial<Omit<FSCategory, "id" | "items">>,
): Promise<void> {
  const { error } = await supabase
    .from("categories")
    .update(data)
    .eq("id", catId);
  if (error) throw error;
}

export async function deleteCategory(catId: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", catId);
  if (error) throw error;
}

/* ══════════════════════════════════════════════
   PROJECTS
══════════════════════════════════════════════ */

export async function getProjects(): Promise<FSProjectItem[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToProject);
}

export async function addProject(
  catId: string,
  data: Omit<FSProjectItem, "id" | "createdAt" | "updatedAt">,
): Promise<string> {
  // ดึงชื่อ category จาก categories table เพื่อ fill NOT NULL column "category"
  const { data: catRow, error: catErr } = await supabase
    .from("categories")
    .select("category")
    .eq("id", catId)
    .single();
  if (catErr) throw catErr;

  const id = crypto.randomUUID();
  const row = {
    id,
    ...projectToRow(data),
    category_id: catId,
    category: data.category || catRow.category,
  };
  const { data: inserted, error } = await supabase
    .from("projects")
    .insert(row)
    .select("id")
    .single();
  if (error) throw error;
  return inserted.id;
}

export async function updateProject(
  _catId: string,
  projectId: string,
  data: Partial<FSProjectItem>,
): Promise<void> {
  const { error } = await supabase
    .from("projects")
    .update({ ...projectToRow(data), updated_at: new Date().toISOString() })
    .eq("id", projectId);
  if (error) throw error;
}

export async function deleteProject(projectId: string): Promise<void>;
export async function deleteProject(
  catId: string,
  projectId: string,
): Promise<void>;
export async function deleteProject(a: string, b?: string): Promise<void> {
  const projectId = b ?? a;
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);
  if (error) throw error;
}

export async function reorderProjects(orderedIds: string[]): Promise<void> {
  const updates = orderedIds.map((id, index) =>
    supabase.from("projects").update({ order: index }).eq("id", id),
  );
  await Promise.all(updates);
}

/* ══════════════════════════════════════════════
   STORAGE — Supabase Storage
══════════════════════════════════════════════ */

export function uploadImage(
  file: File,
  path: string,
  onProgress?: (p: { progress: number }) => void,
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      onProgress?.({ progress: 10 });

      const { error } = await supabase.storage
        .from("images") // bucket ชื่อ "images"
        .upload(path, file, { upsert: true });

      if (error) throw error;

      onProgress?.({ progress: 90 });

      const { data } = supabase.storage.from("images").getPublicUrl(path);
      onProgress?.({ progress: 100 });
      resolve(data.publicUrl);
    } catch (e) {
      reject(e);
    }
  });
}

/* ══════════════════════════════════════════════
   VERCEL DEPLOY HOOK
══════════════════════════════════════════════ */

export async function triggerDeploy(): Promise<boolean> {
  const hookUrl = import.meta.env.VITE_VERCEL_DEPLOY_HOOK as string | undefined;
  if (!hookUrl) return false;
  try {
    const res = await fetch(hookUrl, { method: "POST" });
    return res.ok;
  } catch {
    return false;
  }
}
