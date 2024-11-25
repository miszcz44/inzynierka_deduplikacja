import React, { useState, useEffect } from 'react';

const ComparisonSidebar = ({ workflowId, onSave, onCancel }) => {
  const [columns, setColumns] = useState([]);
  const [selectedAlgorithms, setSelectedAlgorithms] = useState({});
  const [error, setError] = useState('');

  const algorithms = ['jaro-winkler', 'Q-gram', 'soundex', 'levenshtein'];

  useEffect(() => {
    // Fetch file content when component loads
    fetchFileContent();
  }, [workflowId]);

  const fetchFileContent = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/workflows/${workflowId}/file-content`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const uniqueColumns = data.columns || [];
        setColumns(uniqueColumns);
        initializeAlgorithms(uniqueColumns);
      } else {
        const err = await response.json();
        setError(err.detail || 'Failed to fetch file content');
      }
    } catch (e) {
      setError('An error occurred while fetching file content');
    }
  };

  const initializeAlgorithms = (columns) => {
    // Initialize dropdown state with default algorithm (e.g., 'jaro-winkler')
    const initialState = columns.reduce((acc, column) => {
      acc[column] = 'jaro-winkler';
      return acc;
    }, {});
    setSelectedAlgorithms(initialState);
  };

  const handleAlgorithmChange = (column, value) => {
    setSelectedAlgorithms((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  const handleSave = () => {
    // Example save logic
    console.log('Selected algorithms:', selectedAlgorithms);
    onSave(selectedAlgorithms); // Pass data back to parent
  };

  return (
    <div className="sidebar">
      <h3>Field and Record Comparison</h3>
      {error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="dropdown-group">
          {columns.map((column) => (
            <div key={column} className="input-group">
              <label htmlFor={`algorithm-${column}`}>{column}</label>
              <select
                id={`algorithm-${column}`}
                value={selectedAlgorithms[column] || 'jaro-winkler'}
                onChange={(e) => handleAlgorithmChange(column, e.target.value)}
              >
                {algorithms.map((algo) => (
                  <option key={algo} value={algo}>
                    {algo}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      <div className="button-group">
        <button className="save-button" onClick={handleSave}>
          Save
        </button>
        <button className="cancel-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ComparisonSidebar;
