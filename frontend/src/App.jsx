import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Technician from './pages/Technician';
import User from './pages/User';
import Kanban from './pages/Kanban';
import CreateRequest from './pages/CreateRequest';
import ProtectedRoute, { AdminProtectedRoute } from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin-dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
          <Route path="/technician" element={<ProtectedRoute allowedRoles={['technician']}><Technician /></ProtectedRoute>} />
          <Route path="/user" element={<ProtectedRoute allowedRoles={['user']}><User /></ProtectedRoute>} />
          <Route path="/kanban" element={<ProtectedRoute allowedRoles={['technician']}><Kanban /></ProtectedRoute>} />
          <Route path="/create-request" element={<ProtectedRoute allowedRoles={['user']}><CreateRequest /></ProtectedRoute>} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
