const DROP_MEDIA = new URL("../assets/images/", import.meta.url);
const ENTER_RATIO = 0.45;
const EXIT_RATIO = 0.12;

export function initDrop(art, motion) {
  const cleanPlate = art.querySelector("[data-essence-clean]");
  const cleanSource = cleanPlate.querySelector("source");
  const clean = cleanPlate.querySelector("img");
  const drop = art.querySelector("[data-essence-drop]");
  const hanging = drop.querySelector("[data-drop-hanging]");
  const detached = drop.querySelector("[data-drop-detached]");
  const compact = matchMedia("(max-width: 700px)");
  const touch = matchMedia("(pointer: coarse)");
  let inView = false;
  let activeVisit;
  let hasPlayed = false;

  function cancelAnimations() {
    for (const animation of drop.getAnimations({ subtree: true })) animation.cancel();
  }

  function reset() {
    activeVisit = undefined;
    cancelAnimations();
    cleanPlate.hidden = true;
    drop.hidden = true;
    hanging.hidden = false;
    detached.hidden = true;
  }

  async function play(visit) {
    if (!clean.hasAttribute("src")) {
      cleanSource.srcset = cleanSource.dataset.srcset;
      clean.srcset = clean.dataset.srcset;
      clean.src = clean.dataset.src;
      hanging.src = new URL("drop-hanging.webp", DROP_MEDIA);
      detached.src = new URL("drop-detached.webp", DROP_MEDIA);
    }

    try {
      await Promise.all([
        clean.decode(), hanging.decode(), detached.decode(),
        new Promise((resolve) => setTimeout(resolve, 640)),
      ]);
      if (activeVisit !== visit) return;

      cleanPlate.hidden = false;
      drop.hidden = false;
      hasPlayed = true;
      const stretched = "scale(.76, 1.14)";
      const stretch = drop.animate([
        { transform: "scale(1)" },
        { transform: "scale(.94, 1.035)", offset: .35 },
        { transform: stretched },
      ], { duration: 1120, easing: "cubic-bezier(.4, 0, .55, 1)", fill: "forwards" });
      await stretch.finished;
      if (activeVisit !== visit) return;

      detached.hidden = false;
      const release = { duration: 180, easing: "ease-in-out", fill: "both" };
      hanging.animate([{ opacity: 1 }, { opacity: 0 }], release);
      detached.animate([{ opacity: 0 }, { opacity: 1 }], release);

      const fall = drop.animate([
        { transform: stretched, opacity: 1 },
        { transform: "translateY(27%) scale(.87, 1.04)", opacity: 1, offset: .58 },
        { transform: "translateY(105%) scale(.9, 1.11)", opacity: 0 },
      ], { duration: compact.matches ? 990 : 1230, easing: "cubic-bezier(.45, 0, .84, .48)", fill: "both" });
      stretch.cancel();
      await fall.finished;
      if (activeVisit !== visit) return;

      drop.hidden = true;
      cancelAnimations();
    } catch {
      if (activeVisit !== visit) return;
      cleanPlate.hidden = true;
      drop.hidden = true;
      cancelAnimations();
    }
  }

  function sync() {
    if (!inView || motion.matches || document.hidden) {
      if (activeVisit) reset();
      return;
    }
    if (activeVisit || (touch.matches && hasPlayed)) return;

    activeVisit = Symbol();
    play(activeVisit);
  }

  const observer = new IntersectionObserver(([{ intersectionRatio }]) => {
    if (intersectionRatio >= ENTER_RATIO) inView = true;
    if (intersectionRatio <= EXIT_RATIO) inView = false;
    sync();
  }, { threshold: [EXIT_RATIO, ENTER_RATIO] });

  observer.observe(art);
  motion.addEventListener("change", sync);
  document.addEventListener("visibilitychange", sync);
}
