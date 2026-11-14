const ENTER_RATIO = 0.26;
const EXIT_RATIO = 0.08;
const ENTERING = "scene--entering";

export function initScenes(scenes, motion) {
  const touch = matchMedia("(pointer: coarse)");
  const observer = new IntersectionObserver((entries) => {
    for (const { target, intersectionRatio } of entries) {
      if (motion.matches || intersectionRatio <= EXIT_RATIO) {
        target.classList.remove(ENTERING);
      } else if (intersectionRatio >= ENTER_RATIO) {
        target.classList.add(ENTERING);
        if (touch.matches) observer.unobserve(target);
      }
    }
  }, { threshold: [EXIT_RATIO, ENTER_RATIO] });

  for (const scene of scenes) observer.observe(scene);
}
