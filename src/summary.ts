import { addNotificationListener, runQuery } from "@beekeeperstudio/plugin";
import { BasePlugin, type BroadcastData } from "./BasePlugin";

class SummaryPlugin extends BasePlugin {
  title = "Form Summary";

  async initialize() {
    await super.initialize();

    /**
     * Listen for form submission notifications from other views of the plugin.
     */
    addNotificationListener<BroadcastData>("broadcast", ({ message }) => {
      if (message.type === "formSubmitted") {
        this.renderMain();
      }
    });
  }

  private async loadSummaryData() {
    const [submissions, stats] = await Promise.all([
      /**
       * Execute SQL SELECT query to retrieve form submissions.
       * SECURITY NOTE: This function executes raw SQL. Always be cautious
       * with dynamic SQL construction. */
      runQuery(`SELECT * FROM ${this.tableName} ORDER BY created_at DESC`),
      runQuery(`
          SELECT
            COUNT(*) as total_submissions,
            AVG(rating) as avg_rating,
            MIN(rating) as min_rating,
            MAX(rating) as max_rating
          FROM ${this.tableName}
        `),
    ]);

    return { submissions, stats };
  }

  protected async renderMain(): Promise<void> {
    this.appElement.innerHTML = `
      <div class="container">
        <div class="header">
          <h1>Form Summary</h1>
        </div>

        <div id="summary-content">Loading...</div>
      </div>
    `;

    const summaryContent = document.getElementById(
      "summary-content",
    ) as HTMLDivElement;

    try {
      const result = await this.loadSummaryData();

      const rows = result.submissions.results[0].rows;
      if (!rows || rows.length === 0) {
        summaryContent.innerHTML = '<p class="no-data">No submissions yet.</p>';
        return;
      }

      const stats = result.stats.results[0].rows[0];
      summaryContent.innerHTML = this.buildSummaryHTML(rows, stats);
    } catch (error) {
      summaryContent.innerHTML = `<div class="error-box">Error loading data: ${error}</div>`;
    }
  }

  private buildSummaryHTML(rows: any[], stats: any): string {
    return `
      <div class="stats">
        <div class="stat-item">
          <strong>Total Submissions:</strong> ${Number(stats.total_submissions)}
        </div>
        <div class="stat-item">
          <strong>Average Rating:</strong> ${parseFloat(stats.avg_rating).toFixed(1)}
        </div>
        <div class="stat-item">
          <strong>Rating Range:</strong> ${Number(stats.min_rating)} - ${Number(stats.max_rating)}
        </div>
      </div>
      <div class="submissions">
        <h3>Recent Submissions</h3>
        ${rows
        .map(
          (row) => `
          <div class="submission-item">
            <div class="submission-header">
              <strong>${row.name}</strong>
              <span class="rating">★ ${Number(row.rating)}/5</span>
              <span class="date">${new Date(row.created_at).toLocaleDateString()}</span>
            </div>
            <div class="submission-email">${row.email}</div>
            <div class="submission-message">${row.message}</div>
          </div>`,
        )
        .join("")}
      </div>
    `;
  }
}

const summary = new SummaryPlugin();
summary.initialize();
