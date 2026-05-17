import { copyFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      include: ['src'],
      exclude: ['src/**/*.stories.*', 'src/**/*.test.*'],
      rollupTypes: true,
    }),
    {
      name: 'copy-tokens-css',
      closeBundle() {
        copyFileSync(
          resolve(__dirname, 'src/styles/css/_varaibles-full.css'),
          resolve(__dirname, 'dist/styles.css')
        )
        writeFileSync(
          resolve(__dirname, 'dist/styles.d.ts'),
          '// CSS side-effect import\nexport {}\n'
        )
        writeFileSync(
          resolve(__dirname, 'dist/style.d.ts'),
          '// CSS side-effect import\nexport {}\n'
        )
      },
    },
  ],
  resolve: {
    alias: {
      '@ui': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
})
