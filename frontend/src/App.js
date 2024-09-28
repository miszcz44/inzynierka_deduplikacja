import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import api from './api';
import Login from './Login';
import Register from './Register';
import FileUpload from './FileUpload';
import UserTables from './UserTables';
import UserTable from './UserTable';
import ProtectedRoute from './ProtectedRoute';
import BlockBuilding from './BlockBuilding';
// import RollingWindow from './RollingWindow';
// import SuffixTable from './SuffixTable';

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

  return (
    <Router>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/version" element={<Version />} />
            <Route path="/upload" element={
                <ProtectedRoute>
                    <FileUpload />
                </ProtectedRoute>
            } />
            <Route path="/user/tables" element={
                <ProtectedRoute>
                    <UserTables />
                </ProtectedRoute>
            } />
            <Route path="/user/table/:table_id" element={
                <ProtectedRoute>
                    <UserTable />
                </ProtectedRoute>
            } />
            <Route path="/block_building/:table_id" element={
                <ProtectedRoute>
                    <BlockBuilding />
                </ProtectedRoute>
            } />
                {/*<Route path="/block_building/rolling_window" element={*/}
                {/*    <ProtectedRoute>*/}
                {/*        <RollingWindow />*/}
                {/*    </ProtectedRoute>*/}
                {/*} />*/}
                {/*<Route path="/block_building/suffix_table" element={*/}
                {/*    <ProtectedRoute>*/}
                {/*        <SuffixTable />*/}
                {/*    </ProtectedRoute>*/}
                {/*} />*/}
        </Routes>
    </Router>
  );
};

export default App;
