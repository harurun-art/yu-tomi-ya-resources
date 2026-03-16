import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import DashboardPage from './pages/DashboardPage';
import ResourcesPage from './pages/ResourcesPage';
import ProgressPage from './pages/ProgressPage';
import CalendarPage from './pages/CalendarPage';
import MembersPage from './pages/MembersPage';
import AssistantPage from './pages/AssistantPage';

function App() {
  return (
    <div className="app-container">
      {/* Global Header (Optional, but nice for branding if we don't have one in Nav) */}
      <header className="app-header" style={{ padding: '0.5rem 1rem', background: 'var(--color-primary)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>新規企画班ポータル</span>
        </div>
      </header>

      {/* Navigation Tab Bar */}
      <Navigation />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/assistant" element={<AssistantPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
