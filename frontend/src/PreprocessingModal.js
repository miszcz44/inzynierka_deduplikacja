import React, { useEffect, useState } from 'react';

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

// Function to compare data and highlight differences
const compareData = (inputRow, processedRow) => {
  return Object.keys(inputRow).map((key) => {
    return inputRow[key] !== processedRow[key];
  });
};

const PreprocessingModal = ({ isOpen, onClose, workflowId, lastStep }) => {
  const [inputData, setInputData] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoading(true);
        const input = await fetchWorkflowData(workflowId, 'content');
        const processed = await fetchWorkflowData(workflowId, 'processed-data');
        setInputData(input);
        setProcessedData(processed);
        setLoading(false);
      };
      fetchData();
    }
  }, [isOpen, workflowId]);

  if (!isOpen) return null; // Don't render anything if the modal is not open

  if (loading) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000, // Ensure the modal is above everything
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            width: '300px',
            height: '150px',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Create a merged list of input and processed rows
  const mergedData = inputData.map((inputRow) => {
    const matchingProcessedRow = processedData.find(
      (processedRow) => processedRow.ID === inputRow.ID
    );
    return {
      inputRow,
      processedRow: matchingProcessedRow || {}, // Use empty object if no match
    };
  });

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000, // Ensure the modal is above everything
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          width: '80%',
          height: '80%',
          borderRadius: '8px',
          padding: '20px',
          position: 'relative',
          overflow: 'auto', // Ensure scroll if content overflows
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '5%', // 5% of the modal width
            height: '5%', // 5% of the modal height
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '24px',
            color: 'black', // Set color to black
            cursor: 'pointer',
            padding: '0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontWeight: 'bold',
          }}
        >
          X
        </button>

        <h2 style={{ textAlign: 'center' }}>Data Comparison</h2>

        {/* Combined Table */}
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse', overflowX: 'auto' }}>
            <thead>
              <tr>
                {Object.keys(inputData[0] || {}).map((key) => (
                  <th key={`input-${key}`} style={{ border: '1px solid black', padding: '5px' }}>
                    {key} (Input)
                  </th>
                ))}
                {Object.keys(processedData[0] || {}).map((key) => (
                  <th key={`processed-${key}`} style={{ border: '1px solid black', padding: '5px' }}>
                    {key} (Processed)
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mergedData.map(({ inputRow, processedRow }) => {
                const differences = compareData(inputRow, processedRow);

                return (
                  <tr key={inputRow.ID}>
                    {Object.entries(inputRow).map(([key, value]) => (
                      <td
                        key={`input-${key}`}
                        style={{ border: '1px solid black', padding: '5px' }}
                      >
                        {value}
                      </td>
                    ))}
                    {Object.entries(processedRow).map(([key, value], index) => (
                      <td
                        key={`processed-${key}`}
                        style={{
                          border: '1px solid black',
                          padding: '5px',
                          backgroundColor: differences[index] ? '#FFAAAA' : '', // Highlight if different
                        }}
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PreprocessingModal;
