import { ArrowUp } from "lucide-react";
import { motion } from "framer-motion";

interface FooterProps {
  onNavigate: (id: string) => void;
  isDark: boolean;
}

/* ── Inline SVG brand icons (lucide ไม่มี brand icons) ── */
const IconGitHub = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

const IconInstagram = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);

const IconMail = ({ size = 15 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const navLinks = [
  { label: "Home", id: "home" },
  { label: "About", id: "about" },
  { label: "Projects", id: "projects" },
  { label: "Contact", id: "contact" },
];

const socials = [
  { label: "GitHub", href: "https://github.com/A1enny", Icon: IconGitHub },
  {
    label: "Instagram",
    href: "https://www.instagram.com/_nvmine/",
    Icon: IconInstagram,
  },
  { label: "Email", href: "mailto:pasin.sp@gmail.com", Icon: IconMail },
];

function Footer({ onNavigate, isDark }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const year = new Date().getFullYear();

  return (
    <footer
      className={`relative border-t ${
        isDark
          ? "border-white/8 bg-[#090909] text-white"
          : "border-neutral-200 bg-neutral-50 text-neutral-900"
      }`}
    >
      {/* TOP SECTION */}
      <div className="mx-auto max-w-7xl px-8 md:px-16 py-16">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-12">
          {/* LEFT — BRAND */}
          <div className="max-w-xs">
            <button
              onClick={() => onNavigate("home")}
              className={`text-2xl font-bold tracking-tight mb-4 block transition-opacity hover:opacity-70 duration-200 ${
                isDark ? "text-white" : "text-neutral-900"
              }`}
            >
              Pasin.
            </button>
            <p
              className={`text-sm leading-relaxed ${isDark ? "text-white/45" : "text-neutral-500"}`}
            >
              Full-Stack Developer & Visual Designer based in Nonthaburi,
              Thailand. Crafting digital experiences that matter.
            </p>

            {/* SOCIAL ICONS */}
            <div className="mt-6 flex items-center gap-3">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`
                    flex h-9 w-9 items-center justify-center rounded-full border
                    transition-all duration-200 hover:scale-105 active:scale-95
                    ${
                      isDark
                        ? "border-white/10 bg-white/5 text-white/60 hover:bg-white/12 hover:text-white"
                        : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:text-neutral-900 shadow-sm"
                    }
                  `}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* CENTER — NAV LINKS */}
          <div>
            <p
              className={`text-[10px] font-semibold tracking-[0.15em] uppercase mb-5 ${
                isDark ? "text-white/30" : "text-neutral-400"
              }`}
            >
              Navigation
            </p>
            <ul className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => onNavigate(link.id)}
                    className={`text-sm transition-colors duration-200 ${
                      isDark
                        ? "text-white/50 hover:text-white"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT — CONTACT CTA */}
          <div>
            <p
              className={`text-[10px] font-semibold tracking-[0.15em] uppercase mb-5 ${
                isDark ? "text-white/30" : "text-neutral-400"
              }`}
            >
              Get In Touch
            </p>
            <a
              href="mailto:pasin.sp@gmail.com"
              className={`text-sm block mb-2 transition-colors duration-200 ${
                isDark
                  ? "text-white/50 hover:text-white"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              pasin.sp@gmail.com
            </a>
            <a
              href="tel:0657317994"
              className={`text-sm block transition-colors duration-200 ${
                isDark
                  ? "text-white/50 hover:text-white"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              065 - 731 - 7994
            </a>

            {/* STATUS */}
            <div
              className={`mt-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs border ${
                isDark
                  ? "border-green-500/20 bg-green-500/8 text-green-400"
                  : "border-green-200 bg-green-50 text-green-700"
              }`}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
              </span>
              Available for work
            </div>
          </div>
        </div>
      </div>

      {/* DIVIDER */}
      <div
        className={`mx-8 md:mx-16 h-px ${isDark ? "bg-white/6" : "bg-neutral-200"}`}
      />

      {/* BOTTOM BAR */}
      <div className="mx-auto max-w-7xl px-8 md:px-16 py-5 flex items-center justify-between">
        <p
          className={`text-xs ${isDark ? "text-white/25" : "text-neutral-400"}`}
        >
          © {year} Pasin Promsopa. All rights reserved.
        </p>

        {/* BACK TO TOP */}
        <motion.button
          onClick={scrollToTop}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.94 }}
          transition={{ duration: 0.15 }}
          className={`
            flex items-center gap-2 text-xs transition-colors duration-200
            ${isDark ? "text-white/35 hover:text-white" : "text-neutral-400 hover:text-neutral-900"}
          `}
        >
          Back to top
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full border transition-colors duration-200 ${
              isDark
                ? "border-white/10 bg-white/5 hover:bg-white/12"
                : "border-neutral-200 bg-white hover:bg-neutral-100 shadow-sm"
            }`}
          >
            <ArrowUp size={12} />
          </span>
        </motion.button>
      </div>
    </footer>
  );
}

export default Footer;
