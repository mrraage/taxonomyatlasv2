/// <reference types="vitest" />
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
    plugins: [
//        taxonomy(),
        react(),
    ],
    // define and envPrefix removed as API key handling is moved to backend
    server: { // Add server configuration
        proxy: {
            // Proxy requests starting with /api to the backend server
           '/api': {
               target: 'http://127.0.0.1:3001', // Force IPv4
                changeOrigin: true, // Recommended for virtual hosted sites
                // secure: false, // Uncomment if backend uses self-signed SSL cert
                // rewrite: (path) => path.replace(/^\/api/, ''), // Uncomment if backend doesn't expect /api prefix
            }
        }
    },
    test: {
        globals: true, // Optional: Use if you want global APIs like describe, it, expect
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts', // Path to setup file
        // Optional: Add if you want CSS support in tests
        // css: true,
    },
});