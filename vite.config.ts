import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig(() => {
  // GitHub Pages serves the site at `https://{owner}.github.io/{repo}/`.
  // In Actions, GITHUB_REPOSITORY is "owner/repo" so we can set Vite's base correctly.
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
  const isGhActions = !!process.env.GITHUB_ACTIONS
  const base = isGhActions && repo ? `/${repo}/` : '/'

  return {
    base,
    plugins: [
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used – do not remove them
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        // Alias @ to the src directory
        '@': path.resolve(__dirname, './src'),
      },
    },

    // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
    assetsInclude: ['**/*.svg', '**/*.csv'],
  }
})
