import { defineConfig } from 'vite'

// Some plugins (like @vitejs/plugin-react) are ESM-only and can cause "ESM file cannot be loaded by require"
// errors when Vite loads the config via CommonJS. Exporting an async config factory and dynamically
// importing the ESM-only plugin ensures the plugin is loaded as ESM at runtime.

export default defineConfig(async () => {
  const reactPlugin = (await import('@vitejs/plugin-react')).default
  return {
    plugins: [reactPlugin()],
  }
})
