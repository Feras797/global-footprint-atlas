import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import cesium from "vite-plugin-cesium";
import { viteCommonjs } from "@originjs/vite-plugin-commonjs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    viteCommonjs({
      // Transform CommonJS modules to ES modules
      transformMixedEsModules: true
    }),
    cesium({
      // Latest 2025 configuration
      cesiumBaseUrl: "cesium",
      rebuildCesium: false,
      devMinifyCesium: false,
      cesiumBuildRootPath: "node_modules/cesium/Build",
      cesiumBuildPath: "node_modules/cesium/Build/Cesium"
    }),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Define CESIUM_BASE_URL for latest version
    CESIUM_BASE_URL: JSON.stringify("/cesium/"),
  },
  optimizeDeps: {
    // Exclude cesium from pre-bundling
    exclude: ["cesium"],
    // Include all problematic CommonJS dependencies
    include: [
      "mersenne-twister", 
      "urijs", 
      "grapheme-splitter"
    ]
  },
}));
