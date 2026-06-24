// What: add a custom row-action button to the DataGrid header panel.
// Verify these DevExtreme/internal selectors against the target Data Manager version.

const BUTTON_ID = "dmc-grid-header-button";
const BUTTON_ITEM_ID = "dmc-grid-header-button-item";
const HEADER_PANEL_SELECTOR = ".dx-datagrid-header-panel";
const TOOLBAR_BEFORE_SELECTOR = ".dx-toolbar-before";
const SOURCE_BUTTON_SELECTOR = ".dx-button-mode-text";

const addToolbarButton = (ctx) => {
  const { content } = ctx.elements;
  if (!content || !ctx.grid) return;

  const headerPanel = content.querySelector(HEADER_PANEL_SELECTOR);
  if (!headerPanel) return;

  const inject = () => {
    const toolbarBefore = headerPanel.querySelector(TOOLBAR_BEFORE_SELECTOR);
    if (!toolbarBefore || toolbarBefore.querySelector(`#${BUTTON_ITEM_ID}`)) {
      return;
    }

    const source = toolbarBefore.querySelector(SOURCE_BUTTON_SELECTOR);
    if (!source) return;

    const sourceItem = source.closest(".dx-toolbar-item");
    if (!sourceItem) return;

    const item = sourceItem.cloneNode(true);
    item.id = BUTTON_ITEM_ID;
    item.classList.add("dmc-grid-header-button-item");

    const button = item.querySelector(SOURCE_BUTTON_SELECTOR);
    if (!button) return;

    button.id = BUTTON_ID;
    button.classList.add("dmc-grid-header-button");
    button.removeAttribute("aria-label");

    const text = button.querySelector(".dx-button-text");
    if (text) text.textContent = "Inspect";

    button.addEventListener("click", () => {
      const rows = ctx.grid.getSelectedRowsData?.() || [];
      ctx.notifications.showInfo(`${rows.length} selected row(s)`);
    });

    toolbarBefore.appendChild(item);
  };

  inject();

  const observer = new MutationObserver(inject);
  observer.observe(headerPanel, { childList: true, subtree: true });
  ctx.registerCleanup(() => {
    observer.disconnect();
    headerPanel.querySelector(`#${BUTTON_ITEM_ID}`)?.remove();
  });
};

window.dmCustomization = {
  apiVersion: 1,
  pages: {
    transactional: { editor: { gridReady: addToolbarButton } },
  },
};

// Why this shape: clone the whole toolbar item wrapper, not only the inner
// button, so alignment stays native. Keep DOM-injected toolbar actions short;
// if responsive overflow is required, prefer a page-level header action.
