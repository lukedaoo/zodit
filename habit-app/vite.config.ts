import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    build: {
        rollupOptions: {
            external: ['**/*.test.ts'],
            input: {
                main: "./index.html",
                todo_app: "./todo-app-index.html",
            },
        },
        outDir: 'dist', // Output directory for all builds
    },
    resolve: {
        alias: {
            '@common': path.resolve(__dirname, 'src/common'),
            '@components': path.resolve(__dirname, 'src/components'),
            '@hooks': path.resolve(__dirname, 'src/hooks'),
            '@lib': path.resolve(__dirname, 'src/lib'),
            '@pages': path.resolve(__dirname, 'src/pages'),
            '@user-prefs': path.resolve(__dirname, 'src/user-prefs'),
        },
    },
})
