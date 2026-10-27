import { Link } from 'react-router-dom'
export default function Footer() {
  return <footer className="footer">
    <div className="footer-content">
      <div><h3>Explore</h3><p><Link to="/">Home</Link></p><p><Link to="/post">Questions</Link></p><p><a href="/#articles">Articles</a></p><p><a href="/#tutorials">Tutorials</a></p></div>
      <div><h3>Support</h3><p>FAQs</p><p>Help</p><p>Contact Us</p></div>
      <div><h3>Stay connected</h3><div className="social-icons" aria-label="Social media"><span aria-label="Facebook">f</span><span aria-label="Twitter"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M22 5.9a8.2 8.2 0 0 1-2.4.7 4.2 4.2 0 0 0 1.8-2.3 8.4 8.4 0 0 1-2.7 1 4.2 4.2 0 0 0-7.2 3.8 11.9 11.9 0 0 1-8.6-4.4 4.2 4.2 0 0 0 1.3 5.6 4.2 4.2 0 0 1-1.9-.5v.1a4.2 4.2 0 0 0 3.4 4.1 4.2 4.2 0 0 1-1.9.1 4.2 4.2 0 0 0 3.9 2.9A8.4 8.4 0 0 1 2.5 19H1.5a11.8 11.8 0 0 0 6.4 1.9c7.7 0 11.9-6.4 11.9-11.9v-.5A8.5 8.5 0 0 0 22 5.9z" /></svg></span><span aria-label="Instagram">◎</span></div></div>
    </div>
    <div className="footer-bottom"><h2>DEV@Deakin 2026</h2><div className="footer-policies"><span>Privacy Policy</span><span>Terms</span><span>Code of Conduct</span></div></div>
  </footer>
}
