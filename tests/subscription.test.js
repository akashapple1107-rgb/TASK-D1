import test from 'node:test'
import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { createApp, tokenOptions, userId } from '../backend/app.js'
import { validatePayment } from '../src/paymentValidation.js'
import { memoryStore } from './memoryStore.js'

const secret = 'test-only-secret-that-is-not-used-by-the-real-server'
const account = { name: 'Alex Tester', email: 'alex@example.test', password: 'Example-pass-123', confirmPassword: 'Example-pass-123' }
const card = { name: 'Alex Tester', number: '4242 4242 4242 4242', expiry: '12/39', cvv: '123' }
async function setup(t, overrides = {}) {
  const store = memoryStore(), mail = []
  const app = createApp({ store, secret, sendWelcome: async email => mail.push(email), ...overrides })
  const server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve))
  t.after(() => new Promise(resolve => server.close(resolve)))
  const request = async (route, body, token) => {
    const response = await fetch('http://127.0.0.1:' + server.address().port + '/api/' + route, { method: body === undefined ? 'GET' : 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) })
    return { status: response.status, data: await response.json() }
  }
  const login = async () => { await request('register', account); return (await request('login', { email: account.email, password: account.password })).data.token }
  return { store, mail, request, login }
}
test('registration hashes passwords, normalizes email and cannot set a paid plan', async t => {
  const { store, request } = await setup(t)
  assert.equal((await request('register', { ...account, email: ' ALEX@example.test ', plan: 'paid' })).status, 201)
  const user = store.users.get(userId(account.email))
  assert.equal(user.plan, 'free'); assert.equal(user.password, undefined)
  assert.ok(await bcrypt.compare(account.password, user.passwordHash))
  assert.equal((await request('register', account)).status, 409)
  assert.equal((await request('register', { ...account, name: ' ', password: 'short' })).status, 400)
})
test('signed session restores user without exposing hashes', async t => {
  const { request, login } = await setup(t); const token = await login()
  const claims = jwt.verify(token, secret, { ...tokenOptions, algorithms: ['HS256'] })
  assert.equal(claims.sub, userId(account.email)); assert.equal(claims.exp - claims.iat, 3600)
  const me = await request('me', undefined, token)
  assert.equal(me.status, 200); assert.equal(me.data.user.plan, 'free'); assert.equal(me.data.user.passwordHash, undefined)
  assert.equal((await request('login', { email: account.email, password: 'wrong' })).status, 401)
})
test('missing, forged and expired JWTs cannot read session, upgrade or post', async t => {
  const { request, login } = await setup(t); await login()
  const expired = jwt.sign({}, secret, { ...tokenOptions, subject: userId(account.email), expiresIn: -1 })
  const forged = jwt.sign({}, 'wrong-secret', { ...tokenOptions, subject: userId(account.email), expiresIn: '1h' })
  for (const token of [undefined, forged, expired, 'invalid']) {
    assert.equal((await request('me', undefined, token)).status, 401)
    assert.equal((await request('upgrade', card, token)).status, 401)
    assert.equal((await request('posts', {}, token)).status, 401)
  }
})
test('upgrade validates on server, persists only plan, and blocks duplicate upgrades', async t => {
  const { store, request, login } = await setup(t); const token = await login()
  assert.equal((await request('upgrade', { ...card, number: '123' }, token)).status, 400)
  assert.equal((await request('me', undefined, token)).data.user.plan, 'free')
  assert.equal((await request('upgrade', card, token)).status, 200)
  assert.equal((await request('me', undefined, token)).data.user.plan, 'paid')
  assert.equal((await request('upgrade', card, token)).status, 409)
  const saved = JSON.stringify([...store.users.values()]); assert.ok(!saved.includes('4242')); assert.ok(!saved.includes('cvv')); assert.ok(!saved.includes('expiry'))
})
test('post storage uses authenticated author, validates content and supports both post types', async t => {
  const { store, request, login } = await setup(t); const token = await login()
  assert.equal((await request('posts', { type: 'article' }, token)).status, 400)
  const draft = { title: 'Learning React components', body: 'How should I organize my first React application?', tags: 'React, JavaScript', authorId: 'forged-id' }
  assert.equal((await request('posts', { ...draft, type: 'question' }, token)).status, 201)
  assert.equal((await request('posts', { ...draft, type: 'article', abstract: 'A short guide to organizing reusable React components.' }, token)).status, 201)
  assert.equal(store.posts.length, 2); assert.equal(store.posts[0].authorId, userId(account.email))
})
test('newsletter validates requests and invokes only the injected mail provider', async t => {
  const { request, mail } = await setup(t)
  assert.equal((await request('subscribe', { email: 'invalid' })).status, 400)
  assert.equal((await request('subscribe', { email: 'reader@example.test' })).status, 200)
  assert.deepEqual(mail, ['reader@example.test'])
})
test('service failures never report successful upgrades or email', async t => {
  const store = memoryStore(); store.upgradeUser = async () => { throw new Error('Unavailable') }
  const { request, login } = await setup(t, { store, sendWelcome: async () => { throw new Error('Unavailable') } })
  const token = await login()
  assert.equal((await request('upgrade', card, token)).status, 500)
  assert.equal((await request('me', undefined, token)).data.user.plan, 'free')
  assert.equal((await request('subscribe', { email: 'reader@example.test' })).status, 502)
})
test('payment validation handles expiry boundary, malformed types and invalid checksums', () => {
  const now = new Date(2026, 9, 27)
  assert.deepEqual(validatePayment({ ...card, expiry: '10/26' }, now), {})
  for (const expiry of ['09/26', '00/30', '13/30', 'abc']) assert.ok(validatePayment({ ...card, expiry }, now).expiry)
  for (const number of ['0000000000000', '4242424242424241', '42xx424242424242']) assert.ok(validatePayment({ ...card, number }, now).number)
  assert.equal(Object.keys(validatePayment(null, now)).length, 4)
  assert.ok(validatePayment({ ...card, cvv: '1a3' }, now).cvv)
})
