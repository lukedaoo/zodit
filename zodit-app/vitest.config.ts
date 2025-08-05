import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
    test: {
        reporters: ['verbose', 'html'],
        outputFile: './html/vitest-report.html',
        globals: true,
        environment: 'jsdom',
    },
    resolve: {
        alias: {
            '@analytics': path.resolve(__dirname, 'src/analytics'),
            '@common': path.resolve(__dirname, 'src/common'),
            '@components': path.resolve(__dirname, 'src/components'),
            '@hooks': path.resolve(__dirname, 'src/hooks'),
            '@lib': path.resolve(__dirname, 'src/lib'),
            '@pages': path.resolve(__dirname, 'src/pages'),
            '@user-prefs': path.resolve(__dirname, 'src/user-prefs'),
            '@database': path.resolve(__dirname, 'src/database'),
            '@context': path.resolve(__dirname, 'src/context'),
        },
    },
})
