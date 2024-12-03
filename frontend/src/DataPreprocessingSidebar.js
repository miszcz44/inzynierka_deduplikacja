import React, { useEffect, useState } from 'react';

const DataPreprocessingSidebar = ({ workflowId, lastStep, activeStepId,  onSave, onCancel, sharedState }) => {
  const [loading, setLoading] = useState(true); // Loading state

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

  // Fetch step parameters on mount
  useEffect(() => {
    fetchStepData();
  }, [workflowId]); // Dependency on `workflowId` ensures the fetch happens when the workflow ID changes

  const fetchStepData = async () => {
    setLoading(true); // Start loading
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8000/api/workflow-step/${workflowId}/step?step_name=DATA_PREPROCESSING`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Check if the response contains `parameters`
        if (data.parameters) {
          // Map the response parameters to checkbox values in sharedState
          sharedState.setCheckboxValues({
            lowercase: data.parameters.lowercase || false, // Default to false if undefined
            removeDiacritics: data.parameters.removeDiacritics || false,
            removePunctuation: data.parameters.removePunctuation || false,
          });
        }
      } else {
        console.error("Failed to fetch step data");
      }
    } catch (error) {
      console.error("An error occurred while fetching the step data:", error);
    } finally {
      setLoading(false); // Finish loading
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    sharedState.setCheckboxValues((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSave = async () => {
    const payload = {
      step: "DATA_PREPROCESSING", // Specify the step name
      parameters: JSON.stringify(sharedState.checkboxValues), // Convert parameters to JSON string
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
        console.log("Data preprocessing step saved successfully");
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
    return <div className="sidebar">Loading...</div>; // Show a loading state
  }

  return (
    <div className="sidebar">
      <h3>Data Pre-processing</h3>
      <div className="checkbox-group">
        <Checkbox
          name="removeDiacritics"
          label="Remove diacritics"
          checked={sharedState.checkboxValues.removeDiacritics}
          onChange={handleCheckboxChange}
        />
        <Checkbox
          name="removePunctuation"
          label="Remove punctuation"
          checked={sharedState.checkboxValues.removePunctuation}
          onChange={handleCheckboxChange}
        />
        <Checkbox
          name="lowercase"
          label="Ignore case sensitivity"
          checked={sharedState.checkboxValues.lowercase}
          onChange={handleCheckboxChange}
        />
      </div>

      <div className="button-group">
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

const Checkbox = ({ name, label, checked, onChange }) => (
  <div className="checkbox">
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
    />
    <label>{label}</label>
  </div>
);

export default DataPreprocessingSidebar;
