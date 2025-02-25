import './App.css';
import { Route, Routes, Navigate } from 'react-router-dom';
import Home from './components/Home';
import UserAuth from './components/Auth/UserAuth';

function App() {

  const checkTokenValidity = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decoding JWT payload
      const isExpired = payload.exp * 1000 < Date.now(); // Check expiration
      if (isExpired) {
        localStorage.removeItem('token');
        return false;
      }
      return true;
    } catch (err) {
      localStorage.removeItem('token');
      return false;
    }
  };

  const ProtectedRoute = ({ children }) => {
    if (!checkTokenValidity()) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<UserAuth />} />
      <Route path="/register" element={<UserAuth />} />

      <Route
        path="*"
        element={<ProtectedRoute><Home /></ProtectedRoute>}
      >
        
      </Route>
    </Routes>
  );
}

export default App;
