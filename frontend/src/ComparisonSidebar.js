import React, { useState, useEffect } from 'react';

const ComparisonSidebar = ({ workflowId, onSave, onCancel }) => {
  const [columns, setColumns] = useState([]);
  const [selectedAlgorithms, setSelectedAlgorithms] = useState({});
  const [qValue, setQValue] = useState(2); // Default value for Q-gram
  const [error, setError] = useState('');

  const algorithms = ['jaro-winkler', 'Q-gram'];

  useEffect(() => {
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

  const handleSave = async () => {
    const payload = {
      step: "FIELD_AND_RECORD_COMPARISON", // Specify the step name
      parameters: JSON.stringify({
        selectedAlgorithms,
        ...(Object.values(selectedAlgorithms).includes('Q-gram') && { qValue }), // Include qValue only if Q-gram is selected
      }),
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/api/workflow-step/${workflowId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log("Comparison step saved successfully");
        onSave();
      } else {
        const errorData = await response.json();
        console.error("Failed to save workflow step:", errorData.detail);
        alert("Error saving the workflow step: " + errorData.detail);
      }
    } catch (error) {
      console.error("An error occurred while saving the workflow step:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const hasQGramSelected = Object.values(selectedAlgorithms).includes('Q-gram');

  return (
    <div className="sidebar">
      <h3>Field and Record Comparison</h3>
      {error ? (
        <div className="error">{error}</div>
      ) : (
        <>
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

          {hasQGramSelected && (
            <div className="q-value-group">
              <label htmlFor="q-value">Q Value:</label>
              <input
                id="q-value"
                type="number"
                min="1"
                value={qValue}
                onChange={(e) => setQValue(Number(e.target.value))}
              />
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

export default ComparisonSidebar;
