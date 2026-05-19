// src/scripts/migrate.ts
// รัน 1 ครั้งเพื่ออัพโหลดข้อมูลจาก projects.ts → Supabase

import { supabase } from "../lib/supabase";
import { projectCategories } from "../data/projects";

export async function runMigration() {
  console.log("🚀 Starting migration to Supabase...");

  for (const [catIndex, cat] of projectCategories.entries()) {
    // 1. upsert category
    const { error: catErr } = await supabase.from("categories").upsert({
      id: cat.id,
      category: cat.category,
      icon: cat.icon,
      order: catIndex,
    });
    if (catErr) throw catErr;

    // 2. upsert projects ในแต่ละ category
    for (const [itemIndex, item] of cat.items.entries()) {
      const { error: projErr } = await supabase.from("projects").upsert({
        id: item.id,
        category_id: cat.id,
        category: cat.category,
        title: item.title,
        tagline: item.tagline,
        description: item.description,
        cover_image: item.coverImage,
        media: item.media,
        images: item.images ?? [],
        year: item.year,
        role: item.role,
        live_url: item.liveUrl ?? null,
        github_url: item.githubUrl ?? null,
        highlights: item.highlights,
        tags: item.tags,
        order: catIndex * 100 + itemIndex,
      });
      if (projErr) throw projErr;
    }
  }

  console.log("✅ Migration complete!");
}
