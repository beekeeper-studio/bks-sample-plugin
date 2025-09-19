import { defineConfig } from "vite";
import bks from "@beekeeperstudio/vite-plugin";

export default defineConfig({
  plugins: [
    // Beekeeper Studio plugin handles bundling HTML files
    bks({
      entrypoints: [
        {
          input: "form.html", // Source HTML file
          output: "dist/form.html", // Built output referenced in manifest.json
        },
        {
          input: "summary.html",
          output: "dist/summary.html",
        },
      ],
    }),
  ],
});
