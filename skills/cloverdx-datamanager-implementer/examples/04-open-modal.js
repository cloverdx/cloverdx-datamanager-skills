// What: open a custom modal from a Data Manager header action.
// Verify this internal placement selector against the target Data Manager version.

const MODAL_TRIGGER_ID = "dmc-modal-trigger";
const HEADER_ACTIONS_SELECTOR = ".page__header";

const openModal = ({ title, bodyText }) => {
  const overlay = document.createElement("div");
  overlay.className = "dmc-modal-overlay";

  const dialog = document.createElement("div");
  dialog.className = "dmc-modal";
  dialog.role = "dialog";
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-labelledby", "dmc-modal-title");

  const header = document.createElement("div");
  header.className = "dmc-modal__header";

  const titleElement = document.createElement("h1");
  titleElement.id = "dmc-modal-title";
  titleElement.className = "dmc-modal__title";
  titleElement.textContent = title;

  const headerCloseButton = document.createElement("button");
  headerCloseButton.type = "button";
  headerCloseButton.className =
    "dmc-modal__header-close clover__btn clover__btn--tertiary " +
    "clover__btn--large clover__btn--icon-only clover__btn--close";
  headerCloseButton.setAttribute("aria-label", "Close");

  const headerCloseIcon = document.createElement("i");
  headerCloseIcon.className = "icon-interface-delete-1";
  headerCloseButton.appendChild(headerCloseIcon);

  const body = document.createElement("div");
  body.className = "dmc-modal__body";
  body.textContent = bodyText;

  const actions = document.createElement("div");
  actions.className = "dmc-modal__actions";

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className =
    "dmc-modal__close clover__btn clover__btn--secondary clover__btn--large";
  closeButton.textContent = "Close";

  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    document.removeEventListener("keydown", onKeyDown);
    overlay.remove();
  };
  const onKeyDown = (event) => {
    if (event.key === "Escape") close();
  };

  headerCloseButton.addEventListener("click", close);
  closeButton.addEventListener("click", close);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });
  document.addEventListener("keydown", onKeyDown);

  header.append(titleElement, headerCloseButton);
  actions.appendChild(closeButton);
  dialog.append(header, body, actions);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  closeButton.focus();

  return close;
};

const addModalTrigger = (ctx) => {
  const { header } = ctx.elements;
  if (!header || header.querySelector(`#${MODAL_TRIGGER_ID}`)) return;

  let closeModal = null;
  const button = document.createElement("button");
  button.id = MODAL_TRIGGER_ID;
  button.type = "button";
  button.className =
    "dmc-modal-trigger clover__btn clover__btn--secondary clover__btn--large";
  button.textContent = "Open dialog";
  button.addEventListener("click", () => {
    closeModal?.();
    closeModal = openModal({
      title: "Details",
      bodyText: "Hello from a Data Manager customization modal.",
    });
  });

  const actions = header.querySelector(HEADER_ACTIONS_SELECTOR) || header;
  actions.appendChild(button);
  ctx.registerCleanup(() => {
    closeModal?.();
    button.remove();
  });
};

window.dmCustomization = {
  apiVersion: 1,
  pages: {
    transactional: { list: { pageRendered: addModalTrigger } },
  },
};

// Why this shape: the trigger uses the stable header mount and native button
// classes. The modal is appended to document.body, avoids innerHTML, and is
// closed during page cleanup so it cannot survive route changes. Put the paired
// modal styles from 04-open-modal.css into customization/data-manager/app.css.
