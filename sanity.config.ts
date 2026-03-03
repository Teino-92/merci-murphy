import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

export default defineConfig({
  name: 'merci-murphy',
  title: 'Merci Murphy',
  projectId: 'ge543h88',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  basePath: '/studio',
  plugins: [structureTool()],
  schema: {
    types: [],
  },
})
