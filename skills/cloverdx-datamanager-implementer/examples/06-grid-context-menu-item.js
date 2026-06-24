// What: add a custom item to the grid's right-click context menu.

const cellValue = (cell) =>
  cell && typeof cell === "object" && "value" in cell ? cell.value : cell;

const addContextMenuItem = (ctx) => {
  const grid = ctx.grid;
  if (!grid) return;

  const previousHandler = grid.option("onContextMenuPreparing");
  const onContextMenu = (e) => {
    previousHandler?.(e);

    if (!e.row || e.row.rowType !== "data") return;
    e.items = e.items || [];
    e.items.push({
      text: "Show row id",
      onItemClick: () => {
        const id = cellValue(e.row.data?._id);
        if (id == null || id === "") {
          ctx.notifications.showWarning("Row id is not available");
          return;
        }
        ctx.notifications.showInfo(`Row id: ${id}`);
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
    transactional: { editor: { gridReady: addContextMenuItem } },
    reference: { editor: { gridReady: addContextMenuItem } },
  },
};

// Why this shape: extend the grid's own contextMenuPreparing event rather than
// building a DOM menu. Preserve any existing handler, unwrap Data Manager cell
// envelopes before using values, and restore the handler during cleanup.
