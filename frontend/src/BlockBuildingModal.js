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

const BlockBuildingModal = ({ isOpen, onClose, workflowId }) => {
  const [processedData, setProcessedData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoading(true);
        const processed = await fetchWorkflowData(workflowId, 'processed-data');
        setProcessedData(processed);
        setLoading(false);
      };
      fetchData();
    }
  }, [isOpen, workflowId]);

  if (!isOpen) return null;

  if (loading) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
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

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
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
          overflow: 'auto',
        }}
      >

        <h2 style={{ textAlign: 'center' }}>Block Building Data</h2>

        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse', overflowX: 'auto' }}>
            <thead>
              <tr>
                {Object.keys(processedData[0] || {}).map((key) => (
                  <th key={key} style={{ border: '1px solid black', padding: '5px' }}>
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {processedData.map((row) => (
                <tr key={row.ID}>
                  {Object.entries(row).map(([key, value]) => (
                    <td key={key} style={{ border: '1px solid black', padding: '5px' }}>
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BlockBuildingModal;
