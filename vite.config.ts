import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Served from https://sjunka.github.io/spem-playground/, not from a domain root.
export default defineConfig({
  base: "/spem-playground/",
  plugins: [react()],
  test: { include: ["src/**/*.test.ts"] },
});
