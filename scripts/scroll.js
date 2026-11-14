const EDGE_TOLERANCE = 8;
const GESTURE_GAP_MS = 150;
const NAVIGATION_KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "]);

export function initSectionScroll(scenes, motion) {
  const finePointer = matchMedia("(pointer: fine)");
  const page = document.documentElement;
  let frame;
  let lastWheel = -Infinity;
  let lastDirection = 0;

  function stopGlide() {
    if (frame === undefined) return;
    cancelAnimationFrame(frame);
    frame = undefined;
    page.classList.remove("page--gliding");
  }

  function goTo(scene) {
    stopGlide();

    const start = scrollY;
    const maxScroll = Math.max(0, page.scrollHeight - innerHeight);
    const destination = Math.max(0, Math.min(scene.getBoundingClientRect().top + start, maxScroll));
    const distance = destination - start;
    if (motion.matches || Math.abs(distance) < 1) {
      window.scrollTo({ top: destination, behavior: "instant" });
      return;
    }

    const duration = Math.min(1200, 620 + 235 * Math.sqrt(Math.abs(distance) / innerHeight));
    const started = performance.now();
    page.classList.add("page--gliding");

    function advance(now) {
      const progress = Math.min(1, (now - started) / duration);
      // Quintic smoothstep keeps both acceleration and braking gentle.
      const eased = progress ** 3 * (progress * (6 * progress - 15) + 10);
      window.scrollTo({ top: start + distance * eased, behavior: "instant" });

      if (progress < 1) {
        frame = requestAnimationFrame(advance);
      } else {
        stopGlide();
      }
    }

    frame = requestAnimationFrame(advance);
  }

  window.addEventListener("wheel", (event) => {
    if (motion.matches || !finePointer.matches || event.defaultPrevented || !event.cancelable ||
      event.ctrlKey || event.metaKey || event.shiftKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

    const direction = Math.sign(event.deltaY);
    const now = performance.now();
    const sameGesture = direction === lastDirection && now - lastWheel < GESTURE_GAP_MS;

    if (frame !== undefined || sameGesture) {
      event.preventDefault();
      lastWheel = now;
      return;
    }

    const tops = scenes.map((scene) => scene.getBoundingClientRect().top + scrollY);
    const index = tops.findLastIndex((top) => top <= scrollY + EDGE_TOLERANCE);
    const nextTop = tops[index + direction];
    if (index < 0 || nextTop === undefined) return;

    const atTop = scrollY - tops[index] <= EDGE_TOLERANCE;
    const sceneFits = scenes[index].offsetHeight <= innerHeight + EDGE_TOLERANCE;
    const atBottom = nextTop - scrollY <= innerHeight + EDGE_TOLERANCE;
    if (direction < 0 ? !atTop : !sceneFits && !atBottom) return;

    event.preventDefault();
    lastDirection = direction;
    lastWheel = now;
    goTo(scenes[index + direction]);
  }, { passive: false });

  window.addEventListener("pointerdown", stopGlide, { passive: true });
  window.addEventListener("keydown", (event) => {
    if (NAVIGATION_KEYS.has(event.key)) stopGlide();
  });
  window.addEventListener("popstate", stopGlide);
  motion.addEventListener("change", stopGlide);

  return goTo;
}
