import { useState } from 'react'
import './App.css'
import JobsPage from './Jobs'
import RunnersPage from './Runner'
import ScriptsPage from './Scripts'
import LogsPage from './Logs'

function App() {
  const [currentPage, setCurrentPage] = useState<'jobs' | 'runners' | 'scripts' | 'logs'>('jobs')

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'jobs':
        return <JobsPage />
      case 'runners':
        return <RunnersPage />
      case 'scripts':
        return <ScriptsPage />
      case 'logs':
        return <LogsPage />
      default:
        return <JobsPage />
    }
  }

  return (
    <div className="main-app">
      <nav className="main-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <h2>Dashboard</h2>
          </div>
          <div className="nav-links">
            <button 
              className={`nav-btn ${currentPage === 'jobs' ? 'active' : ''}`}
              onClick={() => setCurrentPage('jobs')}
            >
              Jobs
            </button>
            <button 
              className={`nav-btn ${currentPage === 'runners' ? 'active' : ''}`}
              onClick={() => setCurrentPage('runners')}
            >
              Runners
            </button>
            <button 
              className={`nav-btn ${currentPage === 'scripts' ? 'active' : ''}`}
              onClick={() => setCurrentPage('scripts')}
            >
              Scripts
            </button>
            <button 
              className={`nav-btn ${currentPage === 'logs' ? 'active' : ''}`}
              onClick={() => setCurrentPage('logs')}
            >
              Logs
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {renderCurrentPage()}
      </main>
    </div>
  )
}

export default App
