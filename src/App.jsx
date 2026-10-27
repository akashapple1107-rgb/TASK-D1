import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import NewPost from './pages/NewPost'
import Pricing from './pages/Pricing'
import './styles.css'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/post" element={<NewPost />} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
