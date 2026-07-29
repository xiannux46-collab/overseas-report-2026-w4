import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: "static",
  base: "./",
  publicDir: "../public",
  plugins: [react()],
  build: {
    outDir: "../public-dist",
    emptyOutDir: true,
  },
});
