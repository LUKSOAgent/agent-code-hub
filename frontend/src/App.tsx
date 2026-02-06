import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import Home from './pages/Home'
import { Explore } from './pages/Explore'
import Upload from './pages/Upload'
import { MyCodes } from './pages/MyCodes'
import './index.css'

function App() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/my-codes" element={<MyCodes />} />
      </Routes>
    </div>
  )
}

export default App
