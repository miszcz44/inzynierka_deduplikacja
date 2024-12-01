import React, { useState } from "react";

const BlockBuildingSidebar = ({ workflowId, onSave, onCancel }) => {
  const [algorithm, setAlgorithm] = useState("standardBlocking"); // Default algorithm
  const [inputs, setInputs] = useState({
    windowSize: 5, // Default window size
    nLetters: 3, // Default number of letters
    maxWindowSize: 10, // Default max window size
    threshold: 0.8, // Default threshold
  });

  const handleAlgorithmChange = (e) => {
    setAlgorithm(e.target.value);
    setInputs({
      windowSize: 5,
      nLetters: 3,
      maxWindowSize: 10,
      threshold: 0.8,
    }); // Reset inputs with default values
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (!/^\d*\.?\d*$/.test(value)) return; // Allow only numeric values (integers or floats)
    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    // Validation
    const errors = [];
    if (algorithm === "sortedNeighborhood" && (!inputs.windowSize || !inputs.nLetters)) {
      errors.push("Window size and N letters are required for Sorted Neighborhood Method.");
    } else if (
      algorithm === "dynamicSortedNeighborhood" &&
      (!inputs.maxWindowSize || !inputs.nLetters || !inputs.threshold)
    ) {
      errors.push(
        "Max window size, N letters, and Threshold are required for Dynamic Sorted Neighborhood Method."
      );
    }

    if (errors.length > 0) {
      alert(errors.join("\n")); // Display validation errors
      return;
    }

    // Prepare the payload for the API
    const payload = {
      step: "BLOCK_BUILDING", // Specify the step name
      parameters: JSON.stringify({
        algorithm, // Selected algorithm
        ...inputs, // Include the input fields
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
        body: JSON.stringify(payload), // Send payload
      });

      if (response.ok) {
        console.log("Block building step saved successfully");
        onSave(); // Call the parent-provided `onSave` to handle any post-save actions
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

  return (
    <div className="sidebar">
      <h3>Block Building</h3>

      {/* Algorithm Dropdown */}
      <div className="dropdown-group">
        <label htmlFor="algorithm">Algorithm</label>
        <select id="algorithm" value={algorithm} onChange={handleAlgorithmChange}>
          <option value="standardBlocking">Standard Blocking</option>
          <option value="sortedNeighborhood">Sorted Neighborhood Method</option>
          <option value="dynamicSortedNeighborhood">Dynamic Sorted Neighborhood Method</option>
        </select>
      </div>

      {/* Conditional Input Fields */}
      {algorithm === "sortedNeighborhood" && (
        <div className="input-group">
          <label htmlFor="windowSize">Window Size</label>
          <input
            type="number"
            id="windowSize"
            name="windowSize"
            min="1"
            value={inputs.windowSize}
            onChange={handleInputChange}
          />

          <label htmlFor="nLetters">Number of N Letters</label>
          <input
            type="number"
            id="nLetters"
            name="nLetters"
            min="1"
            value={inputs.nLetters}
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
            value={inputs.maxWindowSize}
            onChange={handleInputChange}
          />

          <label htmlFor="nLetters">Number of N Letters</label>
          <input
            type="number"
            id="nLetters"
            name="nLetters"
            min="1"
            value={inputs.nLetters}
            onChange={handleInputChange}
          />

          <label htmlFor="threshold">Threshold</label>
          <input
            type="number"
            id="threshold"
            name="threshold"
            min="0"
            step="0.01"
            value={inputs.threshold}
            onChange={handleInputChange}
          />
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

export default BlockBuildingSidebar;
