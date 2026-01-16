import express from 'express'
import path from 'node:path'
import { createServer as createViteServer } from 'vite'

import { API_ENDPOINTS } from '@/api'
import { VITE_INDEX_HTML } from '@/vite-index-html'

async function start() {
  const PORT = process.env.PORT || 3000

  const app = express()
  const vite = await createViteServer({
    root: path.join(process.cwd(), 'public'), // Set Vite root to 'public' directory
    server: { middlewareMode: true },
  })

  // ! [IMPORTANT] Define API endpoints above catch-all middleware
  // ! so that API routes are registered first
  // catch-all middleware = (app.use(async (req, res) => {...}) / See (vite-index-html.ts))
  API_ENDPOINTS(app)

  app.use(vite.middlewares)
  app.use(express.json()) // For parsing application/json

  // ! DO NOT let Express serve static files
  // app.use(express.static('public')) // ❌
  // * Instead, let Vite handle serving index.html and assets
  VITE_INDEX_HTML(app, vite) // ✅

  app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`)
  })
}

start()
