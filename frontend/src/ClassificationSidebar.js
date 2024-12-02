import React, { useState, useEffect } from "react";

const ClassificationSidebar = ({ workflowId, onSave, onCancel }) => {
  const [columns, setColumns] = useState([]);
  const [classificationType, setClassificationType] = useState("threshold");
  const [thresholdMatch, setThresholdMatch] = useState(0.5);
  const [columnWeights, setColumnWeights] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // New loading state

  useEffect(() => {
    fetchData();
  }, [workflowId]);

  const fetchData = async () => {
    setLoading(true); // Start loading
    try {
      await fetchFileContent();
      await fetchSavedChoices();
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false); // Finish loading
    }
  };

  const fetchFileContent = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8000/api/workflows/${workflowId}/file-content`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const uniqueColumns = data.columns || [];
        setColumns(uniqueColumns);
        initializeWeights(uniqueColumns);
      } else {
        const err = await response.json();
        setError(err.detail || "Failed to fetch file content");
      }
    } catch (e) {
      setError("An error occurred while fetching file content");
    }
  };

  const initializeWeights = (columns) => {
    const initialWeights = columns.reduce((acc, column) => {
      acc[column] = 1; // Default weight
      return acc;
    }, {});
    setColumnWeights(initialWeights);
  };

  const fetchSavedChoices = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8000/api/workflow-step/${workflowId}/step?step_name=CLASSIFICATION`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const parameters = data.parameters;

        if (parameters) {
          setClassificationType(parameters.classificationType || "threshold");
          if (parameters.classificationType === "threshold") {
            setThresholdMatch(parameters.thresholdMatch || 0.5);
          } else if (parameters.classificationType === "weighted-threshold") {
            setColumnWeights((prevWeights) => ({
              ...prevWeights,
              ...parameters.columnWeights,
            }));
          }
        }
      }
    } catch (error) {
      console.error("Error fetching saved choices:", error);
    }
  };

  const handleWeightChange = (column, value) => {
    setColumnWeights((prev) => ({
      ...prev,
      [column]: Number(value),
    }));
  };

  const handleSave = async () => {
    const payload = {
      step: "CLASSIFICATION",
      parameters:
        classificationType === "threshold"
          ? JSON.stringify({ classificationType, thresholdMatch })
          : JSON.stringify({ classificationType, columnWeights }),
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
        console.log("Classification settings saved successfully");
        onSave(); // Notify parent component
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

  if (loading) {
    return <div className="sidebar">Loading...</div>; // Show a loading state
  }

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

          {classificationType === "threshold" ? (
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
