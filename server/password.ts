// Keeps casual visitors out with a single password field on a login page.
// After login the browser gets a cookie holding a value derived from the password,
// so it can't be faked without knowing the password, and changing the password logs everyone out.

import { createHmac, timingSafeEqual } from 'node:crypto'
import path from 'node:path'
import express from 'express'

const COOKIE_NAME = 'math_login'
// Stays logged in until the end of 31 August 2027, Iceland time (UTC), so the installed app
// doesn't ask for the password every time it is opened.
const COOKIE_EXPIRES = new Date('2027-09-01T00:00:00Z')

const password = process.env.SITE_PASSWORD

if (!password) console.warn('SITE_PASSWORD is not set, the site is open to everyone.')

// Built by Vite from login.html and src/Login.vue.
const LOGIN_PAGE = path.resolve(import.meta.dirname, '../dist/login.html')

function loginToken(secret: string): string {
  return createHmac('sha256', secret).update('math-login').digest('hex')
}

function isSame(a: string, b: string): boolean {
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB)
}

function readCookie(req: express.Request, name: string): string | null {
  for (const part of (req.headers.cookie ?? '').split(';')) {
    const [key, ...value] = part.trim().split('=')
    if (key === name) return value.join('=')
  }
  return null
}

export const loginRoutes = express.Router()

loginRoutes.get('/login', (_req, res) => {
  if (!password) return res.redirect('/')
  res.sendFile(LOGIN_PAGE)
})

loginRoutes.post('/login', express.urlencoded({ extended: false }), (req, res) => {
  if (!password) return res.redirect('/')
  if (!isSame(String(req.body?.password ?? ''), password)) return res.redirect('/login?error=1')

  res.cookie(COOKIE_NAME, loginToken(password), {
    httpOnly: true,
    sameSite: 'lax',
    secure: req.secure,
    expires: COOKIE_EXPIRES,
  })
  res.redirect('/')
})

export const requirePassword: express.RequestHandler = (req, res, next) => {
  if (!password) return next()

  const token = readCookie(req, COOKIE_NAME)
  if (token && isSame(token, loginToken(password))) return next()

  if (req.path.startsWith('/api/')) return void res.sendStatus(401)
  res.redirect('/login')
}
