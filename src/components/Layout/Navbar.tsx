import { Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import Container from "../common/Container";
import { motion, AnimatePresence } from "framer-motion";

function Navbar({ active, onNavigate, onLogoClick }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [showPdf, setShowPdf] = useState(false);

  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });

  const navLinks = [
    { label: "About", id: "about" },
    { label: "Projects", id: "projects" },
    { label: "Contact", id: "contact" },
  ];

  /* ---------------- RESUME LOADING ---------------- */
  useEffect(() => {
    if (showResume) {
      const timer = setTimeout(() => {
        setShowPdf(true);
      }, 180);

      return () => clearTimeout(timer);
    } else {
      setShowPdf(false);
    }
  }, [showResume]);

  /* ---------------- SCROLL ---------------- */
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ---------------- THEME ---------------- */
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;

    root.classList.toggle("dark");

    const darkEnabled = root.classList.contains("dark");

    setIsDark(darkEnabled);

    localStorage.setItem("theme", darkEnabled ? "dark" : "light");
  };

  /* ---------------- LOCK BODY ---------------- */
  useEffect(() => {
    document.body.style.overflow = showResume ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showResume]);

  return (
    <>
      {/* HEADER */}
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? isDark
              ? "border-b border-white/10 bg-black/60 backdrop-blur-xl"
              : "border-b border-black/10 bg-white/70 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <Container>
          <div className="flex h-20 items-center justify-between">
            {/* LOGO */}
            <button
              onClick={onLogoClick}
              className={`text-lg font-semibold tracking-tight transition ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              Pasin.
            </button>

            {/* DESKTOP NAV */}
            <nav className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`text-sm transition-colors duration-300 ${
                    active === link.id
                      ? isDark
                        ? "text-white"
                        : "text-black"
                      : isDark
                        ? "text-white/60 hover:text-white"
                        : "text-black/60 hover:text-black"
                  }`}
                >
                  {link.label}
                </button>
              ))}

              {/* RESUME */}
              <button
                onClick={() => setShowResume(true)}
                className={`
                  rounded-full
                  px-5
                  py-2
                  text-sm
                  font-medium
                  transition-all
                  duration-300
                  hover:scale-105
                  ${
                    isDark
                      ? "bg-white text-black hover:bg-white/90"
                      : "bg-black text-white hover:bg-black/90"
                  }
                `}
              >
                Resume
              </button>

              {/* THEME */}
              <button
                onClick={toggleTheme}
                className={`
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  transition-all
                  duration-300
                  ${
                    isDark
                      ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                      : "border-black/10 bg-black/[0.04] text-black hover:bg-black/[0.08]"
                  }
                `}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </nav>

            {/* MOBILE BUTTON */}
            <button
              className={`transition md:hidden ${
                isDark ? "text-white" : "text-black"
              }`}
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </Container>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className={`border-t md:hidden ${
                isDark
                  ? "border-white/10 bg-black/95"
                  : "border-black/10 bg-white/95"
              }`}
            >
              <Container>
                <div className="flex flex-col gap-6 py-8">
                  {navLinks.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => {
                        onNavigate(link.id);
                        setIsOpen(false);
                      }}
                      className={`text-left text-lg transition ${
                        isDark
                          ? "text-white/70 hover:text-white"
                          : "text-black/70 hover:text-black"
                      }`}
                    >
                      {link.label}
                    </button>
                  ))}

                  {/* MOBILE RESUME */}
                  <button
                    onClick={() => {
                      setShowResume(true);
                      setIsOpen(false);
                    }}
                    className={`
                      mt-2
                      rounded-xl
                      px-5
                      py-3
                      text-left
                      font-medium
                      transition
                      ${isDark ? "bg-white text-black" : "bg-black text-white"}
                    `}
                  >
                    Resume
                  </button>
                </div>
              </Container>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* RESUME MODAL */}
      <AnimatePresence mode="wait">
        {showResume && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className={`fixed inset-0 z-[99999] flex items-center justify-center ${
              isDark ? "bg-black/70" : "bg-black/40 backdrop-blur-sm"
            }`}
          >
            {/* CLOSE */}
            <button
              onClick={() => setShowResume(false)}
              className={`
                absolute
                right-6
                top-6
                z-50
                rounded-full
                p-3
                backdrop-blur-md
                transition
                ${
                  isDark
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "bg-white text-black shadow-lg hover:bg-neutral-100"
                }
              `}
            >
              <X size={22} />
            </button>

            {/* MODAL */}
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 20,
              }}
              transition={{
                type: "spring",
                damping: 24,
                stiffness: 260,
              }}
              className={`
                relative
                h-[92vh]
                w-[92vw]
                max-w-6xl
                overflow-hidden
                rounded-2xl
                border
                shadow-2xl
                transform-gpu
                will-change-transform
                ${
                  isDark
                    ? "border-white/10 bg-[#111]"
                    : "border-black/10 bg-white"
                }
              `}
            >
              {/* LOADING */}
              {!showPdf && (
                <div
                  className={`flex h-full w-full items-center justify-center ${
                    isDark ? "bg-[#111]" : "bg-white"
                  }`}
                >
                  <div
                    className={`
                      h-12
                      w-12
                      animate-spin
                      rounded-full
                      border-2
                      ${
                        isDark
                          ? "border-white/20 border-t-white"
                          : "border-black/20 border-t-black"
                      }
                    `}
                  />
                </div>
              )}

              {/* PDF */}
              {showPdf && (
                <iframe
                  src="/resume/resume.pdf"
                  className={`h-full w-full ${
                    isDark ? "bg-[#111]" : "bg-white"
                  }`}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
