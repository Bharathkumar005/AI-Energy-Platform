import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SidebarLayout from './components/SidebarLayout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import AIInsights from './pages/AIInsights';
import DataExplorer from './pages/DataExplorer';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<SidebarLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="ai-insights" element={<AIInsights />} />
              <Route path="explorer" element={<DataExplorer />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
