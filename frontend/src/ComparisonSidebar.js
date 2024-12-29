import React, { useState, useEffect } from "react";

const ComparisonSidebar = ({ workflowId, onSave, onCancel, lastStep, activeStepId }) => {
  const [columns, setColumns] = useState([]);
  const [selectedAlgorithms, setSelectedAlgorithms] = useState({});
  const [qValue, setQValue] = useState(2); // Default value for Q-gram
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // Loading state

  const algorithms = ["Jaro-Winkler", "Q-gram", "Levenshtein"];

    const stepOrder = [
    'DATA_PREPROCESSING',
    'BLOCK_BUILDING',
    'FIELD_AND_RECORD_COMPARISON',
    'CLASSIFICATION',
    'EVALUATION',
  ];

  const activeStepIndex = stepOrder.indexOf(stepOrder[activeStepId - 2]);
  const lastStepIndex = stepOrder.indexOf(lastStep);

  const shouldWarn = activeStepIndex < lastStepIndex;

  // Fetch the existing comparison parameters
  useEffect(() => {
    fetchData();
  }, [workflowId]);

  const fetchData = async () => {
    setLoading(true); // Start loading
    try {
      const token = localStorage.getItem("token");

      // Fetch file content
      const fileResponse = await fetch(
        `http://localhost:8000/api/workflows/${workflowId}/file-content`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!fileResponse.ok) {
        throw new Error("Failed to fetch file content.");
      }

      const fileData = await fileResponse.json();
      const uniqueColumns = fileData.columns || [];

      const filteredColumns = uniqueColumns.filter((column) => column !== "ID");
      setColumns(filteredColumns);

      // Initialize algorithms with default values
      const initialAlgorithms = filteredColumns.reduce((acc, column) => {
        acc[column] = "Jaro-Winkler"; // Default value for each column
        return acc;
      }, {});

      // Update selected algorithms with initial value
      setSelectedAlgorithms(initialAlgorithms);

      // Fetch existing step parameters
      const stepResponse = await fetch(
        `http://localhost:8000/api/workflow-step/${workflowId}/step?step_name=FIELD_AND_RECORD_COMPARISON`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (stepResponse.ok) {
        const stepData = await stepResponse.json();

        if (stepData.parameters) {
          const parameters = stepData.parameters || {};

          // Update selected algorithms based on existing parameters
          setSelectedAlgorithms((prevState) => ({
            ...prevState,
            ...parameters.selectedAlgorithms, // Merge previous state and existing step data
          }));

          if (parameters.qValue) {
            setQValue(parameters.qValue); // Set qValue if it exists
          }
        } else {
          console.warn("No existing parameters found.");
        }
      } else {
        console.warn("No existing parameters found.");
      }
    } catch (err) {
      console.error("Error during data fetching:", err);
    } finally {
      setLoading(false); // Finish loading
    }
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
        ...(Object.values(selectedAlgorithms).includes("Q-gram") && { qValue }), // Include qValue only if Q-gram is selected
      }),
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8000/api/workflow-step/${workflowId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

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

  const hasQGramSelected = Object.values(selectedAlgorithms).includes("Q-gram");

  if (loading) {
    return <div className="sidebar">Loading...</div>; // Show a loading state
  }

  if (error) {
    return <div className="sidebar error">{error}</div>;
  }

  return (
    <div className="sidebar">
      <h3>Field and Record Comparison</h3>
      <div className="dropdown-group">
        {columns.map((column) => (
          <div key={column} className="input-group">
            <label htmlFor={`algorithm-${column}`}>{column}</label>
            <select
              id={`algorithm-${column}`}
              value={selectedAlgorithms[column] || "jaro-winkler"}
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

      <div className="button-group1">
        <button className="save-button" onClick={handleSave}>
          Save
        </button>
        <button className="cancel-button" onClick={onCancel}>
          Cancel
        </button>
      </div>

      {shouldWarn && (
        <div className="warning" style={{ marginTop: '20px', backgroundColor: '#ffcccc', padding: '10px', borderRadius: '5px' }}>
          <p>
            Saving this step will reset all steps after "{stepOrder[activeStepIndex]}".
            You will need to reconfigure them.
          </p>
        </div>
      )}
    </div>
  );
};

export default ComparisonSidebar;
