import test from 'node:test'
import assert from 'node:assert/strict'
import { validatePost } from './postValidation.js'

const valid = { title: 'How do React hooks work?', body: 'I would like to understand state updates in React.', abstract: 'An introduction to state updates and React hooks.', tags: 'React, JavaScript' }
test('accepts a valid question and article', () => {
  assert.deepEqual(validatePost('question', valid), {})
  assert.deepEqual(validatePost('article', valid), {})
})
test('rejects whitespace-only required values', () => {
  assert.deepEqual(Object.keys(validatePost('article', { title: ' ', body: ' ', abstract: ' ', tags: ' ' })).sort(), ['abstract', 'body', 'tags', 'title'])
})
test('question does not require an abstract; article does', () => {
  assert.deepEqual(validatePost('question', { ...valid, abstract: '' }), {})
  assert.ok(validatePost('article', { ...valid, abstract: '' }).abstract)
})
test('rejects too many, duplicate, empty, and invalid tags', () => {
  for (const tags of ['a,b,c,d', 'React, react', 'React,', '<script>', 'x'.repeat(26)]) {
    assert.ok(validatePost('question', { ...valid, tags }).tags)
  }
})
test('enforces upper limits and single paragraph abstract', () => {
  assert.ok(validatePost('question', { ...valid, title: 'x'.repeat(121) }).title)
  assert.ok(validatePost('question', { ...valid, body: 'x'.repeat(10001) }).body)
  assert.ok(validatePost('article', { ...valid, abstract: 'x'.repeat(501) }).abstract)
  assert.ok(validatePost('article', { ...valid, abstract: valid.abstract + '\n\nAnother paragraph.' }).abstract)
})
