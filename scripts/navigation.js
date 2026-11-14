export function initNavigation(nav, scenes, goTo) {
  const links = [...nav.querySelectorAll("a")];
  const sceneByHash = new Map(scenes.map((scene) => [`#${scene.id}`, scene]));
  let current = nav.querySelector("[aria-current]");
  let pendingUpdate;

  function updateCurrent() {
    pendingUpdate = undefined;
    const midpoint = innerHeight / 2;
    const visible = scenes.find((scene) => scene.getBoundingClientRect().bottom > midpoint);
    const hash = `#${visible?.id ?? scenes.at(-1).id}`;
    const link = links.find((item) => item.hash === hash);
    if (link === current) return;
    current?.removeAttribute("aria-current");
    link.setAttribute("aria-current", "location");
    current = link;
  }

  function scheduleUpdate() {
    pendingUpdate ??= requestAnimationFrame(updateCurrent);
  }

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  scheduleUpdate();

  function moveTo(target) {
    const focusTarget = target.querySelector("h1") ?? target;
    focusTarget.focus({ preventScroll: true });
    goTo(target);
  }

  window.addEventListener("popstate", () => {
    // Let the browser restore its saved position before aligning to the URL.
    requestAnimationFrame(() => {
      const target = sceneByHash.get(location.hash);
      if (target) moveTo(target);
    });
  });

  for (const link of [...links, ...document.querySelectorAll("[data-back-to-film]")]) {
    link.addEventListener("click", (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = sceneByHash.get(link.hash);
      if (!target) return;
      event.preventDefault();
      if (location.hash !== link.hash) history.pushState(null, "", link.hash);

      moveTo(target);
    });
  }
}
