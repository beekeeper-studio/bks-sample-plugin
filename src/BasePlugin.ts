import "./style.css";
import {
  addNotificationListener,
  runQuery,
  getData,
  setData,
  getAppInfo,
  log,
  getConnectionInfo,
  broadcast,
} from "@beekeeperstudio/plugin";

window.addEventListener("error", (e) => {
  log.error(e);
});

window.addEventListener("unhandledrejection", (e) => {
  log.error(e);
});

export type BroadcastData = {
  type: "formSubmitted" | "tableCreated" | "dataReset";
}

export abstract class BasePlugin {
  protected appElement: HTMLDivElement;
  protected tableName: string = "";
  protected currentView: "setup" | "main" = "setup";
  abstract title: string;

  protected isInMemorySqlite = false;

  constructor() {
    this.appElement = document.querySelector<HTMLDivElement>("#app")!;
  }

  async initialize() {
    broadcast.on<BroadcastData>((message) => {
      if (message.type === "dataReset" || message.type === "tableCreated") {
        this.reloadPage();
      }
    });

    const appInfo = await getAppInfo();
    const conn = await getConnectionInfo();
    if (conn.databaseType === "sqlite" && (conn.databaseName === "" || conn.databaseName == null)) {
      this.isInMemorySqlite = true;
    }
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

  private async resetData() {
    await setData("tableName", "");
    await runQuery(`DROP TABLE IF EXISTS ${this.tableName}`);
  }

  private async checkSavedTableName() {
    try {
      /**
       * Retrieve previously stored table name from Beekeeper Studio's plugin data store.
       * Returns the value associated with the given key, or undefined if not found.
       */
      const savedTableName = await getData<string>("tableName");
      if (savedTableName) {
        this.tableName = savedTableName;
        this.currentView = "main";
      } else {
        this.currentView = "setup";
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
        this.renderResetBtn();
        break;
    }
  }

  protected abstract renderMain(): void;

  private renderSetup() {
    const inMemorySqliteWarning = !this.isInMemorySqlite
      ? `<div class="sqlite-warning-card">
<strong>WARNING</strong>
<p>This plugin won't modify your existing data, but
for safer testing, consider using an in-memory SQLite database:</p>
<ol>
<li>Create a new connection</li>
<li>Select SQLite</li>
<li>Skip all configuration and then click connect</li>
<ol>
</div>`
      : "";
    this.appElement.innerHTML = `
      <div class="container">
        <h1>${this.title}</h1>
        <p class="main-description">This plugin will create a new table to store form submissions.</p>
        ${inMemorySqliteWarning}
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
        broadcast.post<BroadcastData>({ type: "tableCreated" });
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

  private renderResetBtn() {
    const btn = document.createElement("button");
    btn.classList.add("secondary-btn", "danger");
    btn.innerText = "Reset Data";
    btn.onclick = this.showResetDataConfirmation.bind(this);
    document.querySelector(".container")?.appendChild(btn);
  }

  protected showResetDataConfirmation() {
    const confirmation = document.createElement("div");

    confirmation.classList.add("reset-confirmation")
    confirmation.innerHTML = `
      <p>This will delete \`${this.tableName}\` table. Are you sure?</p>
      <button class="secondary-btn cancel-btn">Cancel</button>
      <button class="secondary-btn danger reset-btn">Reset</button>
    `;

    const close = () => confirmation.remove();
    const reset = () => {
      this.resetData();
      broadcast.post<BroadcastData>({ type: "dataReset" });
      this.reloadPage();
    }

    confirmation.querySelector(".cancel-btn")?.addEventListener("click", close);
    confirmation.querySelector(".reset-btn")?.addEventListener("click", reset);

    document.querySelector(".container")?.appendChild(confirmation);
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

  private reloadPage() {
    location.reload();
  }
}
