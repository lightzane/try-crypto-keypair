import type { Express } from 'express'

export async function API_ENDPOINTS(app: Express) {
  app.get('/api/hello', (_req, res) => {
    res.json({ message: 'Hello from the server!' })
  })
}
