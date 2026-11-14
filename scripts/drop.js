const DROP_MEDIA = new URL("../assets/images/", import.meta.url);

export function initDrop(art, motion) {
  const clean = art.querySelector("[data-essence-clean]");
  const drop = art.querySelector("[data-essence-drop]");
  const hanging = drop.querySelector("[data-drop-hanging]");
  const detached = drop.querySelector("[data-drop-detached]");
  const compact = matchMedia("(max-width: 700px)");
  let played = false;
  let animation;

  function showStill() {
    animation?.cancel();
    clean.hidden = true;
    drop.hidden = true;
  }

  async function play() {
    if (played || motion.matches) return;
    played = true;

    clean.src = new URL("essence-clean.webp", DROP_MEDIA);
    hanging.src = new URL("drop-hanging.webp", DROP_MEDIA);
    detached.src = new URL("drop-detached.webp", DROP_MEDIA);

    try {
      await Promise.all([clean.decode(), hanging.decode(), detached.decode()]);
      await new Promise((resolve) => setTimeout(resolve, 620));
      const { top, bottom } = art.getBoundingClientRect();
      if (motion.matches || document.hidden || bottom < 0 || top > innerHeight) return;

      clean.hidden = false;
      drop.hidden = false;
      animation = drop.animate([
        { transform: "scale(1)" },
        { transform: "scale(.9, 1.08)" },
        { transform: "scale(.76, 1.16)" },
      ], { duration: 700, easing: "ease-in", fill: "forwards" });
      await animation.finished;

      hanging.hidden = true;
      detached.hidden = false;
      animation = drop.animate([
        { transform: "translateY(15%) scale(.8, 1.06)", opacity: 1 },
        { transform: "translateY(40%) scale(.89, 1.01)", opacity: 1, offset: .55 },
        { transform: "translateY(115%) scale(.89, 1.07)", opacity: 0 },
      ], { duration: compact.matches ? 540 : 790, easing: "cubic-bezier(.55, .02, .94, .54)", fill: "forwards" });
      await animation.finished;
      drop.hidden = true;
    } catch {
      showStill();
    }
  }

  motion.addEventListener("change", () => {
    if (motion.matches) showStill();
  });

  return { play };
}
