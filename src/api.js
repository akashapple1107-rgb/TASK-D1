export const SESSION_KEY = 'dev-deakin-d1-token'
export async function api(endpoint, values, options = {}) {
  const token = options.token ?? localStorage.getItem(SESSION_KEY)
  let response, result
  try {
    response = await fetch('/api/' + endpoint, {
      method: values === undefined ? 'GET' : 'POST',
      headers: { ...(values === undefined ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      body: values === undefined ? undefined : JSON.stringify(values), signal: options.signal
    }); result = await response.json()
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('Cannot connect to the server. Please try again.')
  }
  if (!response.ok) {
    if (response.status === 401 && token && endpoint !== 'login') window.dispatchEvent(new Event('session-expired'))
    const error = new Error(result.message || 'Please try again.'); error.status = response.status; error.fields = result.errors; throw error
  }
  return result
}
