import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["**/node_modules/**"],
  },
  resolve: {
    alias: {
      "@tartarus/tilemap": path.resolve(__dirname, "../tilemap/src/index.ts"),
    },
  },
});
