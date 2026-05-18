import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface IntroScreenProps {
  onDone: () => void;
}

/**
 * IntroScreen
 * ─ Phase 1 (0–0.6s)  : bg fills, logo fades + scales in
 * ─ Phase 2 (0.6–1.4s): hold
 * ─ Phase 3 (1.4–2.0s): logo glides up-right toward navbar position, fades out
 * ─ Phase 4 (2.0s+)   : overlay fades to transparent, onDone fires → show site
 */
function IntroScreen({ onDone }: IntroScreenProps) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit" | "gone">(
    "enter",
  );

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 800);
    const t2 = setTimeout(() => setPhase("exit"), 1600);
    const t3 = setTimeout(() => {
      setPhase("gone");
      onDone();
    }, 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDone]);

  return (
    <AnimatePresence>
      {phase !== "gone" && (
        <motion.div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#0a0a0a] dark:bg-[#0a0a0a]"
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === "exit" ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Subtle radial glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(59,130,246,0.06),transparent)]" />

          <motion.span
            className="select-none font-semibold tracking-tight text-white"
            style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)" }}
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={
              phase === "enter" || phase === "hold"
                ? { opacity: 1, y: 0, scale: 1 }
                : {
                    // drift toward top-left (navbar logo position)
                    opacity: 0,
                    y: -40,
                    x: -20,
                    scale: 0.45,
                  }
            }
            transition={
              phase === "enter"
                ? { duration: 0.55, ease: [0.16, 1, 0.3, 1] }
                : phase === "exit"
                  ? { duration: 0.5, ease: [0.4, 0, 1, 1] }
                  : {}
            }
          >
            Pasin.
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default IntroScreen;
