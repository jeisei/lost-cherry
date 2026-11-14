export function initCharacter(character) {
  const buttons = Array.from(character.querySelectorAll(".character__button"));
  let selected = buttons.find((button) => button.getAttribute("aria-pressed") === "true");
  let preview;

  function render() {
    for (const button of buttons) {
      button.setAttribute("aria-pressed", String(button === selected));
      button.parentElement.classList.toggle("character__quality--active", button === (preview ?? selected));
    }
  }

  for (const button of buttons) {
    button.addEventListener("click", () => {
      selected = button;
      preview = undefined;
      render();
    });

    button.parentElement.addEventListener("pointerenter", (event) => {
      if (event.pointerType !== "mouse") return;
      preview = button;
      render();
    });

    button.parentElement.addEventListener("pointerleave", () => {
      if (preview !== button) return;
      preview = undefined;
      render();
    });
  }

  character.addEventListener("focusin", (event) => {
    if (!event.target.matches(":focus-visible") || !preview) return;
    preview = undefined;
    render();
  });
}
