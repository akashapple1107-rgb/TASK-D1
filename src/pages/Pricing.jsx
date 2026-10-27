import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import UpgradeModal from '../components/UpgradeModal'
const features = [
  ['Community articles and tutorials', 'Included', 'Included'],
  ['Questions and articles per month', '5 posts', 'Unlimited posts'],
  ['Learning resources', 'Free resources', 'Free + premium resources'],
  ['Image upload allowance', '2 MB per image', '10 MB per image'],
  ['Community support', 'Standard', 'Priority']
]
export default function Pricing() {
  const { user, loading, sessionError } = useAuth()
  const [open, setOpen] = useState(false), [message, setMessage] = useState('')
  const upgradeButton = useRef(null), isPaid = user?.plan === 'paid'
  function close() { setOpen(false); upgradeButton.current?.focus() }
  return <section className="pricing-page" aria-labelledby="pricing-heading">
    <div className="pricing-intro"><span className="eyebrow">Learn. Build. Share.</span><h1 id="pricing-heading">A plan for your next step.</h1><p>Start exploring for free, or make more room for your development journey.</p></div>
    {sessionError && <p className="error" role="alert">{sessionError}</p>}
    {message && <p className="upgrade-success" role="status">✓ {message}</p>}
    <div className="pricing-cards">
      <article className="pricing-card"><div className="plan-heading"><h2>Free</h2>{user && !isPaid && <span className="plan-badge">Your current plan</span>}</div><p>Find your feet in the community.</p><div className="price">A$0<span> / month</span></div><ul><li>Read community articles and tutorials</li><li>Share your first questions and ideas</li><li>Learn alongside other developers</li></ul>{!user ? <Link className="plan-link" to="/signup">Create a free account</Link> : <p className="plan-status">{isPaid ? 'You have all Free features included.' : 'You’re on the Free plan.'}</p>}</article>
      <article className="pricing-card paid-card"><div className="plan-heading"><h2>Paid</h2><span className="plan-badge">{isPaid ? 'Your current plan' : 'More possibilities'}</span></div><p>Go further with your next project.</p><div className="price">A$9<span> / month</span></div><ul><li>Everything in Free, plus premium resources</li><li>More space to post and share images</li><li>Priority community support</li></ul><button ref={upgradeButton} className="primary" disabled={loading || !user || isPaid} onClick={() => { setMessage(''); setOpen(true) }}>{loading ? 'Checking session…' : isPaid ? 'Paid plan active' : 'Upgrade Plan'}</button>{!loading && !user && <p className="plan-login"><Link to="/login" state={{ from: '/pricing' }}>Log in</Link> to upgrade your plan.</p>}</article>
    </div>
    <div className="comparison"><h2>Compare what’s included</h2><div className="comparison-scroll"><table><caption>Free and Paid plan comparison</caption><thead><tr><th scope="col">Feature</th><th scope="col">Free</th><th scope="col">Paid</th></tr></thead><tbody>{features.map(([feature, free, paid]) => <tr key={feature}><th scope="row">{feature}</th><td>{free}</td><td>{paid}</td></tr>)}</tbody></table></div></div>
    <p className="pricing-demo">Demo plans for this project. Prices, limits and premium features are illustrative; no billing or feature limits are applied.</p>
    {open && user && !isPaid && <UpgradeModal onClose={close} onSuccess={text => { setMessage(text); close() }} />}
  </section>
}
