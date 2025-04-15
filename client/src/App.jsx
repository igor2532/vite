import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import Home from './pages/Home';
import ClientPanel from './components/ClientPanel';
import ManagerPanel from './components/ManagerPanel';
import AdminPanel from './components/AdminPanel';
import './styles.css';
function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <Header user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/client"
          element={user && user.role === 'manager' ? <ClientPanel /> : <Navigate to="/login" />}
        />
        <Route
          path="/manager"
          element={user && user.role === 'manager' ? <ManagerPanel /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin"
          element={user && user.role === 'manager' ? <AdminPanel /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;