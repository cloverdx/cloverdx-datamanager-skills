// What: inject a custom button into the stable header mount.
// Verify this internal placement selector against the target Data Manager version.

const BUTTON_ID = "dmc-header-button";
const HEADER_ACTIONS_SELECTOR = ".page__header";

const buildButton = (ctx) => {
  const button = document.createElement("button");
  button.id = BUTTON_ID;
  button.type = "button";
  button.className =
    "dmc-header-button clover__btn clover__btn--secondary clover__btn--large";
  button.textContent = "Help";
  button.addEventListener("click", () => {
    ctx.notifications.showInfo("Help clicked");
  });
  return button;
};

const addButton = (ctx) => {
  const { header } = ctx.elements;
  if (!header) return;

  if (header.querySelector(`#${BUTTON_ID}`)) return;

  const actions = header.querySelector(HEADER_ACTIONS_SELECTOR) || header;
  const button = buildButton(ctx);
  actions.appendChild(button);
  ctx.registerCleanup(() => button.remove());
};

window.dmCustomization = {
  apiVersion: 1,
  pages: {
    transactional: { list: { pageRendered: addButton } },
  },
};

// Why this shape: the dmc-* class marks customization-owned UI. The native
// classes keep the button aligned with Data Manager's header actions.
