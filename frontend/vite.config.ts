import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const envDir = resolve(__dirname, "../");

export default defineConfig({
    plugins: [react()],
    envDir,
    envPrefix: "APP_",
    server: { allowedHosts: true },
    resolve: {
        alias: {
            "@core": resolve(__dirname, "src/core"),
            "@": resolve(__dirname, "src"),
        },
    },
});