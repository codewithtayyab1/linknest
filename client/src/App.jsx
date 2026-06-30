import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Settings   from './pages/Settings';
import Analytics  from './pages/Analytics';
import PublicProfile from './pages/PublicProfile';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/settings"
            element={<ProtectedRoute><Settings /></ProtectedRoute>}
          />
          <Route
            path="/analytics"
            element={<ProtectedRoute><Analytics /></ProtectedRoute>}
          />
          {/* /:username must be last — catches everything not matched above */}
          <Route path="/:username" element={<PublicProfile />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
