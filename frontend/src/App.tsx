import { Routes, Route, useNavigate } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import Home from './pages/Home'
import { Explore } from './pages/Explore'
import Upload from './pages/Upload'
import { MyCodes } from './pages/MyCodes'
import { CodeDetail } from './pages/CodeDetail'
import { ControllerAuthorization } from './pages/ControllerAuth'
import './index.css'

function App() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/code/:id" element={<CodeDetail />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/my-codes" element={<MyCodes />} />
        <Route path="/add-controller" element={<ControllerAuthorization onBack={() => navigate('/')} />} />
      </Routes>
    </div>
  )
}

export default App
