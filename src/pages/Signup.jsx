import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  function changeName(event) {
    setName(event.target.value)
  }

  function changeEmail(event) {
    setEmail(event.target.value)
  }

  function changePassword(event) {
    setPassword(event.target.value)
  }

  function changeConfirmPassword(event) {
    setConfirmPassword(event.target.value)
  }

  let buttonText = 'Create'
  if (busy) {
    buttonText = 'Creating...'
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    // Split the full name at spaces, tabs or new lines.
    const nameParts = name.trim().split(/\s+/)
    if (nameParts.length < 2) {
      setError('Enter your first and last name.')
      return
    }

    // Bcrypt accepts at most 72 bytes. Some characters use more than one byte.
    const passwordBytes = new TextEncoder().encode(password)
    if (passwordBytes.length > 72) {
      setError('Your password must be no more than 72 bytes.')
      return
    }

    if (password !== confirmPassword) {
      setError('Your passwords do not match.')
      return
    }
    setBusy(true)
    try {
      const account = { name, email, password, confirmPassword }
      const result = await api('register', account)
      navigate('/login', { replace: true, state: { message: result.message } })
    } catch (error) {
      setError(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="auth-area" aria-labelledby="signup-heading">
      <div className="register-card">
        <h1 id="signup-heading">Create a DEV@Deakin Account</h1>
        <form className="register-form" onSubmit={handleSubmit}>
          <label htmlFor="name">Name*</label>
          <input id="name" name="name" autoComplete="name" title="Enter your first and last name" maxLength={100} value={name} onChange={changeName} required />
          <label htmlFor="email">Email*</label>
          <input id="email" name="email" type="email" autoComplete="email" maxLength={254} value={email} onChange={changeEmail} required />
          <label htmlFor="password">Password*</label>
          <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} title="At least 8 characters, up to 72 bytes" value={password} onChange={changePassword} required />
          <label htmlFor="confirmPassword">Confirm password*</label>
          <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={changeConfirmPassword} required />
          {error && <p className="message error" role="alert">{error}</p>}
          <button className="primary" type="submit" disabled={busy}>{buttonText}</button>
        </form>
      </div>
    </section>
  )
}
