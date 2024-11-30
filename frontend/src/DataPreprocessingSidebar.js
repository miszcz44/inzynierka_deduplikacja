import React from 'react';

const DataPreprocessingSidebar = ({ workflowId, onSave, onCancel, sharedState }) => {
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    sharedState.setCheckboxValues((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSave = async () => {
    const payload = {
      step: "data_preprocessing", // Specify the step name
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
        body: payload,
      });

      if (response.ok) {
        console.log("Data preprocessing step saved successfully");
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
