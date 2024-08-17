import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import api from './api';
import Login from './Login';
import Register from './Register';
import ProtectedPage from './Protected';
// import FileUpload from './FileUpload';

const Home = () => (
    <div>
        <h1>Welcome to Our App</h1>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Link to="/login">
                <div style={{ padding: '20px', border: '1px solid black', cursor: 'pointer' }}>Login</div>
            </Link>
            <Link to="/register">
                <div style={{ padding: '20px', border: '1px solid black', cursor: 'pointer' }}>Register</div>
            </Link>
        </div>
    </div>
);

const Version = () => {
  const [version, setVersion] = useState('');

  const fetchVersion = async () => {
    try {
      const response = await api.get('/');
      setVersion(response.data);
    } catch (error) {
      console.error('Error fetching version:', error);
    }
  };

  useEffect(() => {
    fetchVersion();
  }, []);

  return (
    <div>
      <h1>App Version</h1>
      <h1>{version}</h1>
    </div>
  );
};

const App = () => {
  // You can set a hardcoded userId or fetch it dynamically
  const userId = 1;

  return (
    <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path={'/login'} element={<Login />} />
          <Route path={'/register'} element={<Register />} />
          <Route path={'/protected'} element={<ProtectedPage />} />
          <Route path="/version" element={<Version />} />
        </Routes>
    </Router>
  );
};

export default App;
