/**
 * Type definitions for the CloverDX Data Manager customization surface.
 *
 * This file is an authoring aid, not a runtime dependency. Data Manager loads
 * only app.js and app.css from the branding ZIP unless you explicitly ship more.
 *
 * Customizations are authored as plain JS (`app.js`), but you can reference
 * these types via JSDoc for author-time checking and as precise documentation:
 *
 *   /// <reference path="./datamanager-customization.d.ts" />
 *   /** @type {DmCustomization} *\/
 *   window.dmCustomization = { apiVersion: 1, pages: { ... } };
 *
 * These mirror references/datamanager-customization-api.md. They describe only the
 * public host contract provided by the CloverDX bundle, not private Data
 * Manager row models or full DevExtreme typings.
 */

type DmModule = "transactional" | "reference";
type DmView = "list" | "batches" | "editor" | "configuration";

/** Stable mount points marked with `data-dm-customization-mount`. */
interface DmElements {
  root: HTMLElement | null;
  /** Active page header bar. */
  header: HTMLElement | null;
  /** Active page content area. */
  content: HTMLElement | null;
  /** Shared left sidebar. */
  sidePanel: HTMLElement | null;
}

interface DmNotifications {
  showInfo(text: string, options?: object): void;
  showSuccess(text: string, options?: object): void;
  showWarning(text: string, options?: object): void;
  showError(text: string, options?: object): void;
}

interface DmBaseContext {
  elements: DmElements;
  page: {
    module: DmModule;
    view: DmView;
    dataSetCode?: string;
    batchKey?: string;
  };
  notifications: DmNotifications;
  registerCleanup(fn: () => void): void;
}

/** DevExtreme DataGrid instance — only present on editor pages, via gridReady. */
interface DmEditorContext extends DmBaseContext {
  grid: DevExtremeDataGrid;
}

/** Loose grid handle. Use DevExtreme docs/runtime inspection for exact methods. */
interface DevExtremeDataGrid {
  getSelectedRowsData(): unknown[];
  getSelectedRowKeys(): unknown[];
  refresh(): Promise<void> | void;
  on(event: string, handler: (e: unknown) => void): void;
  off(event: string, handler: (e: unknown) => void): void;
  [methodOrProperty: string]: unknown;
}

type DmHook<C extends DmBaseContext = DmBaseContext> = (ctx: C) => void;

interface DmStaticPageHooks {
  pageRendered?: DmHook;
  destroy?: DmHook;
}

interface DmEditorPageHooks extends DmStaticPageHooks {
  gridReady?: DmHook<DmEditorContext>;
}

interface DmTransactionalCustomizationPages {
  list?: DmStaticPageHooks;
  batches?: DmStaticPageHooks;
  configuration?: DmStaticPageHooks;
  editor?: DmEditorPageHooks;
}

interface DmReferenceCustomizationPages {
  list?: DmStaticPageHooks;
  configuration?: DmStaticPageHooks;
  editor?: DmEditorPageHooks;
}

interface DmCustomizationPages {
  transactional?: DmTransactionalCustomizationPages;
  reference?: DmReferenceCustomizationPages;
}

interface DmCustomization {
  apiVersion: 1;
  pages?: DmCustomizationPages;
}

interface Window {
  dmCustomization?: DmCustomization;
}
