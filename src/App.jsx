
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import Explore from './pages/Explore'
import OpportunityDetails from './pages/OpportunityDetails'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CreateOpportunity from './pages/CreateOpportunity'
import OrganizationDashboard from './pages/OrganizationDashboard'
import AdminDashboard from './pages/AdminDashboard'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explorar" element={<Explore />} />
        <Route path="/login" element={<Login />} />
        <Route path="/minha-conta" element={<Dashboard />} />
        <Route path="/oportunidade/:id" element={<OpportunityDetails />} />
        <Route path="/cadastrar-oportunidade" element={<CreateOpportunity />} />
        <Route path="/painel" element={<OrganizationDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
