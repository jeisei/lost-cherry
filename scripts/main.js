import { initCharacter } from "./character.js";
import { initDrop } from "./drop.js";
import { initFilm, revealHero } from "./film.js";
import { initScenes } from "./scenes.js";

const motion = matchMedia("(prefers-reduced-motion: reduce)");
const hero = document.querySelector(".hero");
const film = initFilm(hero, motion);

revealHero(document.querySelector("[data-loader]"), hero, film.ready, motion);
initCharacter(document.querySelector("[data-character]"));

const drop = initDrop(document.querySelector("[data-essence-art]"), motion);
initScenes(document.querySelectorAll("[data-reveal]"), motion, (scene, animate) => {
  if (scene.id === "essence" && animate) drop.play();
});

const title = hero.querySelector("h1");
for (const link of document.querySelectorAll("[data-back-to-film]")) {
  link.addEventListener("click", (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    title.focus({ preventScroll: true });
    hero.scrollIntoView({ behavior: motion.matches ? "instant" : "smooth" });
  });
}
