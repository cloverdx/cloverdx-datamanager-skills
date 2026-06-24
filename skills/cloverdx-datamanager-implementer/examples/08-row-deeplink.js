// What: add a row context-menu action that opens an external URL.

const cellValue = (cell) =>
  cell && typeof cell === "object" && "value" in cell ? cell.value : cell;

const buildExternalUrl = (row, ctx) => {
  const rowId = encodeURIComponent(cellValue(row._id));
  const dataSetCode = encodeURIComponent(ctx.page.dataSetCode || "");

  // Replace this with the target system's real URL contract.
  return `https://example.com/data-manager/${dataSetCode}/rows/${rowId}`;
};

const addRowDeeplink = (ctx) => {
  const grid = ctx.grid;
  if (!grid) return;

  const previousHandler = grid.option("onContextMenuPreparing");
  const onContextMenu = (event) => {
    previousHandler?.(event);

    if (!event.row || event.row.rowType !== "data") return;

    event.items = event.items || [];
    event.items.push({
      text: "Open external link",
      onItemClick: () => {
        const row = event.row.data;
        const rowId = cellValue(row?._id);
        if (rowId == null || rowId === "") {
          ctx.notifications.showWarning("Row id is not available");
          return;
        }

        window.open(buildExternalUrl(row, ctx), "_blank", "noopener");
      },
    });
  };

  grid.option("onContextMenuPreparing", onContextMenu);
  ctx.registerCleanup(() => {
    if (grid.option("onContextMenuPreparing") === onContextMenu) {
      grid.option("onContextMenuPreparing", previousHandler);
    }
  });
};

window.dmCustomization = {
  apiVersion: 1,
  pages: {
    transactional: { editor: { gridReady: addRowDeeplink } },
    reference: { editor: { gridReady: addRowDeeplink } },
  },
};

// Why this shape: keep cross-system knowledge inside buildExternalUrl, use the
// grid's context menu as the row-scoped trigger, unwrap Data Manager cell
// envelopes before building URLs, and preserve any existing context-menu
// handler.
