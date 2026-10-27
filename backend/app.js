import express from 'express'
import { rateLimit } from 'express-rate-limit'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createHash } from 'node:crypto'
import { validatePayment } from '../src/paymentValidation.js'
import { validatePost } from '../src/postValidation.js'
export const tokenOptions = { issuer: 'dev-deakin-d1', audience: 'dev-deakin-web' }
export const userId = email => createHash('sha256').update(email).digest('hex')
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const publicUser = (id, user) => ({ id, name: user.name, email: user.email, plan: user.plan === 'paid' ? 'paid' : 'free' })

// Inject storage and mail so automated tests cannot touch real accounts or email.
export function createApp({ store, secret, sendWelcome }) {
  if (!secret || secret.length < 32) throw new Error('Configure a JWT_SECRET of at least 32 characters.')
  const app = express()
  app.disable('x-powered-by')
  app.use(express.json({ limit: '64kb' }))
  app.use('/api', (req, res, next) => { res.set('Cache-Control', 'no-store'); next() })
  const accountLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, message: { message: 'Too many attempts. Please try again in 15 minutes.' } })
  const requireStore = (req, res, next) => store ? next() : res.status(503).json({ message: 'Firebase is not configured. Please check the server setup.' })
  async function authenticate(req, res, next) {
    const token = req.get('authorization')?.match(/^Bearer (\S+)$/)?.[1]
    let claims
    try {
      claims = jwt.verify(token || '', secret, { ...tokenOptions, algorithms: ['HS256'] })
      if (typeof claims.sub !== 'string' || !/^[a-f0-9]{64}$/.test(claims.sub)) throw new Error('Invalid subject')
    } catch { return res.status(401).json({ message: 'Your session has expired or is invalid. Please log in.' }) }
    if (!store) return res.status(503).json({ message: 'Account service is unavailable.' })
    const user = await store.getUser(claims.sub)
    if (!user) return res.status(401).json({ message: 'Please log in again.' })
    req.account = { id: claims.sub, user, expiresAt: claims.exp * 1000 }; next()
  }
  app.post('/api/register', accountLimit, requireStore, async (req, res) => {
    const { name, email, password, confirmPassword } = req.body || {}
    if (![name, email, password, confirmPassword].every(v => typeof v === 'string')) return res.status(400).json({ message: 'Please complete all fields.' })
    const fullName = name.trim().replace(/\s+/g, ' '), cleanEmail = email.trim().toLowerCase()
    if (fullName.split(' ').length < 2 || fullName.length > 100) return res.status(400).json({ message: 'Enter your first and last name (up to 100 characters).' })
    if (!emailPattern.test(cleanEmail) || cleanEmail.length > 254) return res.status(400).json({ message: 'Enter a valid email address.' })
    if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) return res.status(400).json({ message: 'Use at least 8 characters and no more than 72 bytes for your password.' })
    if (password !== confirmPassword) return res.status(400).json({ message: 'Your passwords do not match.' })
    const passwordHash = await bcrypt.hash(password, 12)
    try { await store.createUser(userId(cleanEmail), { name: fullName, email: cleanEmail, passwordHash, plan: 'free', createdAt: new Date() }) }
    catch (error) {
      if (error.code === 6 || error.code === 'already-exists') return res.status(409).json({ message: 'This email already has an account. Please log in.' })
      throw error
    }
    res.status(201).json({ message: 'Account created. Please log in.' })
  })
  app.post('/api/login', accountLimit, requireStore, async (req, res) => {
    const { email, password } = req.body || {}
    if (typeof email !== 'string' || typeof password !== 'string' || !emailPattern.test(email.trim()) || email.length > 254 || !password || Buffer.byteLength(password, 'utf8') > 72) return res.status(400).json({ message: 'Enter a valid email and password.' })
    const id = userId(email.trim().toLowerCase()), user = await store.getUser(id)
    if (!user?.passwordHash || !await bcrypt.compare(password, user.passwordHash)) return res.status(401).json({ message: 'Incorrect email or password. Try again or sign up.' })
    const token = jwt.sign({}, secret, { ...tokenOptions, subject: id, algorithm: 'HS256', expiresIn: '1h' })
    res.json({ token, user: publicUser(id, user), expiresAt: jwt.decode(token).exp * 1000 })
  })
  app.get('/api/me', authenticate, (req, res) => res.json({ user: publicUser(req.account.id, req.account.user), expiresAt: req.account.expiresAt }))
  app.post('/api/upgrade', accountLimit, authenticate, async (req, res) => {
    if (req.account.user.plan === 'paid') return res.status(409).json({ message: 'You are already on the Paid plan.' })
    const errors = validatePayment(req.body)
    if (Object.keys(errors).length) return res.status(400).json({ message: 'Please correct your payment details.', errors })
    // Payment details are discarded; only the plan change is saved.
    if (!await store.upgradeUser(req.account.id)) return res.status(409).json({ message: 'You are already on the Paid plan.' })
    res.json({ message: 'Your Paid plan is active. This was a demonstration; no payment was taken.', user: publicUser(req.account.id, { ...req.account.user, plan: 'paid' }) })
  })
  app.post('/api/posts', authenticate, async (req, res) => {
    const body = req.body || {}, type = body.type
    const draft = Object.fromEntries(['title', 'abstract', 'body', 'tags'].map(key => [key, typeof body[key] === 'string' ? body[key] : '']))
    const errors = validatePost(type, draft)
    if (Object.keys(errors).length) return res.status(400).json({ message: 'Please correct the post fields.', errors })
    const id = await store.createPost({ type, title: draft.title.trim(), abstract: type === 'article' ? draft.abstract.trim() : '', body: draft.body.trim(), tags: draft.tags.split(',').map(t => t.trim()), authorId: req.account.id, authorName: req.account.user.name, createdAt: new Date() })
    res.status(201).json({ message: 'Your ' + type + ' has been saved successfully.', id })
  })
  app.post('/api/subscribe', rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, message: { message: 'Too many subscription requests. Try again later.' } }), async (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim() : ''
    if (!emailPattern.test(email) || email.length > 254) return res.status(400).json({ message: 'Please enter a valid email address.' })
    if (!sendWelcome) return res.status(503).json({ message: 'Newsletter service is not configured.' })
    try { await sendWelcome(email) } catch { return res.status(502).json({ message: 'Unable to send your welcome email. Please try again later.' }) }
    res.json({ message: 'Subscription successful! Your welcome email has been accepted for delivery.' })
  })
  app.use('/api', (req, res) => res.status(404).json({ message: 'API endpoint not found.' }))
  app.use((error, req, res, next) => {
    console.error('Request failed:', error.code || error.name)
    const status = [400, 413].includes(error.status) ? error.status : 500
    res.status(status).json({ message: status === 500 ? 'Unable to complete your request. Please check the service and try again.' : 'Invalid request.' })
  })
  return app
}
