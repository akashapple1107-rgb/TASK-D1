export function validatePayment(payment = {}, now = new Date()) {
  const errors = {}
  const name = typeof payment?.name === 'string' ? payment.name.trim() : ''
  const raw = typeof payment?.number === 'string' ? payment.number : ''
  const number = raw.replace(/[ -]/g, '')
  if (name.length < 2 || name.length > 100) errors.name = 'Enter the cardholder name (2–100 characters).'
  let sum = 0
  for (let i = number.length - 1, double = false; i >= 0; i--, double = !double) {
    let digit = Number(number[i])
    if (double) { digit *= 2; if (digit > 9) digit -= 9 }
    sum += digit
  }
  if (!/^[\d -]+$/.test(raw) || !/^\d{13,19}$/.test(number) || /^0+$/.test(number) || sum % 10 !== 0) errors.number = 'Enter a valid card number. For this demo use 4242 4242 4242 4242.'
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(typeof payment?.expiry === 'string' ? payment.expiry.trim() : '')
  if (!match) errors.expiry = 'Use MM/YY, for example 12/30.'
  else if ((2000 + Number(match[2])) * 12 + Number(match[1]) < now.getFullYear() * 12 + now.getMonth() + 1) errors.expiry = 'The card has expired.'
  if (typeof payment?.cvv !== 'string' || !/^\d{3,4}$/.test(payment.cvv)) errors.cvv = 'Enter a 3 or 4 digit security code.'
  return errors
}
