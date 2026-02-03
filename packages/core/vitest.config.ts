import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["src/_survivor_specific/**", "**/node_modules/**"],
  },
  resolve: {
    alias: {
      "@tartarus/core": path.resolve(__dirname, "src/index.ts"),
      "@tartarus/combat": path.resolve(__dirname, "../combat/src/index.ts"),
      "@tartarus/ai": path.resolve(__dirname, "../ai/src/index.ts"),
      "@tartarus/waves": path.resolve(__dirname, "../waves/src/index.ts"),
    },
  },
});
