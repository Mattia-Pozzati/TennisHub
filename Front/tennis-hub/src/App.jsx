import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'

import HomePage from './pages/HomePage'
import TeamHomePage from './pages/TeamHomePage'
import TournamentVisual from './components/TournamentVisual'
import TournamentPage from './pages/TournamentPage'

function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/team-home-page" element={<TeamHomePage />} />
          <Route path="/tournament/:id" element={<TournamentVisual />} />
          <Route path="/tournament" element={<TournamentPage />} />
        </Routes>
      </Router>
  )
}

export default App
