import dotenv from 'dotenv'
import express from 'express'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import sgMail from '@sendgrid/mail'
import { createApp } from './backend/app.js'
const root = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(root, '.env'), quiet: true })
const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
let store
if (keyPath && existsSync(path.resolve(root, keyPath))) {
  initializeApp({ credential: cert(JSON.parse(readFileSync(path.resolve(root, keyPath), 'utf8'))) })
  const db = getFirestore(), users = db.collection('users')
  store = {
    async getUser(id) { const doc = await users.doc(id).get(); return doc.exists ? doc.data() : null },
    async createUser(id, data) { await users.doc(id).create(data) },
    async upgradeUser(id) {
      return db.runTransaction(async tx => {
        const ref = users.doc(id), doc = await tx.get(ref)
        if (!doc.exists) throw new Error('Account missing')
        if (doc.data().plan === 'paid') return false
        tx.update(ref, { plan: 'paid', upgradedAt: new Date() }); return true
      })
    },
    async createPost(data) { return (await db.collection('posts').add(data)).id }
  }
} else console.warn('Firebase setup is missing. Account and post services are unavailable.')
let sendWelcome
if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  sendWelcome = async email => {
    const [result] = await sgMail.send({ to: email, from: { email: process.env.SENDGRID_FROM_EMAIL, name: 'DEV@Deakin' }, subject: 'Welcome to DEV@Deakin!', text: 'Thank you for subscribing to the DEV@Deakin Daily Insider! Follow our web development articles and tutorials.' })
    console.log('SendGrid status:', result.statusCode, '| Subscription HTTP status: 200')
  }
}
const app = createApp({ store, secret: process.env.JWT_SECRET, sendWelcome })
const dist = path.join(root, 'dist')
if (existsSync(dist)) {
  app.use(express.static(dist)); app.get('/{*path}', (req, res) => res.sendFile(path.join(dist, 'index.html')))
}
const port = Number(process.env.PORT || 3002)
app.listen(port, '127.0.0.1', error => {
  if (error) { console.error('Could not start D1 server:', error.code); process.exitCode = 1; return }
  console.log('DEV@Deakin D1 server: http://127.0.0.1:' + port)
})
