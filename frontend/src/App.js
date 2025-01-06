import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import api from './api';
import Login from './Login';
import Register from './Register';
import FileUpload from './FileUpload';
import UserTables from './UserTables';
import UserTable from './UserTable';
import Dashboard from "./Dashboard";
import Settings from "./Settings"
import Statistics from "./Statistics";
import ProtectedRoute from './ProtectedRoute';
import WorkflowSteps from "./WorkflowSteps";
import ProjectDetails from "./ProjectDetails";
import ProjectList from "./ProjectList"
import StatisticsView from "./StatisticsView";
import ReadableStatisticsView from "./ReadableStatisticsView";
import StatisticsList from "./StatisticsList";

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
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/version" element={<Version />} />
            <Route path="*" element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } />
            <Route path="/settings" element={
                <ProtectedRoute>
                    <Settings />
                </ProtectedRoute>
            } />
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
            <Route path="/projects/:projectId" element={
                <ProtectedRoute>
                    <ProjectDetails />
                </ProtectedRoute>
            } />
            <Route path="/workflow/:workflowId" element={
                <ProtectedRoute>
                    <WorkflowSteps />
                </ProtectedRoute>
            } />
            <Route path="/projects" element={
                <ProtectedRoute>
                    <ProjectList />
                </ProtectedRoute>
            } />
            <Route path="workflow/statistics/:workflowId" element={
                <ProtectedRoute>
                    <StatisticsView />
                </ProtectedRoute>
            } />
            <Route path="/statistics/:statisticsId" element={
                <ProtectedRoute>
                    <ReadableStatisticsView />
                </ProtectedRoute>
            } />
            <Route path="/statistics" element={
                <ProtectedRoute>
                    <StatisticsList/>
                </ProtectedRoute>
            } />
        </Routes>
    </Router>
  );
};

export default App;
