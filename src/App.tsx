import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components';
import { JobsPage, RunnersPage, ScriptsPage, LogsPage, ScriptDetailPage } from './pages';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/jobs" replace />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="runners" element={<RunnersPage />} />
          <Route path="scripts" element={<ScriptsPage />} />
          <Route path="scripts/:scriptId" element={<ScriptDetailPage />} />
          <Route path="logs" element={<LogsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
