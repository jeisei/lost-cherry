import { initCharacter } from "./character.js";
import { initDrop } from "./drop.js";
import { initFilm, revealHero } from "./film.js";
import { initNavigation } from "./navigation.js";
import { initScenes } from "./scenes.js";
import { initSectionScroll } from "./scroll.js";

const motion = matchMedia("(prefers-reduced-motion: reduce)");
const hero = document.querySelector(".hero");
const film = initFilm(hero, motion);

const heroReady = revealHero(document.querySelector("[data-loader]"), hero, film.ready);
heroReady.then(() => initScenes([hero], motion));
initCharacter(document.querySelector("[data-character]"));

initDrop(document.querySelector("[data-essence-art]"), motion);
const scenes = [...document.querySelectorAll("[data-reveal]")];
initScenes(scenes, motion);
const sections = [hero, ...scenes];
const goToSection = initSectionScroll(sections, motion);
initNavigation(document.querySelector(".site-nav"), sections, goToSection);
