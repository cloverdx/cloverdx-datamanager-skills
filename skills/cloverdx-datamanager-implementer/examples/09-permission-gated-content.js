// What: show an editor-toolbar action only for data set approvers.
// Verify this internal toolbar selector against the target Data Manager version.

const ACTION_ID = "dmc-permission-action";
const EDITOR_TOOLBAR_SELECTOR = ".editor-toolbar";
const REQUIRED_DATA_SET_PERMISSION = "approver";
const PERMISSION_RANK = {
  none: 0,
  reader: 1,
  editor: 2,
  approver: 3,
  admin: 4,
};

const getRuntimeConfig = () => {
  const shell = document.getElementById("clover-data-manager");
  const rawConfig = shell?.dataset?.config;
  if (!rawConfig) return {};

  try {
    return JSON.parse(rawConfig);
  } catch {
    return {};
  }
};

const hasAtLeastPermission = (actual, required) =>
  (PERMISSION_RANK[actual] ?? 0) >= (PERMISSION_RANK[required] ?? Infinity);

const fetchDataSetPermission = async (contextPath, dataSetCode) => {
  const response = await fetch(
    `${contextPath}/api/data-manager/v1/data-sets/${encodeURIComponent(
      dataSetCode,
    )}`,
  );

  if (!response.ok) {
    throw new Error(`Data set metadata request failed: ${response.status}`);
  }

  const dataSet = await response.json();
  return dataSet.callerPermission || "none";
};

const addApproversOnlyAction = (ctx) => {
  const { content } = ctx.elements;
  const { dataSetCode } = ctx.page;
  const { contextPath } = getRuntimeConfig();
  const toolbar = content?.querySelector(EDITOR_TOOLBAR_SELECTOR);

  if (
    !toolbar ||
    !dataSetCode ||
    !contextPath ||
    toolbar.querySelector(`#${ACTION_ID}`)
  ) {
    return;
  }

  let disposed = false;
  let action = null;

  ctx.registerCleanup(() => {
    disposed = true;
    action?.remove();
  });

  fetchDataSetPermission(contextPath, dataSetCode)
    .then((callerPermission) => {
      if (
        disposed ||
        !hasAtLeastPermission(callerPermission, REQUIRED_DATA_SET_PERMISSION)
      ) {
        return;
      }

      action = document.createElement("div");
      action.id = ACTION_ID;
      action.className = "dmc-permission-toolbar-action";

      const button = document.createElement("button");
      button.type = "button";
      button.className =
        "dmc-permission-action clover__btn clover__btn--secondary " +
        "clover__btn--large";
      button.textContent = "Approvers action";
      button.addEventListener("click", () => {
        ctx.notifications.showInfo(
          `Current data set permission: ${callerPermission}`,
        );
      });

      action.append(button);
      toolbar.append(action);
    })
    .catch(() => {
      if (!disposed) {
        ctx.notifications.showWarning("Unable to verify data set permission.");
      }
    });
};

window.dmCustomization = {
  apiVersion: 1,
  pages: {
    transactional: { editor: { pageRendered: addApproversOnlyAction } },
    reference: { editor: { pageRendered: addApproversOnlyAction } },
  },
};

// Why this shape: global shell permissions say whether Data Manager features
// are generally available. Data set actions need the data set's
// callerPermission and should fail closed when it cannot be verified.
