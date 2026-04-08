import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SidebarLayout from './components/SidebarLayout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import AIInsights from './pages/AIInsights';
import DataExplorer from './pages/DataExplorer';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SidebarLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="ai-insights" element={<AIInsights />} />
          <Route path="explorer" element={<DataExplorer />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
