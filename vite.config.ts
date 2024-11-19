import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import Unfonts from "unplugin-fonts/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    Unfonts({
      custom: {
        families: [
          {
            name: "Geist",
            src: "./src/assets/fonts/geist/*.woff2",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
