import { useCallback, useEffect, useRef } from "react";

/**
 * useNavigation
 *
 * Wraps a simple history stack on top of React state.
 * ─ Mouse4 (button 3) → go back
 * ─ Mouse5 (button 4) → go forward
 * ─ Swipe right (≥60 px, < 30° vertical) → go back   (mobile)
 * ─ Swipe left                            → go forward (mobile)
 *
 * Usage:
 *   const { push, back, forward, canBack, canForward } = useNavigation(current, setCurrent);
 */

type Page = string | null; // null = main site, string = project id or "projects-hub"

interface UseNavigationReturn {
  push: (page: Page) => void;
  back: () => void;
  forward: () => void;
  canBack: boolean;
  canForward: boolean;
}

export function useNavigation(
  current: Page,
  setCurrent: (p: Page) => void,
): UseNavigationReturn {
  // history[cursor] === current visible page
  const history = useRef<Page[]>([current]);
  const cursor = useRef(0);

  // keep history in sync when external setCurrent is called via push
  const push = useCallback(
    (page: Page) => {
      // drop forward stack
      history.current = history.current.slice(0, cursor.current + 1);
      history.current.push(page);
      cursor.current = history.current.length - 1;
      setCurrent(page);
    },
    [setCurrent],
  );

  const back = useCallback(() => {
    if (cursor.current <= 0) return;
    cursor.current -= 1;
    setCurrent(history.current[cursor.current]);
  }, [setCurrent]);

  const forward = useCallback(() => {
    if (cursor.current >= history.current.length - 1) return;
    cursor.current += 1;
    setCurrent(history.current[cursor.current]);
  }, [setCurrent]);

  /* ── Mouse4 / Mouse5 ── */
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 3) {
        e.preventDefault();
        back();
      }
      if (e.button === 4) {
        e.preventDefault();
        forward();
      }
    };
    window.addEventListener("mousedown", onMouseDown);
    return () => window.removeEventListener("mousedown", onMouseDown);
  }, [back, forward]);

  /* ── Touch swipe ── */
  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      const isHorizontal = Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 2;
      if (!isHorizontal) return;
      if (dx > 0)
        back(); // swipe right → back
      else forward(); // swipe left  → forward
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [back, forward]);

  return {
    push,
    back,
    forward,
    canBack: cursor.current > 0,
    canForward: cursor.current < history.current.length - 1,
  };
}
