/* ================================================================== */
/*  src/data/projects.ts                                              */
/* ================================================================== */

/** A single media item — either image or YouTube video */
export type MediaItem =
  | { type: "image"; src: string }
  | { type: "youtube"; videoId: string };

export interface ProjectItem {
  id: string; // unique slug
  title: string;
  tagline: string;
  description: string;
  coverImage: string;

  /** NEW: รองรับทั้ง image + youtube */
  media: MediaItem[];

  /** backward compatibility */
  images: string[];

  year: string;
  role: string;
  liveUrl?: string;
  githubUrl?: string;
  highlights: string[];
  tags: string[];
}

export interface ProjectCategory {
  id: string; // category slug e.g. "web-design"
  category: string; // display name e.g. "Web · UI/UX"
  icon: string; // emoji icon
  items: ProjectItem[];
}

/** Flat project type (backward-compat for detail page) */
export interface Project extends ProjectItem {
  category: string;
  categoryId: string;
}

export function toYouTubeId(urlOrId: string): string {
  try {
    const u = new URL(urlOrId);

    // youtu.be/VIDEO_ID
    if (u.hostname === "youtu.be") {
      return u.pathname.slice(1).split("?")[0];
    }

    // youtube.com/watch?v=VIDEO_ID
    const v = u.searchParams.get("v");
    if (v) return v;

    const segments = u.pathname.split("/").filter(Boolean);

    // youtube.com/embed/VIDEO_ID
    const embedIndex = segments.indexOf("embed");
    if (embedIndex !== -1) {
      return segments[embedIndex + 1];
    }

    // youtube.com/shorts/VIDEO_ID
    const shortsIndex = segments.indexOf("shorts");
    if (shortsIndex !== -1) {
      return segments[shortsIndex + 1];
    }
  } catch {
    // fallback -> assume raw id
  }

  return urlOrId;
}

/** NEW: helper สำหรับ thumbnail youtube */
export function youtubeThumbnail(
  videoId: string,
  quality: "default" | "hqdefault" | "maxresdefault" = "hqdefault",
): string {
  return `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`;
}

/** NEW: helper รวม media image ทั้งหมด */
export function getProjectImages(project: ProjectItem): string[] {
  if (project.media?.length) {
    return project.media
      .filter((item) => item.type === "image")
      .map((item) => item.src);
  }

  return project.images || [];
}

/** NEW: helper เช็คว่ามี video */
export function hasVideo(project: ProjectItem): boolean {
  return project.media?.some((item) => item.type === "youtube") ?? false;
}

/** NEW: helper ดึง youtube videos */
export function getProjectVideos(project: ProjectItem): string[] {
  return (
    project.media
      ?.filter((item) => item.type === "youtube")
      .map((item) => item.videoId) || []
  );
}

/* ── CATEGORIES ─────────────────────────────────────────────────── */

export const projectCategories: ProjectCategory[] = [
  {
    id: "portfolio-design",
    category: "UI/UX Design",
    icon: "🌐",
    items: [
      {
        id: "webpage-design-portfolio",
        title: "Portfolio Website",
        tagline: "Personal portfolio with bento grid & smooth scroll",
        description:
          "พอร์ตโฟลิโอนี้ ออกแบบและสร้างขึ้นใหม่ตั้งแต่เริ่มต้น เพื่อนำเสนองานในด้านการพัฒนาเว็บ การออกแบบกราฟิก และการผลิตวิดีโอ มุ่งเน้นไปที่ประสิทธิภาพ การ Transition ที่ลื่นไหล และมี style ที่เป็นเอกลักษณ์",

        coverImage: "/images/project/portfolio/1.png",

        /** backward compatibility */
        images: [
          "/images/project/portfolio/2.png",
          "/images/project/portfolio/3.png",
        ],

        /** NEW */
        media: [
          {
            type: "image",
            src: "/images/project/portfolio/1.png",
          },
          {
            type: "image",
            src: "/images/project/portfolio/2.png",
          },
          {
            type: "image",
            src: "/images/project/portfolio/3.png",
          },
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

      {
        id: "webpage-design-landing",
        title: "Landing Pages",
        tagline: "Modern responsive landing pages with clean interactions",

        description:
          "ผลงานนี้เป็นส่วนหนึ่งของการฝึกงานที่ iBusiness Corporation Co., Ltd. ในตำแหน่ง UX/UI Designer โดยได้รับมอบหมายให้ออกแบบหน้าเว็บไซต์สำหรับองค์กรและโรงพยาบาลต่าง ๆ\nซึ่งเปิดโอกาสให้สามารถนำเสนอแนวคิดและสไตล์การออกแบบได้อย่างอิสระ ภายใต้เงื่อนไขของ TOR และ User Requirement ของแต่ละโปรเจกต์\n\nแนวทางการออกแบบมุ่งเน้นการสร้าง Landing Page ที่ทันสมัย รองรับการแสดงผลแบบ Responsive พร้อมให้ความสำคัญกับประสบการณ์ผู้ใช้ (User Experience) ผ่านการจัดวางองค์ประกอบที่สะอาดตา การใช้งานที่ลื่นไหล และการเลือกใช้ Typography อย่างเหมาะสม เพื่อสร้างสมดุลระหว่างความสวยงามและการใช้งานจริงของเว็บไซต์",

        coverImage: "/images/project/landing/1.png",

        images: [
          "/images/project/landing/2.png",
          "/images/project/landing/3.png",
        ],

        /** NEW */
        media: [
          {
            type: "image",
            src: "/images/project/landing/1.png",
          },
          {
            type: "image",
            src: "/images/project/landing/2.png",
          },
          {
            type: "image",
            src: "/images/project/landing/3.png",
          },
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
          "ผลงานนี้เป็นส่วนหนึ่งของการฝึกงานที่ iBusiness Corporation Co., Ltd. ในตำแหน่ง UX/UI Designer โดยได้รับมอบหมายให้ออกแบบหน้าหลัก (Home Screen) และหน้า Notification ของแอปพลิเคชัน DITP ONE โดยมีส่วนร่วมตั้งแต่การวางโครงสร้างหน้าจอ (Layout), การจัดลำดับข้อมูล (Information Hierarchy) ไปจนถึงการออกแบบ UI ให้สอดคล้องกับภาพลักษณ์ขององค์กรและประสบการณ์การใช้งานของผู้ใช้\n\nกระบวนการออกแบบมุ่งเน้นความเรียบง่าย ใช้งานได้จริง และเข้าถึงข้อมูลได้อย่างรวดเร็ว พร้อมทั้งปรับปรุงรูปแบบการแสดงผลของ Notification ให้มีความชัดเจน อ่านง่าย และช่วยให้ผู้ใช้งานสามารถแยกประเภทข้อมูลสำคัญได้สะดวกมากยิ่งขึ้น นอกจากนี้ยังมีการออกแบบและเปรียบเทียบหลายแนวทางผ่าน Figma เพื่อหาแนวทางที่เหมาะสมที่สุดทั้งในด้าน Visual Design และ User Experience ก่อนนำไปพัฒนาต่อจริงบนแอปพลิเคชัน",

        coverImage: "/images/project/appmb/2.png",

        images: [
          "/images/project/appmb/1.png",
          "/images/project/appmb/3.png",
          "/images/project/appmb/4.png",
        ],

        /** NEW */
        media: [
          {
            type: "image",
            src: "/images/project/appmb/1.png",
          },
          {
            type: "image",
            src: "/images/project/appmb/2.png",
          },
          {
            type: "image",
            src: "/images/project/appmb/3.png",
          },
          {
            type: "image",
            src: "/images/project/appmb/4.png",
          },
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
        id: "graphic-design-print",
        title: "Facebook Banners",
        tagline: "Seasonal campaign banners for brands and special occasions",

        description:
          "ผมได้รับมอบหมายให้ออกแบบแบนเนอร์สำหรับเทศกาลและแคมเปญประชาสัมพันธ์ต่างๆ สำหรับเพจ Facebook ของบริษัท iBusiness Corporation Co., Ltd. ในช่วงที่ผมกำลังฝึกงาน",

        coverImage: "/images/project/banner/1.jpg",

        images: [
          "/images/project/banner/2.png",
          "/images/project/banner/3.jpg",
          "/images/project/banner/4.png",
          "/images/project/banner/5.jpg",
          "/images/project/banner/6.png",
        ],

        /** NEW */
        media: [
          {
            type: "image",
            src: "/images/project/banner/1.jpg",
          },
          {
            type: "image",
            src: "/images/project/banner/2.png",
          },
          {
            type: "image",
            src: "/images/project/banner/3.jpg",
          },
          {
            type: "image",
            src: "/images/project/banner/4.png",
          },
          {
            type: "image",
            src: "/images/project/banner/5.jpg",
          },
          {
            type: "image",
            src: "/images/project/banner/6.png",
          },
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
    category: "Vedio Editing",
    icon: "🎬",
    items: [
      {
        id: "video-editing-social",
        title: "Youtube channel",

        tagline:
          "Personal YouTube content created for fun, creativity, and editing practice",

        description: ` ช่อง YouTube นี้เป็นโปรเจกต์ส่วนตัวที่สร้างขึ้นเพื่อฝึกฝนและพัฒนาทักษะด้านการตัดต่อวิดีโอ การเล่าเรื่อง และการสร้างสรรค์คอนเทนต์ในเวลาว่าง โดยเนื้อหาส่วนใหญ่จะเน้นไปที่การทดลองสไตล์การตัดต่อ การจัดจังหวะของวิดีโอ (Pacing) การเลือกใช้เพลง และการสร้างอารมณ์ผ่านภาพและเสียง
        \nภายในโปรเจกต์มีการลงมือทำตั้งแต่การวางคอนเซปต์ คิดรูปแบบวิดีโอ ตัดต่อ ออกแบบ Thumbnail ไปจนถึงการเผยแพร่ผลงานจริงบน YouTube ซึ่งช่วยพัฒนาทักษะทั้งในด้าน Creative Design, Video Editing และ Storytelling ผ่านการสร้างผลงานอย่างต่อเนื่อง`,

        coverImage: "/images/project/youtube/1.png",

        images: [],

        media: [
          {
            type: "image",
            src: "/images/project/youtube/1.png",
          },
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
    ],
  },

  {
    id: "coding",
    category: "Coding",
    icon: "💻",
    items: [
      {
        id: "coding-fullstack",
        title: "Mawmong POS WEB-APP",
        tagline: "Full-stack applications built for performance and scale",

        description: `
        โปรเจกต์นี้เป็นระบบจัดการร้านอาหารสำหรับร้านอาหารญี่ปุ่น “แมวมอง” ซึ่งพัฒนาขึ้นในฐานะโปรเจกต์จบการศึกษาระดับชั้นปีที่ 4 โดยมีการลงพื้นที่เพื่อเก็บ Requirement จริงจากเจ้าของร้าน เพื่อนำมาวิเคราะห์และออกแบบระบบให้ตอบโจทย์การใช้งานภายในร้านอาหารมากที่สุด
        \nภายในโปรเจกต์มีส่วนร่วมทั้งในด้าน UX/UI Design และการพัฒนาเว็บไซต์แบบ Full-Stack \nตั้งแต่การออกแบบโครงสร้างระบบ การออกแบบหน้าตา Interface ไปจนถึงการพัฒนาระบบจริงด้วย Vite + React สำหรับ Frontend และ Node.js ร่วมกับ phpMyAdmin สำหรับ Backend และการจัดการฐานข้อมูล
        \nแนวทางการออกแบบมุ่งเน้นให้ระบบใช้งานง่าย ลดขั้นตอนการทำงานภายในร้าน และช่วยให้เจ้าของร้านสามารถจัดการข้อมูลต่าง ๆ ได้สะดวกและมีประสิทธิภาพมากยิ่งขึ้น`,

        coverImage: "/images/project/maw/1.png",

        images: [
          "/images/project/maw/2.png",
          "/images/project/maw/3.png",
          "/images/project/maw/4.png",
          "/images/project/maw/6.png",
          "/images/project/maw/7.png",
        ],

        /** NEW */
        media: [
          {
            type: "image",
            src: "/images/project/maw/1.png",
          },
          {
            type: "image",
            src: "/images/project/maw/2.png",
          },
          {
            type: "image",
            src: "/images/project/maw/3.png",
          },
          {
            type: "image",
            src: "/images/project/maw/4.png",
          },
          {
            type: "image",
            src: "/images/project/maw/6.png",
          },
          {
            type: "image",
            src: "/images/project/maw/7.png",
          },
        ],

        year: "2024",
        role: "Full-Stack Developer",

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

        githubUrl: "https://github.com/",
      },
      {
        id: "coding-portfolio",
        title: "Portfolio Website",
        tagline: "Personal portfolio with bento grid & smooth scroll",
        description:
          "พอร์ตโฟลิโอนี้ ออกแบบและสร้างขึ้นใหม่ตั้งแต่เริ่มต้น เพื่อนำเสนองานในด้านการพัฒนาเว็บ การออกแบบกราฟิก และการผลิตวิดีโอ มุ่งเน้นไปที่ประสิทธิภาพ การ Transition ที่ลื่นไหล และมี style ที่เป็นเอกลักษณ์",

        coverImage: "/images/project/portfolio/1.png",

        /** backward compatibility */
        images: [
          "/images/project/portfolio/2.png",
          "/images/project/portfolio/3.png",
        ],

        /** NEW */
        media: [
          {
            type: "image",
            src: "/images/project/portfolio/1.png",
          },
          {
            type: "image",
            src: "/images/project/portfolio/2.png",
          },
          {
            type: "image",
            src: "/images/project/portfolio/3.png",
          },
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

/* ── FLAT LIST (backward-compat) ──────────────────────────────────── */

export const projects: Project[] = projectCategories.flatMap((cat) =>
  cat.items.map((item) => ({
    ...item,
    category: cat.category,
    categoryId: cat.id,
  })),
);
