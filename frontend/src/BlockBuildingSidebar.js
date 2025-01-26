import React, { useState, useEffect } from "react";

const BlockBuildingSidebar = ({ workflowId, onSave, onCancel, lastStep, activeStepId }) => {
  const defaultInputs = {
    windowSize: 5,
    nLetters: 3,
    maxWindowSize: 10,
    threshold: 0.8,
    columns: [],
  };

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

  const [algorithm, setAlgorithm] = useState("standardBlocking");
  const [inputs, setInputs] = useState(defaultInputs);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStepParameters = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:8000/api/workflow-step/${workflowId}/step?step_name=BLOCK_BUILDING`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();

          if (data.parameters) {
            const params = data.parameters;
            setAlgorithm(params.algorithm || "standardBlocking");
            setInputs({
              ...defaultInputs,
              ...params.inputs,
            });
          }
        } else {
          console.error("Failed to fetch parameters:", response.statusText);
        }
      } catch (error) {
        console.error("An error occurred while fetching the parameters:", error);
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
          const filteredColumns = uniqueColumns.filter((column) => column !== "ID");
          setColumns(filteredColumns);
        } else {
          console.error("Failed to fetch file content:", await response.json());
        }
      } catch (error) {
        console.error("An error occurred while fetching file content:", error);
      }
    };

    fetchStepParameters();
    fetchFileContent();
  }, [workflowId]);

  const handleAlgorithmChange = (e) => {
    const selectedAlgorithm = e.target.value;
    setAlgorithm(selectedAlgorithm);
    setInputs(defaultInputs);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: name === "threshold" ? parseFloat(value) : parseInt(value, 10) || "",
    }));
  };

  const handleColumnChange = (columnName) => {
    setInputs((prev) => {
      const newColumns = prev.columns.includes(columnName)
        ? prev.columns.filter((col) => col !== columnName)
        : [...prev.columns, columnName];
      return { ...prev, columns: newColumns };
    });
  };

  const handleSave = async () => {
    const errors = [];

    let filteredInputs = { columns: inputs.columns };
    if (algorithm === "sortedNeighborhood") {
      if (!inputs.windowSize || !inputs.nLetters) {
        errors.push("Window size and N letters are required for Sorted Neighborhood Method.");
      }
      filteredInputs = {
        ...filteredInputs,
        windowSize: inputs.windowSize,
        nLetters: inputs.nLetters,
      };
    } else if (algorithm === "dynamicSortedNeighborhood") {
      if (!inputs.maxWindowSize || !inputs.nLetters || !inputs.threshold) {
        errors.push(
          "Max window size, N letters, and Threshold are required for Dynamic Sorted Neighborhood Method."
        );
      }
      filteredInputs = {
        ...filteredInputs,
        maxWindowSize: inputs.maxWindowSize,
        nLetters: inputs.nLetters,
        threshold: inputs.threshold,
      };
    }

    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    const payload = {
      step: "BLOCK_BUILDING",
      parameters: JSON.stringify({
        algorithm,
        inputs: filteredInputs,
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
        console.log("Block building step saved successfully");
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
      <h3>Block Building</h3>

      <div className="dropdown-group">
        <label htmlFor="algorithm">Algorithm</label>
        <select id="algorithm" value={algorithm} onChange={handleAlgorithmChange}>
          <option value="standardBlocking">Standard Blocking</option>
          <option value="sortedNeighborhood">Sorted Neighborhood Method</option>
          <option value="dynamicSortedNeighborhood">Dynamic Sorted Neighborhood Method</option>
        </select>
      </div>

      {algorithm === "sortedNeighborhood" && (
        <div className="input-group">
          <label htmlFor="windowSize">Window Size</label>
          <input
            type="number"
            id="windowSize"
            name="windowSize"
            min="1"
            value={inputs.windowSize || ""}
            onChange={handleInputChange}
          />

          <label htmlFor="nLetters">Number of N Letters</label>
          <input
            type="number"
            id="nLetters"
            name="nLetters"
            min="1"
            value={inputs.nLetters || ""}
            onChange={handleInputChange}
          />
        </div>
      )}

      {algorithm === "dynamicSortedNeighborhood" && (
        <div className="input-group">
          <label htmlFor="maxWindowSize">Max Window Size</label>
          <input
            type="number"
            id="maxWindowSize"
            name="maxWindowSize"
            min="1"
            value={inputs.maxWindowSize || ""}
            onChange={handleInputChange}
          />

          <label htmlFor="nLetters">Number of N Letters</label>
          <input
            type="number"
            id="nLetters"
            name="nLetters"
            min="1"
            value={inputs.nLetters || ""}
            onChange={handleInputChange}
          />

          <label htmlFor="threshold">Threshold</label>
          <input
            type="number"
            id="threshold"
            name="threshold"
            min="0"
            step="0.01"
            value={inputs.threshold || ""}
            onChange={handleInputChange}
          />
        </div>
      )}

      <div className="input-group">
        <label>Columns</label>
        <div style={{ marginLeft: '10px', marginTop: '20px' }}>
          {columns.map((column) => (
            <div
              key={column}
              className="column-item"
              style={{
                marginBottom: '10px',
                padding: '5px 10px',
                borderRadius: '5px',
                backgroundColor: inputs.columns.includes(column) ? '#d3f9d8' : '#f1f1f1',
                cursor: 'pointer',
              }}
              onClick={() => handleColumnChange(column)}
            >
              {column}
            </div>
          ))}
        </div>
      </div>

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

export default BlockBuildingSidebar;
