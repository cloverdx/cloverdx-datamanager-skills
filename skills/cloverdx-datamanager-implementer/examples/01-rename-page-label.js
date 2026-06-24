// What: rename the visible page title on the transactional dataset catalog.
// The running UI renders this title as "Transactional Data Sets".
// Verify this internal selector against the target Data Manager version.

const TITLE_SELECTOR = ".page__header__column > .h1";
const FROM_TITLE = "Transactional Data Sets";
const TO_TITLE = "Import tool";

const renameLabel = (ctx) => {
  const { header } = ctx.elements;
  if (!header) return;

  const title = header.querySelector(TITLE_SELECTOR);
  if (!title || title.textContent.trim() !== FROM_TITLE) return;

  title.textContent = TO_TITLE;
};

window.dmCustomization = {
  apiVersion: 1,
  pages: {
    transactional: { list: { pageRendered: renameLabel } },
  },
};

// Why this shape: breadcrumbs use the same label, so the code targets the
// title container inside the stable header mount instead of searching all text.
