// What: template for a row context-menu action that writes through a private
// Data Manager API endpoint. Set COLUMN_NAME and NEXT_VALUE for the target
// dataset, and verify the endpoint/body against the live OpenAPI before use.

const COLUMN_NAME = "CHANGE_ME_COLUMN_NAME";
const NEXT_VALUE = "CHANGE_ME_VALUE";

const cellValue = (cell) =>
  cell && typeof cell === "object" && "value" in cell ? cell.value : cell;

const isConfigured = () =>
  !COLUMN_NAME.startsWith("CHANGE_ME") && !NEXT_VALUE.startsWith("CHANGE_ME");

const getContextPath = () => {
  const shell = document.getElementById("clover-data-manager");
  const rawConfig = shell?.dataset?.config;
  if (!rawConfig) return "";

  try {
    return JSON.parse(rawConfig).contextPath || "";
  } catch {
    return "";
  }
};

const updateRowColumn = async ({ contextPath, dataSetCode, rowId }) => {
  const url =
    `${contextPath}/api/data-manager/v1/data-sets/` +
    `${encodeURIComponent(dataSetCode)}/rows/${encodeURIComponent(rowId)}` +
    `/columns/${encodeURIComponent(COLUMN_NAME)}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: NEXT_VALUE }),
  });

  if (!response.ok) {
    throw new Error(`Update failed with HTTP ${response.status}`);
  }
};

const addPrivateApiAction = (ctx) => {
  const grid = ctx.grid;
  if (!grid) return;

  const previousHandler = grid.option("onContextMenuPreparing");
  const onContextMenu = (event) => {
    previousHandler?.(event);

    if (!event.row || event.row.rowType !== "data") return;

    event.items = event.items || [];
    event.items.push({
      text: isConfigured()
        ? `Set ${COLUMN_NAME} to ${NEXT_VALUE}`
        : "Configure private API update",
      disabled: !isConfigured(),
      onItemClick: async () => {
        const contextPath = getContextPath();
        const dataSetCode = ctx.page.dataSetCode;
        const rowId = cellValue(event.row.data?._id);

        if (!contextPath || !dataSetCode || rowId == null || rowId === "") {
          ctx.notifications.showWarning("Row update context is not available");
          return;
        }

        try {
          await updateRowColumn({ contextPath, dataSetCode, rowId });
          await grid.refresh();
          ctx.notifications.showSuccess("Row updated");
        } catch (error) {
          ctx.notifications.showError(error.message || "Update failed");
        }
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
    transactional: { editor: { gridReady: addPrivateApiAction } },
    reference: { editor: { gridReady: addPrivateApiAction } },
  },
};

// Why this shape: private writes are dataset-specific, so this is a template,
// not a ready-made action. The action is row-scoped, unwraps the row id, checks
// the HTTP response, refreshes the grid after success, and preserves any
// existing grid context-menu handler.
