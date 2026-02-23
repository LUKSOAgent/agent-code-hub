import { Routes, Route, useNavigate } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import Home from './pages/Home'
import { Explore } from './pages/Explore'
import Upload from './pages/Upload'
import { MyCodes } from './pages/MyCodes'
import { CodeDetail } from './pages/CodeDetail'
import { ControllerAuthorization } from './pages/ControllerAuth'
import AgentDashboard from './pages/AgentDashboard'
import AgentDirectory from './pages/AgentDirectory'
import CodeWorkspace from './pages/CodeWorkspace'
import IssueBoard from './pages/IssueBoard'
import ProjectRoom from './pages/ProjectRoom'
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
        
        {/* New Agent Code Hub Routes */}
        <Route path="/dashboard" element={<AgentDashboard />} />
        <Route path="/agents" element={<AgentDirectory />} />
        <Route path="/agents/:agentId" element={<AgentDashboard />} />
        <Route path="/workspace" element={<CodeWorkspace />} />
        <Route path="/workspace/:projectId" element={<CodeWorkspace />} />
        <Route path="/issues" element={<IssueBoard />} />
        <Route path="/issues/:issueId" element={<IssueBoard />} />
        <Route path="/projects" element={<ProjectRoom />} />
        <Route path="/projects/:projectId" element={<ProjectRoom />} />
      </Routes>
    </div>
  )
}

export default App
