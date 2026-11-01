import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // GitHub Pages (https://y-maeda1116.github.io/cam-cheat-sheet/) 向け
  base: "/cam-cheat-sheet/",
  plugins: [tailwindcss()],
  build: {
    target: "es2022",
  },
});
