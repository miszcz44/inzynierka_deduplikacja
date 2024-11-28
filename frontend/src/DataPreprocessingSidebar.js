import React from 'react';

const DataPreprocessingSidebar = ({ onSave, onCancel, sharedState }) => {
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    sharedState.setCheckboxValues((prev) => ({
      ...prev,
      [name]: checked,
    }));
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
        <button className="save-button" onClick={onSave}>
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
