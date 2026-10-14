import path from 'node:path'
import express from 'express'
import { loginRoutes, requirePassword } from './password.ts'

const PORT = Number(process.env.PORT ?? 3000)
const DIST_DIR = path.resolve(import.meta.dirname, '../dist')

const app = express()

// Render serves the site over HTTPS through a proxy; this lets the login cookie be marked secure.
app.set('trust proxy', 1)

// These two stay open: search engines need robots.txt, and Render's health check has no password.
app.get('/robots.txt', (_req, res) => {
  res.type('text/plain').send('User-agent: *\nDisallow: /\n')
})
app.get('/health', (_req, res) => {
  res.sendStatus(200)
})

// The login page needs its scripts and styles before the visitor has logged in,
// and phones fetch the manifest and icons without the login cookie when installing the app.
app.use('/assets', express.static(path.join(DIST_DIR, 'assets')))
app.use('/icons', express.static(path.join(DIST_DIR, 'icons')))
app.get('/manifest.webmanifest', (_req, res) => {
  res.sendFile(path.join(DIST_DIR, 'manifest.webmanifest'))
})
app.use(loginRoutes)
app.use(requirePassword)

app.use(express.static(DIST_DIR))

app.listen(PORT, () => {
  console.log(`Math running on http://localhost:${PORT}`)
})
