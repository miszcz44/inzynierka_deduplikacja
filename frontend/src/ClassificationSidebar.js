import React, { useState, useEffect } from "react";

const ClassificationSidebar = ({
  workflowId,
  onSave,
  onCancel,
  lastStep,
  activeStepId,
}) => {
  const [columns, setColumns] = useState([]);
  const [classificationType, setClassificationType] = useState("threshold");
  const [thresholdMatch, setThresholdMatch] = useState(0.5);
  const [columnWeights, setColumnWeights] = useState({});
  const [costParameters, setCostParameters] = useState({
    costTrueMatchAsNonMatch: 1,
    costTrueNonMatchAsNonMatch: 1,
    costTrueMatchAsMatch: 1,
    costTrueNonMatchAsMatch: 1,
    probabilityM: 0.5,
  });
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [workflowId]);

  const stepOrder = [
    "DATA_PREPROCESSING",
    "BLOCK_BUILDING",
    "FIELD_AND_RECORD_COMPARISON",
    "CLASSIFICATION",
    "EVALUATION",
  ];

  const activeStepIndex = stepOrder.indexOf(stepOrder[activeStepId - 2]);
  const lastStepIndex = stepOrder.indexOf(lastStep);

  const shouldWarn = activeStepIndex < lastStepIndex;

  const fetchData = async () => {
    setLoading(true);
    try {
      await fetchFileContent();
      await fetchSavedChoices();
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
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
        const filteredColumns = uniqueColumns
          .filter((column) => column !== "ID")
          .map((column) => `${column}_similarity`); // Add '_similarity' suffix
        setColumns(filteredColumns);
        initializeWeights(filteredColumns);
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
      acc[column] = 1;
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
          } else if (parameters.classificationType === "cost-based") {
            setCostParameters({
              costTrueMatchAsNonMatch:
                parameters.costTrueMatchAsNonMatch || 1,
              costTrueNonMatchAsNonMatch:
                parameters.costTrueNonMatchAsNonMatch || 1,
              costTrueMatchAsMatch: parameters.costTrueMatchAsMatch || 1,
              costTrueNonMatchAsMatch:
                parameters.costTrueNonMatchAsMatch || 1,
              probabilityM: parameters.probabilityM || 0.5,
            });
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

  const handleCostParameterChange = (name, value) => {
    setCostParameters((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
    setValidationError(""); // Clear validation error on change
  };

  const handleSave = async () => {
    const { probabilityM } = costParameters;
    const probabilityU = 1 - probabilityM;

    if (probabilityM < 0 || probabilityM > 1) {
      setValidationError("M Probability must be between 0 and 1.");
      return;
    }

    const payload = {
      step: "CLASSIFICATION",
      parameters:
        classificationType === "threshold"
          ? JSON.stringify({ classificationType, thresholdMatch })
          : classificationType === "weighted-threshold"
          ? JSON.stringify({ classificationType, columnWeights })
          : JSON.stringify({
              classificationType,
              ...costParameters,
              probabilityU,
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
        console.log("Classification settings saved successfully");
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

  if (loading) {
    return <div className="sidebar">Loading...</div>;
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
              <option value="cost-based">Cost-Based</option>
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
          ) : classificationType === "weighted-threshold" ? (
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
          ) : (
            <div className="cost-group">
              <h4>Cost Parameters</h4>
              <div className="input-group">
                <label htmlFor="cost-true-match-nonmatch">
                  Cost True Match as Non-Match:
                </label>
                <input
                  id="cost-true-match-nonmatch"
                  type="number"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={costParameters.costTrueMatchAsNonMatch}
                  onChange={(e) =>
                    handleCostParameterChange(
                      "costTrueMatchAsNonMatch",
                      e.target.value
                    )
                  }
                />
              </div>
              <div className="input-group">
                <label htmlFor="cost-true-nonmatch-nonmatch">
                  Cost True Non-Match as Non-Match:
                </label>
                <input
                  id="cost-true-nonmatch-nonmatch"
                  type="number"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={costParameters.costTrueNonMatchAsNonMatch}
                  onChange={(e) =>
                    handleCostParameterChange(
                      "costTrueNonMatchAsNonMatch",
                      e.target.value
                    )
                  }
                />
              </div>
              <div className="input-group">
                <label htmlFor="cost-true-match-match">
                  Cost True Match as Match:
                </label>
                <input
                  id="cost-true-match-match"
                  type="number"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={costParameters.costTrueMatchAsMatch}
                  onChange={(e) =>
                    handleCostParameterChange(
                      "costTrueMatchAsMatch",
                      e.target.value
                    )
                  }
                />
              </div>
              <div className="input-group">
                <label htmlFor="cost-true-nonmatch-match">
                  Cost True Non-Match as Match:
                </label>
                <input
                  id="cost-true-nonmatch-match"
                  type="number"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={costParameters.costTrueNonMatchAsMatch}
                  onChange={(e) =>
                    handleCostParameterChange(
                      "costTrueNonMatchAsMatch",
                      e.target.value
                    )
                  }
                />
              </div>
              <div className="input-group">
                <label htmlFor="probability-m">M Probability:</label>
                <input
                  id="probability-m"
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={costParameters.probabilityM}
                  onChange={(e) =>
                    handleCostParameterChange("probabilityM", e.target.value)
                  }
                />
              </div>
            </div>
          )}
        </>
      )}

      {validationError && (
        <div className="validation-error">{validationError}</div>
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
        <div
          className="warning"
          style={{
            marginTop: "20px",
            backgroundColor: "#ffcccc",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          <p>
            Saving this step will reset all steps after "
            {stepOrder[activeStepIndex]}".
            You will need to reconfigure them.
          </p>
        </div>
      )}
    </div>
  );
};

export default ClassificationSidebar;
