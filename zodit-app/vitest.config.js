import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        reporters: ['verbose', 'html'],
        outputFile: './html/vitest-report.html',
    },
})
