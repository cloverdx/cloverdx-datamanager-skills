// What: inject a custom action into the shared sidebar.
// Verify this internal sidebar selector against the target Data Manager version.

const ITEM_ID = "dmc-sidebar-item";
const ITEM_LABEL = "Docs";
const ITEM_ICON = "interface-help-question-circle";
const SIDEBAR_TOP_SELECTOR = ".clover__sidebar-links > div:first-child";

const buildSidebarItem = (ctx) => {
  const item = document.createElement("div");
  item.id = ITEM_ID;
  item.role = "button";
  item.tabIndex = 0;
  item.className =
    "dmc-sidebar-item clover__sidebar-link clover__sidebar-link__cursor";
  item.setAttribute("aria-label", ITEM_LABEL);
  item.title = ITEM_LABEL;
  const activate = () => {
    ctx.notifications.showInfo(`${ITEM_LABEL} clicked`);
  };
  item.addEventListener("click", activate);
  item.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    activate();
  });

  const iconWrapper = document.createElement("div");
  iconWrapper.className = "clover__sidebar-link__icon";

  const icon = document.createElement("i");
  icon.className = `icon-${ITEM_ICON}`;

  iconWrapper.appendChild(icon);
  item.appendChild(iconWrapper);

  return item;
};

const addSidebarItem = (ctx) => {
  const { sidePanel } = ctx.elements;
  if (!sidePanel) return;

  if (sidePanel.querySelector(`#${ITEM_ID}`)) return;

  const sidebarTop = sidePanel.querySelector(SIDEBAR_TOP_SELECTOR) || sidePanel;
  const item = buildSidebarItem(ctx);
  sidebarTop.appendChild(item);
  ctx.registerCleanup(() => item.remove());
};

window.dmCustomization = {
  apiVersion: 1,
  pages: {
    transactional: {
      list: { pageRendered: addSidebarItem },
      batches: { pageRendered: addSidebarItem },
      editor: { pageRendered: addSidebarItem },
      configuration: { pageRendered: addSidebarItem },
    },
    reference: {
      list: { pageRendered: addSidebarItem },
      editor: { pageRendered: addSidebarItem },
      configuration: { pageRendered: addSidebarItem },
    },
  },
};

// Why this shape: there is no public sidebar API, so the example starts from
// elements.sidePanel, inserts into the native links column, and uses the same
// sidebar item structure/classes as Data Manager.
