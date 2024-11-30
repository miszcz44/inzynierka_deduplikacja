import React, { useState, useEffect } from 'react';

const ClassificationSidebar = ({ workflowId, onSave, onCancel }) => {
  const [columns, setColumns] = useState([]);
  const [classificationType, setClassificationType] = useState('threshold'); // Default to 'threshold'
  const [thresholdMatch, setThresholdMatch] = useState(0.5); // Default threshold match value
  const [columnWeights, setColumnWeights] = useState({});
  const [error, setError] = useState('');

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
        initializeWeights(uniqueColumns);
      } else {
        const err = await response.json();
        setError(err.detail || 'Failed to fetch file content');
      }
    } catch (e) {
      setError('An error occurred while fetching file content');
    }
  };

  const initializeWeights = (columns) => {
    // Initialize weights for all columns with a default value (e.g., 1)
    const initialWeights = columns.reduce((acc, column) => {
      acc[column] = 1; // Default weight
      return acc;
    }, {});
    setColumnWeights(initialWeights);
  };

  const handleWeightChange = (column, value) => {
    setColumnWeights((prev) => ({
      ...prev,
      [column]: Number(value),
    }));
  };

  const handleSave = () => {
    const dataToSave =
      classificationType === 'threshold'
        ? { classificationType, thresholdMatch }
        : { classificationType, columnWeights };
    console.log('Save Data:', dataToSave);
    onSave(dataToSave); // Pass data back to parent
  };

  return (
    <div className="sidebar">
      <h3>Classification Settings</h3>
      {error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <div className="input-group">
            <label htmlFor="classification-type">Classification Type:</label>
            <select
              id="classification-type"
              value={classificationType}
              onChange={(e) => setClassificationType(e.target.value)}
            >
              <option value="threshold">Threshold</option>
              <option value="weighted-threshold">Weighted Threshold</option>
            </select>
          </div>

          {/* Render fields based on selected classification type */}
          {classificationType === 'threshold' ? (
            <div className="input-group">
              <label htmlFor="threshold-match">Threshold Match:</label>
              <input
                id="threshold-match"
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={thresholdMatch}
                onChange={(e) => setThresholdMatch(Number(e.target.value))}
              />
            </div>
          ) : (
            <div className="weights-group">
              <h4>Column Weights</h4>
              {columns.map((column) => (
                <div key={column} className="input-group">
                  <label htmlFor={`weight-${column}`}>{column}:</label>
                  <input
                    id={`weight-${column}`}
                    type="number"
                    min="0"
                    step="0.1"
                    value={columnWeights[column] || 1}
                    onChange={(e) => handleWeightChange(column, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}
        </>
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

export default ClassificationSidebar;
