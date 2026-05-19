#!/usr/bin/env node
/**
 * migrate.mjs
 * ─────────────────────────────────────────────────────────────────────
 * รัน 1 ครั้งเพื่อ seed ข้อมูลจาก projects data → Supabase
 *
 * วิธีใช้:
 *   1. ติดตั้ง dependency (ถ้ายังไม่มี):
 *        npm install @supabase/supabase-js dotenv
 *
 *   2. สร้างไฟล์ .env (หรือ .env.local) ที่ root:
 *        SUPABASE_URL=https://xxxx.supabase.co
 *        SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...   ← ใช้ service_role ไม่ใช่ anon!
 *
 *   3. รัน:
 *        node migrate.mjs
 *        # หรือถ้าต้องการ dry-run (ดูข้อมูลก่อนแต่ไม่ upsert):
 *        node migrate.mjs --dry-run
 * ─────────────────────────────────────────────────────────────────────
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// ── Load .env — อ่านทุกไฟล์ (local > base), service_role key มาทีหลัง override ได้ ──
function loadEnv() {
  // อ่าน .env ก่อน แล้ว .env.local ทับ (เหมือน Vite)
  const candidates = [".env", ".env.local"];
  for (const f of candidates) {
    const p = resolve(process.cwd(), f);
    if (!existsSync(p)) continue;
    const lines = readFileSync(p, "utf-8").split(/\r?\n/);
    let count = 0;
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed
        .slice(eqIdx + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      process.env[key] = val; // always overwrite — local file wins
      count++;
    }
    console.log(`📄 Loaded ${count} vars from: ${f}`);
  }
}

loadEnv();

// ── Debug: แสดงว่าอ่าน key ได้ถูกต้องไหม ──
const _url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";
const _srk = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const _anon = process.env.VITE_SUPABASE_ANON_KEY ?? "";

console.log(`\n🔎  Key resolution:`);
console.log(`   SUPABASE_URL              = ${_url || "(not found)"}`);
console.log(
  `   SUPABASE_SERVICE_ROLE_KEY = ${_srk ? _srk.slice(0, 30) + "…" : "(not found — will fallback to anon!)"}`,
);
console.log(
  `   VITE_SUPABASE_ANON_KEY    = ${_anon ? _anon.slice(0, 30) + "…" : "(not found)"}`,
);

if (!_srk) {
  console.error(
    "\n⛔  SUPABASE_SERVICE_ROLE_KEY ไม่พบ!\n" +
      "    เพิ่มในไฟล์ .env.local:\n" +
      "    SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...\n" +
      "    (หาได้ที่ Supabase Dashboard → Project Settings → API → service_role)\n",
  );
  process.exit(1);
}

// ── Env vars — resolved above ────────────────────────────────────────
const SUPABASE_URL = _url;
const SUPABASE_KEY = _srk; // service_role — bypasses RLS

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "❌  ไม่พบ SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ใน environment\n" +
      "    กรุณาสร้างไฟล์ .env หรือ .env.local ที่ root directory",
  );
  process.exit(1);
}

const DRY_RUN = process.argv.includes("--dry-run");
if (DRY_RUN) console.log("🔍  DRY-RUN mode — ไม่มีการเขียนข้อมูลจริง\n");

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

// ═══════════════════════════════════════════════════════════════════════
//  PROJECT DATA  (inline — ไม่ import จาก .ts เพื่อให้รันด้วย plain node)
// ═══════════════════════════════════════════════════════════════════════

function toYouTubeId(urlOrId) {
  try {
    const u = new URL(urlOrId);
    if (u.hostname === "youtu.be") return u.pathname.slice(1).split("?")[0];
    const v = u.searchParams.get("v");
    if (v) return v;
    const segs = u.pathname.split("/").filter(Boolean);
    const ei = segs.indexOf("embed");
    if (ei !== -1) return segs[ei + 1];
    const si = segs.indexOf("shorts");
    if (si !== -1) return segs[si + 1];
  } catch {}
  return urlOrId;
}

/** @type {Array<{id:string,category:string,icon:string,items:object[]}>} */
const projectCategories = [
  {
    id: "portfolio-design",
    category: "UI/UX Design",
    icon: "🌐",
    items: [
      {
        id: "webpage-design-landing",
        title: "Landing Pages",
        tagline: "Modern responsive landing pages with clean interactions",
        description:
          "ผลงานนี้เป็นส่วนหนึ่งของการฝึกงานที่ iBusiness Corporation Co., Ltd. ในตำแหน่ง UX/UI Designer โดยได้รับมอบหมายให้ออกแบบหน้าเว็บไซต์สำหรับองค์กรและโรงพยาบาลต่าง ๆ",
        coverImage: "/images/project/garphic/5.png",
        images: [
          "/images/project/landing/2.png",
          "/images/project/landing/3.png",
        ],
        media: [
          { type: "image", src: "/images/project/landing/1.png" },
          { type: "image", src: "/images/project/landing/2.png" },
          { type: "image", src: "/images/project/landing/3.png" },
        ],
        year: "2024",
        role: "UI/UX Designer",
        githubUrl: "https://github.com/",
        highlights: [
          "เลย์เอาต์แบบ Responsive ที่ปรับการแสดงผลได้เหมาะสมกับทุกขนาดหน้าจอ",
          "แอนิเมชันและ Micro-interactions ที่ลื่นไหลและทันสมัย",
          "ออกแบบโดยคำนึงถึงการเข้าถึงสำหรับผู้ใช้งานทุกคน",
        ],
        tags: ["Figma"],
      },
      {
        id: "webpage-design-app",
        title: "Mobile application design",
        tagline: "Mobile application design for iOS and Android",
        description:
          "ผลงานนี้เป็นส่วนหนึ่งของการฝึกงานที่ iBusiness Corporation Co., Ltd. ในตำแหน่ง UX/UI Designer",
        coverImage: "/images/project/appmb/2.png",
        images: [
          "/images/project/appmb/1.png",
          "/images/project/appmb/3.png",
          "/images/project/appmb/4.png",
        ],
        media: [
          { type: "image", src: "/images/project/appmb/1.png" },
          { type: "image", src: "/images/project/appmb/2.png" },
          { type: "image", src: "/images/project/appmb/3.png" },
          { type: "image", src: "/images/project/appmb/4.png" },
        ],
        year: "2024",
        role: "UI/UX Designer",
        githubUrl: "https://github.com/",
        highlights: [
          "ออกแบบ Mobile UI สำหรับหน้า Home และ Notification ของแอป DITP ONE",
          "วางโครงสร้างข้อมูลและลำดับการแสดงผลเพื่อเพิ่มความชัดเจนในการใช้งาน",
          "พัฒนาแนวทางการออกแบบที่เน้นความเรียบง่ายและใช้งานได้จริง",
          "สร้าง Prototype และเปรียบเทียบหลาย Design Direction ผ่าน Figma",
        ],
        tags: ["Figma"],
      },
    ],
  },
  {
    id: "graphic-design",
    category: "Graphic",
    icon: "🎨",
    items: [
      {
        id: "graphic-design-showcase",
        title: "Graphic Design Showcase",
        tagline: "This is my Show case Skill",
        description: "พิ้นที่เเสดงผลงานกราฟิก",
        coverImage: "/images/project/garphic/1.png",
        images: [
          "/images/project/garphic/1.png",
          "/images/project/garphic/2.png",
        ],
        media: [
          { type: "image", src: "/images/project/garphic/1.png" },
          { type: "image", src: "/images/project/garphic/2.png" },
          { type: "image", src: "/images/project/garphic/3.png" },
          { type: "image", src: "/images/project/garphic/4.png" },
          { type: "image", src: "/images/project/garphic/5.png" },
          { type: "image", src: "/images/project/garphic/6.png" },
        ],
        year: "2023",
        role: "Graphic Designer",
        highlights: [
          "Selected Works",
          "Design Showcase",
          "Creative Collection",
          "Visual Playground",
        ],
        tags: ["Photoshop"],
      },
      {
        id: "graphic-design-print",
        title: "Facebook Banners",
        tagline: "Seasonal campaign banners for brands and special occasions",
        description:
          "ผมได้รับมอบหมายให้ออกแบบแบนเนอร์สำหรับเทศกาลและแคมเปญประชาสัมพันธ์ต่างๆ สำหรับเพจ Facebook ของบริษัท iBusiness Corporation Co., Ltd.",
        coverImage: "/images/project/banner/1.jpg",
        images: [
          "/images/project/banner/2.png",
          "/images/project/banner/3.jpg",
          "/images/project/banner/4.png",
          "/images/project/banner/5.jpg",
          "/images/project/banner/6.png",
        ],
        media: [
          { type: "image", src: "/images/project/banner/1.jpg" },
          { type: "image", src: "/images/project/banner/2.png" },
          { type: "image", src: "/images/project/banner/3.jpg" },
          { type: "image", src: "/images/project/banner/4.png" },
          { type: "image", src: "/images/project/banner/5.jpg" },
          { type: "image", src: "/images/project/banner/6.png" },
        ],
        year: "2023",
        role: "Graphic Designer",
        highlights: [
          "ออกแบบ Social Media Banner สำหรับแคมเปญและเทศกาลต่าง ๆ",
          "พัฒนา Visual Design ให้สอดคล้องกับ Corporate Branding",
          "จัดวางองค์ประกอบและ Typography เพื่อเพิ่มความน่าสนใจในการสื่อสาร",
          "ปรับแต่ง Artwork สำหรับการใช้งานบน Facebook และแพลตฟอร์มออนไลน์",
        ],
        tags: ["Photoshop"],
      },
    ],
  },
  {
    id: "video-editing",
    category: "Video Editing",
    icon: "🎬",
    items: [
      {
        id: "video-editing-social",
        title: "Youtube channel",
        tagline:
          "Personal YouTube content created for fun, creativity, and editing practice",
        description:
          "ช่อง YouTube นี้เป็นโปรเจกต์ส่วนตัวที่สร้างขึ้นเพื่อฝึกฝนและพัฒนาทักษะด้านการตัดต่อวิดีโอ",
        coverImage: "/images/project/garphic/1.png",
        images: [],
        media: [
          { type: "image", src: "/images/project/youtube/1.png" },
          {
            type: "youtube",
            videoId: toYouTubeId("https://youtube.com/shorts/qfAIhNnn-3E"),
          },
          {
            type: "youtube",
            videoId: toYouTubeId("https://www.youtube.com/shorts/LmpPTq_GPPo"),
          },
          {
            type: "youtube",
            videoId: toYouTubeId("https://www.youtube.com/shorts/Xpx0Rwpi_BQ"),
          },
          {
            type: "youtube",
            videoId: toYouTubeId("https://www.youtube.com/shorts/9XeslsG1vxI"),
          },
          {
            type: "youtube",
            videoId: toYouTubeId("https://www.youtube.com/watch?v=rpU1CK_l2FE"),
          },
        ],
        year: "2024",
        role: "Video Editor & Content Creator",
        highlights: [
          "ตัดต่อวิดีโอและสร้างคอนเทนต์ลง YouTube ในรูปแบบ Personal Project",
          "ฝึกฝนการเล่าเรื่องผ่านการจัดจังหวะวิดีโอ ภาพ และเสียง",
          "ออกแบบ Thumbnail และองค์ประกอบภาพสำหรับสื่อออนไลน์",
          "พัฒนาทักษะด้าน Video Editing และ Creative Storytelling ผ่านการสร้างผลงานจริง",
        ],
        tags: ["Premiere Pro", "After Effects", "Photoshop", "Illustrator"],
      },
      {
        id: "video-editing-short",
        title: "Short Story",
        tagline: "From Imagination to Screen",
        description:
          "โปรเจกต์หนังสั้นนี้ เป็นวิดีโอเชิงสร้างสรรค์ที่เริ่มทำขึ้นเพื่อประกวดตอนช่วงมัธยม",
        coverImage: "/images/project/garphic/3.png",
        images: [],
        media: [
          { type: "image", src: "/images/project/short/1.png" },
          {
            type: "youtube",
            videoId: toYouTubeId(
              "https://www.youtube.com/watch?v=EB4NbXuz0w0&t=28s",
            ),
          },
          {
            type: "youtube",
            videoId: toYouTubeId(
              "https://www.youtube.com/watch?v=cfJAF4S_AcI&t=156s",
            ),
          },
        ],
        year: "2019",
        role: "Video Editor",
        highlights: [
          "เริ่มต้นสร้างโปรเจกต์หนังสั้นและวิดีโอตั้งแต่ช่วงมัธยมเพื่อฝึกฝนทักษะด้านการตัดต่อและการเล่าเรื่อง",
          "ดูแลกระบวนการผลิตคอนเทนต์ด้วยตนเอง ตั้งแต่คิดคอนเซปต์ ถ่ายทำ ตัดต่อ และเผยแพร่ผลงานบน YouTube",
          "ทดลองการเล่าเรื่องผ่านภาพ เสียง และจังหวะวิดีโอ เพื่อสร้างอารมณ์และประสบการณ์ให้ผู้ชม",
          "พัฒนาทักษะด้าน Video Editing, Creative Storytelling และ Visual Design ผ่านการสร้างผลงานจริงอย่างต่อเนื่อง",
        ],
        tags: ["Premiere Pro", "After Effects"],
      },
    ],
  },
  {
    id: "coding",
    category: "Coding",
    icon: "💻",
    items: [
      {
        id: "coding-fullstack",
        title: "Meawmong POS WEB-APP",
        tagline: "Full-stack applications built for performance and scale",
        description:
          "โปรเจกต์นี้เป็นระบบจัดการร้านอาหารสำหรับร้านอาหารญี่ปุ่น 'แมวมอง' ซึ่งพัฒนาขึ้นในฐานะโปรเจกต์จบการศึกษาระดับชั้นปีที่ 4",
        coverImage: "/images/project/maw/MAW.png",
        images: [
          "/images/project/maw/2.png",
          "/images/project/maw/3.png",
          "/images/project/maw/4.png",
          "/images/project/maw/6.png",
          "/images/project/maw/7.png",
        ],
        media: [
          { type: "image", src: "/images/project/maw/1.png" },
          { type: "image", src: "/images/project/maw/2.png" },
          { type: "image", src: "/images/project/maw/3.png" },
          { type: "image", src: "/images/project/maw/4.png" },
          { type: "image", src: "/images/project/maw/6.png" },
          { type: "image", src: "/images/project/maw/7.png" },
        ],
        year: "2024",
        role: "Full-Stack Developer",
        githubUrl: "https://github.com/",
        highlights: [
          "Research และวิเคราะห์ User Requirement จากการใช้งานจริงภายในร้านอาหาร",
          "ออกแบบระบบและ Interface โดยเน้นความง่ายต่อการใช้งานและลดขั้นตอนการทำงาน",
          "พัฒนา Frontend ด้วย React + Vite พร้อม Responsive Layout",
          "เชื่อมต่อ Backend ด้วย Node.js และจัดการฐานข้อมูลผ่าน phpMyAdmin",
        ],
        tags: [
          "React",
          "Vite",
          "Node.js",
          "Express",
          "MySQL",
          "phpMyAdmin",
          "Responsive Design",
          "Figma",
        ],
      },
      {
        id: "coding-portfolio",
        title: "Portfolio Website",
        tagline: "Personal portfolio with bento grid & smooth scroll",
        description:
          "พอร์ตโฟลิโอนี้ ออกแบบและสร้างขึ้นใหม่ตั้งแต่เริ่มต้น เพื่อนำเสนองานในด้านการพัฒนาเว็บ การออกแบบกราฟิก และการผลิตวิดีโอ",
        coverImage: "/images/project/portfolio/1.png",
        images: [
          "/images/project/portfolio/2.png",
          "/images/project/portfolio/3.png",
        ],
        media: [
          { type: "image", src: "/images/project/portfolio/1.png" },
          { type: "image", src: "/images/project/portfolio/2.png" },
          { type: "image", src: "/images/project/portfolio/3.png" },
        ],
        year: "2025",
        role: "Designer & Full-Stack Developer",
        liveUrl: "https://pasin.dev",
        githubUrl: "https://github.com/",
        highlights: [
          "Dark / light mode พร้อมระบบเว็บไซต์ที่ลื่นไหล",
          "แสดงผลงานในรูปแบบ Bento Grid พร้อมแอนิเมชันสลับอัตโนมัติ",
          "การเลื่อนหน้าเว็บแบบ Smooth Scroll ด้วย Lenis พร้อมระบบนำทางตามแต่ละ Section",
          "รองรับการใช้งานทั้งบนมือถือ แท็บเล็ต และเดสก์ท็อป",
        ],
        tags: [
          "Figma",
          "React",
          "Vite",
          "TypeScript",
          "Tailwind CSS",
          "Framer Motion",
        ],
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  SQL DDL — สร้างตารางถ้ายังไม่มี (ใช้ rpc exec_sql หรือรันใน Supabase SQL Editor)
// ═══════════════════════════════════════════════════════════════════════

const DDL = `
-- ── categories ────────────────────────────────────────────────────────
create table if not exists categories (
  id          text        primary key,
  category    text        not null,
  icon        text        not null default '📁',
  "order"     integer     not null default 0,
  created_at  timestamptz not null default now()
);

-- ── projects ──────────────────────────────────────────────────────────
create table if not exists projects (
  id            text        primary key default gen_random_uuid()::text,
  category_id   text        not null references categories(id) on delete cascade,
  category      text        not null,
  title         text        not null,
  tagline       text        not null default '',
  description   text        not null default '',
  cover_image   text        not null default '',
  media         jsonb       not null default '[]'::jsonb,
  images        text[]      not null default '{}',
  year          text        not null default '',
  role          text        not null default '',
  live_url      text,
  github_url    text,
  highlights    text[]      not null default '{}',
  tags          text[]      not null default '{}',
  "order"       integer     not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── RLS: allow public read ─────────────────────────────────────────────
alter table categories enable row level security;
alter table projects    enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'categories' and policyname = 'public_read_categories'
  ) then
    create policy public_read_categories on categories for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies
    where tablename = 'projects' and policyname = 'public_read_projects'
  ) then
    create policy public_read_projects on projects for select using (true);
  end if;
end $$;
`;

// ═══════════════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════════════

function log(symbol, msg) {
  console.log(`${symbol}  ${msg}`);
}

function logRow(label, value) {
  const short =
    typeof value === "string"
      ? value.slice(0, 60)
      : JSON.stringify(value).slice(0, 60);
  console.log(`     ${label.padEnd(14)} ${short}`);
}

// ═══════════════════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════════════════

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║          Supabase Migration — projects data          ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  log("🔗", `URL: ${SUPABASE_URL}`);
  log("🔑", `Key: ${SUPABASE_KEY.slice(0, 20)}…`);
  console.log();

  // ── แสดง DDL hint ──
  console.log("📋  DDL hint (รันใน Supabase SQL Editor ก่อนถ้ายังไม่มีตาราง):");
  console.log("─".repeat(58));
  console.log(DDL.trim());
  console.log("─".repeat(58));
  console.log();

  if (DRY_RUN) {
    log("🔍", "DRY-RUN: แสดงข้อมูลที่จะ upsert\n");
  }

  let totalCats = 0;
  let totalProjs = 0;
  let errors = 0;

  for (const [catIndex, cat] of projectCategories.entries()) {
    const catRow = {
      id: cat.id,
      category: cat.category,
      icon: cat.icon,
      order: catIndex,
    };

    log("📁", `[Cat ${catIndex + 1}] ${cat.category} (${cat.id})`);

    if (!DRY_RUN) {
      const { error: catErr } = await supabase
        .from("categories")
        .upsert(catRow, { onConflict: "id" });

      if (catErr) {
        log("❌", `Category error: ${catErr.message}`);
        errors++;
        continue;
      }
    }
    totalCats++;

    for (const [itemIndex, item] of cat.items.entries()) {
      const order = catIndex * 100 + itemIndex;
      const projRow = {
        id: item.id,
        category_id: cat.id,
        category: cat.category,
        title: item.title,
        tagline: item.tagline,
        description: item.description,
        cover_image: item.coverImage,
        media: item.media ?? [],
        images: item.images ?? [],
        year: item.year,
        role: item.role,
        live_url: item.liveUrl ?? null,
        github_url: item.githubUrl ?? null,
        highlights: item.highlights ?? [],
        tags: item.tags ?? [],
        order,
      };

      log("   📄", `[${order}] ${item.title}`);
      logRow("id:", item.id);
      logRow("media items:", `${(item.media ?? []).length} items`);
      logRow("tags:", item.tags?.join(", ") ?? "");

      if (!DRY_RUN) {
        const { error: projErr } = await supabase
          .from("projects")
          .upsert(projRow, { onConflict: "id" });

        if (projErr) {
          log("   ❌", `Project error: ${projErr.message}`);
          errors++;
          continue;
        }
      }
      totalProjs++;
    }

    console.log();
  }

  // ── Summary ──
  console.log("═".repeat(58));
  if (DRY_RUN) {
    log(
      "🔍",
      `DRY-RUN complete — ${totalCats} categories, ${totalProjs} projects`,
    );
  } else if (errors === 0) {
    log(
      "✅",
      `Migration สำเร็จ! ${totalCats} categories, ${totalProjs} projects`,
    );
  } else {
    log("⚠️ ", `เสร็จแล้วแต่มี ${errors} error — ตรวจสอบ log ด้านบน`);
  }
  console.log("═".repeat(58) + "\n");
}

main().catch((err) => {
  console.error("\n❌  Unexpected error:", err);
  process.exit(1);
});
