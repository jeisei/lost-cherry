const ENTER_RATIO = 0.24;
const PREPARE_DISTANCE = "45% 0px";

export function initScenes(scenes, motion, onEnter) {
  const pending = new Set(scenes);

  function reveal(scene, animate) {
    if (!pending.delete(scene)) return;
    prepareObserver.unobserve(scene);
    enterObserver.unobserve(scene);
    scene.classList.remove("scene--awaiting");
    scene.classList.toggle("scene--entering", animate);
    onEnter(scene, animate);
  }

  const prepareObserver = new IntersectionObserver((entries) => {
    if (motion.matches) return;
    for (const { target, isIntersecting } of entries) {
      if (isIntersecting && target.getBoundingClientRect().top > innerHeight * 0.9) {
        target.classList.add("scene--awaiting");
      }
    }
  }, { rootMargin: PREPARE_DISTANCE });

  const enterObserver = new IntersectionObserver((entries) => {
    for (const { target, boundingClientRect, intersectionRatio } of entries) {
      if (boundingClientRect.bottom <= 0) {
        reveal(target, false);
      } else if (intersectionRatio >= ENTER_RATIO) {
        const animate = !motion.matches && location.hash !== `#${target.id}`;
        reveal(target, animate);
      }
    }
  }, { threshold: [0, ENTER_RATIO] });

  for (const scene of pending) {
    prepareObserver.observe(scene);
    enterObserver.observe(scene);
    scene.addEventListener("focusin", () => reveal(scene, false));
  }

  motion.addEventListener("change", () => {
    if (!motion.matches) return;
    for (const scene of pending) scene.classList.remove("scene--awaiting");
  });
}
