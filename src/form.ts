import { broadcast, runQuery } from "@beekeeperstudio/plugin";
import { BasePlugin, type BroadcastData } from "./BasePlugin";

interface FormData {
  name: string;
  email: string;
  message: string;
  rating: number;
}

class FormPlugin extends BasePlugin {
  title = "Simple Form Plugin";

  private async insert(data: FormData) {
    const insertSQL = `
      INSERT INTO ${this.tableName} (name, email, message, rating)
      VALUES ('${this.escapeStr(data.name)}', '${this.escapeStr(data.email)}', '${this.escapeStr(data.message)}', ${data.rating})
    `;

    /**
     * Execute SQL DML statement to insert form data into the database.
     *
     * SECURITY WARNING: This function executes raw SQL - always sanitize inputs
     * to prevent SQL injection attacks.
     */
    await runQuery(insertSQL);

    // Notify other views of form submission.
    broadcast.post<BroadcastData>({ type: "formSubmitted" });
  }

  protected renderMain(): void {
    this.appElement.innerHTML = `
      <div class="container">
        <div class="header">
          <h1>Simple Form</h1>
        </div>

        <form id="submission-form" class="form">
          <div class="form-group">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" required />
          </div>

          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required />
          </div>

          <div class="form-group">
            <label for="message">Message:</label>
            <textarea id="message" name="message" rows="4" required></textarea>
          </div>

          <div class="form-group">
            <label for="rating">Rating (1-5):</label>
            <select id="rating" name="rating" required>
              <option value="">Choose a rating</option>
              <option value="1">1 - Poor</option>
              <option value="2">2 - Fair</option>
              <option value="3">3 - Good</option>
              <option value="4">4 - Very Good</option>
              <option value="5">5 - Excellent</option>
            </select>
          </div>

          <div id="form-error" class="error-box" style="display: none;"></div>

          <button type="submit" class="primary-btn">Submit</button>
        </form>

        <p class="table-info">Saving to table: <strong>${this.tableName}</strong></p>
      </div>
    `;

    const form = document.getElementById("submission-form") as HTMLFormElement;
    const errorBox = document.getElementById("form-error") as HTMLDivElement;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const data: FormData = {
        name: (formData.get("name") as string) || "",
        email: (formData.get("email") as string) || "",
        message: (formData.get("message") as string) || "",
        rating: parseInt((formData.get("rating") as string) || "0"),
      };

      if (!this.validateFormData(data)) {
        this.showError(
          errorBox,
          "Please fill in all required fields correctly",
        );
        return;
      }

      const submitBtn = form.querySelector(
        'button[type="submit"]',
      ) as HTMLButtonElement;

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";

        await this.insert(data);

        form.reset();

        this.showSuccess("Form submitted successfully!");

        submitBtn.disabled = false;
        submitBtn.textContent = "Submit";
      } catch (error) {
        this.showError(errorBox, `Error submitting form: ${error}`);
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit";
      }
    });
  }

  private validateFormData(data: FormData): boolean {
    return (
      data.name.trim().length > 0 &&
      data.email.trim().length > 0 &&
      data.message.trim().length > 0 &&
      data.rating >= 1 &&
      data.rating <= 5
    );
  }
}

const form = new FormPlugin();
form.initialize();
