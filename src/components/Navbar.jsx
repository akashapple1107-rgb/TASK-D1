import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
export default function Navbar() {
  const { user, loading, logout } = useAuth(); const navigate = useNavigate()
  return <header className="navbar">
    <Link className="brand" to="/">DEV@Deakin</Link>
    <div className="search-box"><span aria-hidden="true" className="search-icon" /><input aria-label="Search (available in a future task)" placeholder="Search..." disabled /></div>
    <Link className="nav-post" to="/post">Post</Link><Link className="nav-post" to="/pricing">Pricing</Link>
    {loading ? <span className="session-label">Checking session…</span> : user ? <><span className="plan-badge">{user.plan === 'paid' ? 'Paid plan' : 'Free plan'}</span><span className="session-name" title={user.name}>{user.name}</span><button className="logout-button" onClick={() => { logout(); navigate('/') }}>Logout</button></> : <Link className="nav-login" to="/login">Login</Link>}
  </header>
}
