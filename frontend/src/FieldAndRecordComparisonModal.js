import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './css/FieldAndRecordComparisonModal.css';

const fetchWorkflowData = async (workflowId, endpoint) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:8000/api/workflows/${workflowId}/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.error(`Failed to fetch ${endpoint}`);
      return [];
    }
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return [];
  }
};

const FieldAndRecordComparisonModal = ({ isOpen, onClose, workflowId }) => {
  const [comparisonData, setComparisonData] = useState([]);
  const [inputData, setInputData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlockId, setSelectedBlockId] = useState(1);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoading(true);
        const input = await fetchWorkflowData(workflowId, 'content');
        const comparison = await fetchWorkflowData(workflowId, 'processed-data');
        setInputData(input);
        setComparisonData(comparison);
        setLoading(false);
      };
      fetchData();
    }
  }, [isOpen, workflowId]);

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content loading">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const enrichedComparisonData = comparisonData.map((comp) => {
    const row1Data = inputData.find((row) => row.ID === comp.row1) || {};
    const row2Data = inputData.find((row) => row.ID === comp.row2) || {};

    return {
      ...comp,
      row1Data,
      row2Data,
    };
  });

  const uniqueBlockIds = [...new Set(enrichedComparisonData.map((comp) => comp.block_id))];
  const filteredData = enrichedComparisonData.filter((comp) => comp.block_id === selectedBlockId);

  return (

    <div className="modal-overlay">
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '3%',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '10px 20px',
          backgroundColor: 'white',
          borderRadius: '20px',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
          zIndex: 1100,
          fontSize: '18px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '20px'
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = '#f0f0f0')}
        onMouseOut={(e) => (e.target.style.backgroundColor = 'white')}
      >
        Close
      </div>
      <div className="modal-content">


        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
          Field and Record Comparison
        </h2>

        {uniqueBlockIds.length > 1 && (
          <div className="block-selector">
            <label htmlFor="block-id">Select Block ID: </label>
            <select
              id="block-id"
              value={selectedBlockId}
              onChange={(e) => setSelectedBlockId(Number(e.target.value))}
            >
              {uniqueBlockIds.map((blockId) => (
                <option key={blockId} value={blockId}>
                  Block {blockId}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="comparison-container">
          {filteredData.map((comp, index) => (
            <div key={index} className="comparison-block">
              <h3>Block ID: {comp.block_id}</h3>
              <div className="comparison-rows">
                <div className="row-data">
                  <h4>Row 1</h4>
                  <p><strong>City:</strong> {comp.row1Data.city || 'N/A'}</p>
                  <p><strong>Name:</strong> {comp.row1Data.name || 'N/A'}</p>
                  <p><strong>Address:</strong> {comp.row1Data.address || 'N/A'}</p>
                  <p><strong>Cuisine:</strong> {comp.row1Data.cuisine || 'N/A'}</p>
                </div>
                <div className="row-data">
                  <h4>Row 2</h4>
                  <p><strong>City:</strong> {comp.row2Data.city || 'N/A'}</p>
                  <p><strong>Name:</strong> {comp.row2Data.name || 'N/A'}</p>
                  <p><strong>Address:</strong> {comp.row2Data.address || 'N/A'}</p>
                  <p><strong>Cuisine:</strong> {comp.row2Data.cuisine || 'N/A'}</p>
                </div>
              </div>
              <div className="similarity-scores">
                <p><strong>City Similarity:</strong> {comp.city_similarity.toFixed(2)}</p>
                <p><strong>Name Similarity:</strong> {comp.name_similarity.toFixed(2)}</p>
                <p><strong>Address Similarity:</strong> {comp.address_similarity.toFixed(2)}</p>
                <p><strong>Cuisine Similarity:</strong> {comp.cuisine_similarity.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

FieldAndRecordComparisonModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  workflowId: PropTypes.string.isRequired,
};

export default FieldAndRecordComparisonModal;
