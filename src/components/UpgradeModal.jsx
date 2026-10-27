import { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../AuthContext'
import { validatePayment } from '../paymentValidation'
export default function UpgradeModal({ onClose, onSuccess }) {
  const dialog = useRef(null); const { setUser } = useAuth()
  const [payment, setPayment] = useState({ name: '', number: '', expiry: '', cvv: '' })
  const [errors, setErrors] = useState({}), [error, setError] = useState(''), [busy, setBusy] = useState(false)
  useEffect(() => { const element = dialog.current; element.showModal(); return () => element.close() }, [])
  function change(event) {
    const { name, value } = event.target
    setPayment(current => ({ ...current, [name]: value })); setErrors(current => ({ ...current, [name]: '' })); setError('')
  }
  async function submit(event) {
    event.preventDefault(); if (busy) return
    const invalid = validatePayment(payment); setErrors(invalid); setError('')
    if (Object.keys(invalid).length) { dialog.current.querySelector('[name="' + Object.keys(invalid)[0] + '"]').focus(); return }
    setBusy(true)
    try {
      const result = await api('upgrade', payment)
      setPayment({ name: '', number: '', expiry: '', cvv: '' }); setUser(result.user); onSuccess(result.message)
    } catch (failure) { setError(failure.message); if (failure.fields) setErrors(failure.fields) }
    finally { setBusy(false) }
  }
  const fields = [['name', 'Cardholder name', 'Alex Taylor', 100], ['number', 'Card number', '4242 4242 4242 4242', 23], ['expiry', 'Expiry date', 'MM/YY', 5], ['cvv', 'Security code', '123', 4]]
  return <dialog ref={dialog} className="upgrade-modal" aria-labelledby="upgrade-heading" onCancel={event => { event.preventDefault(); if (!busy) onClose() }}>
    <div className="modal-top"><span className="eyebrow">DEV@Deakin Paid</span><button aria-label="Close payment form" disabled={busy} onClick={onClose}>×</button></div>
    <h2 id="upgrade-heading">Upgrade your plan</h2>
    <p className="demo-notice">Demonstration checkout. No money is charged. Use the test card <strong>4242 4242 4242 4242</strong>, a future expiry and any 3-digit code.</p>
    <form onSubmit={submit} noValidate autoComplete="off">
      <div className="payment-fields">{fields.map(([name, label, placeholder, maxLength]) => <div className={'payment-field field-' + name} key={name}>
        <label htmlFor={'payment-' + name}>{label}</label>
        <input id={'payment-' + name} name={name} type={name === 'cvv' ? 'password' : 'text'} inputMode={name === 'number' || name === 'cvv' ? 'numeric' : 'text'} placeholder={placeholder} value={payment[name]} onChange={change} maxLength={maxLength} disabled={busy} required aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? 'payment-error-' + name : undefined} />
        {errors[name] && <p role="alert" className="error" id={'payment-error-' + name}>{errors[name]}</p>}
      </div>)}</div>
      <p className="payment-note">Card details are used only for validation and are never saved.</p>
      {error && <p role="alert" className="error">{error}</p>}
      <button className="primary upgrade-submit" disabled={busy}>{busy ? 'Activating…' : 'Confirm demo upgrade'}</button>
      <button type="button" className="cancel-upgrade" disabled={busy} onClick={onClose}>Keep my Free plan</button>
    </form>
  </dialog>
}
