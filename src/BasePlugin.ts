import "./style.css";
import {
  addNotificationListener,
  getTables,
  runQuery,
  getData,
  setData,
  getAppInfo,
  log,
} from "@beekeeperstudio/plugin";

window.addEventListener("error", (e) => {
  log.error(e);
});

window.addEventListener("unhandledrejection", (e) => {
  log.error(e);
});

export type BroadcastData = {
  type: "formSubmitted";
}

export abstract class BasePlugin {
  protected appElement: HTMLDivElement;
  protected tableName: string = "";
  protected currentView: "setup" | "main" = "setup";
  abstract title: string;

  constructor() {
    this.appElement = document.querySelector<HTMLDivElement>("#app")!;
  }

  async initialize() {
    const appInfo = await getAppInfo();
    this.applyTheme(appInfo.theme.cssString);
    this.initializeWatchers();
    await this.checkSavedTableName();
    this.render();
  }

  private initializeWatchers() {

    /**
     * Triggered when the user changes the application theme. Allows plugins to
     * update their styling to match the current theme.
     * @see https://docs.beekeeperstudio.io/plugin_development/api-reference/#notifications
     */
    addNotificationListener("themeChanged", (theme) => {
      this.applyTheme(theme.cssString);
    });
  }

  private async createTable(name: string) {
    const sql = `
      CREATE TABLE IF NOT EXISTS ${name} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        rating INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    /**
     * Execute SQL DDL statement to create the form submissions table.
     * WARNING: This function can execute any SQL statement - Only use with
     * trusted/sanitized queries.
     */
    await runQuery(sql);

    /**
     * Persist the table name in Beekeeper Studio's plugin data store.
     * This data is shared across all views of the same plugin and persists
     * between sessions.
     *
     * Alternative: Use setViewState/getViewState for view-specific data that
     * doesn't need to be shared between different plugin views.
     */
    await setData("tableName", name);
  }

  private async checkSavedTableName() {
    try {
      /**
       * Retrieve previously stored table name from Beekeeper Studio's plugin data store.
       * Returns the value associated with the given key, or undefined if not found.
       */
      const savedTableName = await getData<string>("tableName");
      if (savedTableName) {
        /**
         * Get list of all tables in the currently connected database.
         * Useful for validating table existence and discovering database schema.
         */
        const tables = await getTables();
        const tableExists = tables.some(
          (table) => table.name === savedTableName,
        );

        if (tableExists) {
          this.tableName = savedTableName;
          this.currentView = "main";
        } else {
          await setData("tableName", "");
          this.currentView = "setup";
        }
      }
    } catch (error) {
      console.error("Error checking saved table name:", error);
      this.currentView = "setup";
    }
  }

  private render() {
    switch (this.currentView) {
      case "setup":
        this.renderSetup();
        break;
      case "main":
        this.renderMain();
        break;
    }
  }

  protected abstract renderMain(): void;

  private renderSetup() {
    this.appElement.innerHTML = `
      <div class="container">
        <h1>${this.title}</h1>
        <p>This plugin will create a new table to store form submissions.</p>
        <p><strong>⚠️ Consider using an in-memory SQLite database for testing.</strong></p>

        <div class="setup-form">
          <div class="form-group">
            <label for="table-name">Table Name:</label>
            <input
              type="text"
              id="table-name"
              placeholder="e.g., form_submissions"
              value="${this.tableName}"
            />
            <div id="table-error" class="error-box" style="display: none;"></div>
          </div>

          <button id="create-table-btn" class="primary-btn">
            Create Table & Continue
          </button>
        </div>
      </div>
    `;

    const createBtn = document.getElementById(
      "create-table-btn",
    ) as HTMLButtonElement;
    const tableNameInput = document.getElementById(
      "table-name",
    ) as HTMLInputElement;
    const errorBox = document.getElementById("table-error") as HTMLDivElement;

    createBtn.addEventListener("click", async () => {
      const tableName = tableNameInput.value.trim();

      if (!this.validateTableName(tableName)) {
        this.showError(
          errorBox,
          "Please enter a valid table name (letters, numbers, underscores only)",
        );
        return;
      }

      try {
        createBtn.disabled = true;
        createBtn.textContent = "Creating...";

        await this.createTable(tableName);

        this.tableName = tableName;
        this.currentView = "main";
        this.render();
      } catch (error) {
        this.showError(errorBox, `Error creating table: ${error}`);
        createBtn.disabled = false;
        createBtn.textContent = "Create Table & Continue";
      }
    });
  }

  private applyTheme(cssString: string) {
    const themeElement = document.getElementById("app-theme");
    if (themeElement) {
      themeElement.textContent = `:root { ${cssString} }`;
    }
  }

  protected showError(errorBox: HTMLElement, message: string) {
    errorBox.textContent = message;
    errorBox.style.display = "block";
    setTimeout(() => {
      errorBox.style.display = "none";
    }, 5000);
  }

  protected showSuccess(message: string) {
    const successBox = document.createElement("div");
    successBox.className = "success-box";
    successBox.textContent = message;
    successBox.style.display = "block";

    document.querySelector(".container")?.appendChild(successBox);

    setTimeout(() => {
      successBox.remove();
    }, 3000);
  }

  private validateTableName(name: string): boolean {
    return (
      /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name) &&
      name.length > 0 &&
      name.length <= 64
    );
  }


  /** Escape a string for use in an SQL query */
  protected escapeStr(str: string): string {
    return str.replace(/'/g, "''");
  }
}
