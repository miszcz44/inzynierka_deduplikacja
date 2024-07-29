import React, { useState, useEffect } from 'react';
import api from './api';

const App = () => {
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

export default App;
