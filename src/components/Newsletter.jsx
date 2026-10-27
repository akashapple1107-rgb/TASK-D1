import { useState } from 'react'

function Newsletter() {
  const [emailValue, setEmailValue] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function changeEmail(event) {
    setEmailValue(event.target.value)
    setError('')
    setStatus('')
  }

  async function subscribe(event) {
    event.preventDefault()
    if (busy) {
      return
    }
    setStatus('')
    setError('')

    const email = emailValue.trim()
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email) || email.length > 254) {
      setError('Please enter a valid email address.')
      return
    }

    setBusy(true)
    try {
      // JSON converts form values into a format the backend can read.
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      })
      const result = await response.json()

      if (!result || typeof result.message !== 'string') {
        setError('The backend returned an unexpected reply. Please try again.')
      } else if (response.ok) {
        setStatus(result.message)
        setEmailValue('')
      } else {
        setError(result.message)
      }
    } catch {
      setError('Cannot send your request. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  let buttonText = 'Subscribe'
  if (busy) {
    buttonText = 'Sending...'
  }

  return (
    <section className="newsletter">
      <h2>SIGN UP FOR OUR DAILY INSIDER</h2>
      <form onSubmit={subscribe} noValidate>
        <input
          type="email"
          aria-label="Newsletter email address"
          placeholder="Enter your email"
          value={emailValue}
          onChange={changeEmail}
          maxLength={254}
          autoComplete="email"
          disabled={busy}
          aria-invalid={Boolean(error)}
          aria-describedby="newsletter-result"
          required
        />
        <button type="submit" disabled={busy}>{buttonText}</button>
      </form>
      <div id="newsletter-result" aria-live="polite">
        {status && <p className="success" role="status">{status}</p>}
        {error && <p className="error" role="alert">{error}</p>}
      </div>
    </section>
  )
}

export default Newsletter
