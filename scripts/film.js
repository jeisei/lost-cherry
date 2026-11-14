const FIRST_FRAME_TIMEOUT = 2000;
const AUTOPLAY_THRESHOLD = 0.2;
const WORDMARK_FADE_START = 0.62;

export function initFilm(hero, motion) {
  const video = hero.querySelector("[data-film]");
  const replay = hero.querySelector("[data-film-replay]");
  const origin = document.getElementById("origin");
  const connection = navigator.connection;
  let visibleRatio = 0;
  let state = "waiting";
  let pendingPlay;
  let autoplayBlocked = false;
  let resolveReady;
  const ready = new Promise((resolve) => { resolveReady = resolve; });

  const usePoster = () => motion.matches || connection?.saveData === true;

  function updateWordmark() {
    const showBrand = state === "playing" && visibleRatio > WORDMARK_FADE_START;
    hero.classList.toggle("hero--show-brand", showBrand);
    origin.classList.toggle("origin--wordmark-pending", showBrand);
  }

  function setState(next) {
    state = next;
    hero.classList.toggle("hero--playing", next === "playing");
    replay.hidden = next !== "ended" || usePoster();
    updateWordmark();
    if (next !== "waiting") resolveReady();
  }

  function loadSource() {
    if (video.hasAttribute("src")) return;
    video.src = video.dataset.src;
    video.muted = true;
  }

  function syncPlayback() {
    if (usePoster() || document.hidden || visibleRatio < AUTOPLAY_THRESHOLD) {
      if (!video.paused || pendingPlay) video.pause();
      if (usePoster() && state !== "ended") setState("poster");
      if (usePoster() && state === "ended") replay.hidden = true;
      return;
    }

    if (state === "ended") {
      replay.hidden = false;
      return;
    }
    if (autoplayBlocked || pendingPlay || !video.paused) return;

    loadSource();
    pendingPlay = video.play()
      .catch((error) => {
        if (error.name === "AbortError") return;
        autoplayBlocked = true;
        setState("poster");
      })
      .finally(() => {
        pendingPlay = undefined;
        if (video.paused && !autoplayBlocked && video.readyState > 0 &&
          visibleRatio >= AUTOPLAY_THRESHOLD && !usePoster() && !document.hidden && state !== "ended") {
          syncPlayback();
        }
      });
  }

  video.addEventListener("playing", () => setState("playing"));
  video.addEventListener("waiting", () => {
    if (state === "playing" && !video.paused) setState("poster");
  });
  video.addEventListener("ended", () => setState("ended"));
  video.addEventListener("error", () => {
    autoplayBlocked = true;
    setState("poster");
  });

  replay.addEventListener("click", () => {
    if (state !== "ended") return;
    if (document.activeElement === replay) hero.querySelector("h1").focus({ preventScroll: true });
    video.currentTime = 0;
    setState("poster");
    syncPlayback();
  });

  const observer = new IntersectionObserver(([entry]) => {
    visibleRatio = entry.intersectionRatio;
    updateWordmark();
    syncPlayback();
  }, { threshold: [0, AUTOPLAY_THRESHOLD, WORDMARK_FADE_START, 1] });

  observer.observe(hero);
  document.addEventListener("visibilitychange", syncPlayback);
  motion.addEventListener("change", syncPlayback);
  connection?.addEventListener("change", syncPlayback);

  if (usePoster()) setState("poster");
  return { ready };
}

export async function revealHero(loader, hero, filmReady, motion) {
  if (!loader.classList.contains("loader--visible")) return;

  const poster = hero.querySelector(".hero__poster");
  const timeout = new Promise((resolve) => setTimeout(resolve, FIRST_FRAME_TIMEOUT));
  await Promise.race([Promise.all([poster.decode().catch(() => {}), filmReady]), timeout]);

  if (!motion.matches && !location.hash && scrollY < hero.offsetHeight / 2) {
    hero.classList.add("hero--intro");
  }
  loader.classList.remove("loader--visible");
}
