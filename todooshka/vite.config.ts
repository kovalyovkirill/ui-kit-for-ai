import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // В монорепо React легко размножается: ui-kit объявляет его в peerDependencies,
    // и любая библиотека, поднятая npm в корневой node_modules, резолвит СВОЙ
    // экземпляр. Хуки чужого экземпляра получают null-диспетчер и падают на
    // useRef — так react-hook-form уже уронил страницу. dedupe удерживает один
    // экземпляр независимо от того, куда npm разложит пакеты.
    dedupe: ['react', 'react-dom'],
    // Kit debt (variant shims, component stubs) is imported by alias, never by a
    // relative path: generated pages kept getting the ../ depth wrong (tsc cannot
    // see it for CSS modules) or copied the shim into the page to dodge it.
    alias: { '@shims': fileURLToPath(new URL('./src/shims', import.meta.url)) },
  },
})
