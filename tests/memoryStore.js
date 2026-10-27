// Tests only: no Firebase connection, no disk persistence and no outgoing mail.
export function memoryStore() {
  const users = new Map(), posts = []
  return {
    users, posts,
    async getUser(id) { return users.has(id) ? { ...users.get(id) } : null },
    async createUser(id, data) { if (users.has(id)) throw Object.assign(new Error('Duplicate'), { code: 6 }); users.set(id, { ...data }) },
    async upgradeUser(id) { const user = users.get(id); if (user.plan === 'paid') return false; users.set(id, { ...user, plan: 'paid', upgradedAt: new Date() }); return true },
    async createPost(data) { posts.push(data); return String(posts.length) }
  }
}
