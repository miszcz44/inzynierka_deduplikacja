import React, { useState } from 'react';

const BlockBuildingSidebar = ({ onSave, onCancel }) => {
  const [algorithm, setAlgorithm] = useState(''); // Dropdown selection
  const [inputs, setInputs] = useState({
    windowSize: '',
    nLetters: '',
    maxWindowSize: '',
    threshold: '',
  });

  const handleAlgorithmChange = (e) => {
    setAlgorithm(e.target.value);
    setInputs({ windowSize: '', nLetters: '', maxWindowSize: '', threshold: '' }); // Reset inputs
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (!/^\d*$/.test(value)) return; // Ensure only integers are allowed
    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // Validation
    const errors = [];
    if (algorithm === 'sortedNeighborhood' && (!inputs.windowSize || !inputs.nLetters)) {
      errors.push('Window size and N letters are required for Sorted Neighborhood Method.');
    } else if (algorithm === 'dynamicSortedNeighborhood' && (!inputs.maxWindowSize || !inputs.nLetters || !inputs.threshold)) {
      errors.push('Max window size, N letters, and Threshold are required for Dynamic Sorted Neighborhood Method.');
    }

    if (errors.length > 0) {
      alert(errors.join('\n')); // Display validation errors
      return;
    }

    // Save logic here
    console.log('Saved Block Building settings:', { algorithm, inputs });
    onSave();
  };

  return (
    <div className="sidebar">
      <h3>Block Building</h3>

      {/* Algorithm Dropdown */}
      <div className="dropdown-group">
        <label htmlFor="algorithm">Algorithm</label>
        <select id="algorithm" value={algorithm} onChange={handleAlgorithmChange}>
          <option value="">Select an algorithm</option>
          <option value="standardBlocking">Standard Blocking</option>
          <option value="sortedNeighborhood">Sorted Neighborhood Method</option>
          <option value="dynamicSortedNeighborhood">Dynamic Sorted Neighborhood Method</option>
        </select>
      </div>

      {/* Conditional Input Fields */}
      {algorithm === 'sortedNeighborhood' && (
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

      {algorithm === 'dynamicSortedNeighborhood' && (
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
            min="1"
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
