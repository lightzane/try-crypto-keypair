import fs from 'node:fs'
import path from 'node:path'

import type { Express } from 'express'
import type { ViteDevServer } from 'vite'

/**
 * Middleware to handle Vite HTML transformations.
 *
 * This allows Vite to process the index.html file,
 * enable import modules (e.g. `import axios from 'axios'`),
 * and apply HMR (Hot Module Replacement) during development.
 *
 * @param app - The Express application instance
 * @param vite - The Vite development server instance
 */
export async function VITE_INDEX_HTML(app: Express, vite: ViteDevServer) {
  // * Catch-all middleware to handle all other requests
  app.use(async (req, res) => {
    const url = req.originalUrl
    const indexHtmlPath = path.join(process.cwd(), 'public', 'index.html')

    let html = fs.readFileSync(indexHtmlPath, 'utf-8')
    html = await vite.transformIndexHtml(url, html)

    res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
  })
}
