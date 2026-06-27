import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Tasks from './pages/Tasks'
import Finance from './pages/Finance'
import Projects from './pages/Projects'
import Notes from './pages/Notes'
import FuturePlans from './pages/FuturePlans'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/tasks" replace />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="finance" element={<Finance />} />
          <Route path="projects" element={<Projects />} />
          <Route path="notes" element={<Notes />} />
          <Route path="plans" element={<FuturePlans />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
