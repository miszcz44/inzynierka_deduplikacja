import React, { useState } from 'react';

const ClassificationModal = ({ isOpen, onClose, data }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  // Filter and paginate the data
  const filteredData = data.filter(
    item =>
      item.row1_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.row2_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.classification.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  if (!isOpen) return null;

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
          maxHeight: '80%',
          borderRadius: '8px',
          padding: '20px',
          position: 'relative',
          overflow: 'auto',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '16px',
            color: 'black',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Close
        </button>

        <h2 style={{ textAlign: 'center' }}>Classification Results</h2>

        <input
          type="text"
          placeholder="Search by name or classification..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '20px',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />

        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '20px',
          }}
        >
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Row 1 Name</th>
              <th style={tableHeaderStyle}>Row 2 Name</th>
              <th style={tableHeaderStyle}>Classification</th>
              <th style={tableHeaderStyle}>Average Similarity</th>
              <th style={tableHeaderStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr key={index} style={{ textAlign: 'center' }}>
                <td style={tableCellStyle}>{item.row1_name}</td>
                <td style={tableCellStyle}>{item.row2_name}</td>
                <td style={tableCellStyle}>{item.classification}</td>
                <td style={tableCellStyle}>
                  {item.average_similarity.toFixed(2)}
                </td>
                <td style={tableCellStyle}>
                  <button
                    onClick={() => alert(JSON.stringify(item, null, 2))}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            style={{
              padding: '10px 20px',
              backgroundColor: page === 1 ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Previous
          </button>
          <span>
            Page {page} of {Math.ceil(filteredData.length / itemsPerPage)}
          </span>
          <button
            onClick={() =>
              setPage((prev) =>
                Math.min(prev + 1, Math.ceil(filteredData.length / itemsPerPage))
              )
            }
            disabled={page === Math.ceil(filteredData.length / itemsPerPage)}
            style={{
              padding: '10px 20px',
              backgroundColor:
                page === Math.ceil(filteredData.length / itemsPerPage)
                  ? '#ccc'
                  : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor:
                page === Math.ceil(filteredData.length / itemsPerPage)
                  ? 'not-allowed'
                  : 'pointer',
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

const tableHeaderStyle = {
  borderBottom: '2px solid #ddd',
  padding: '10px',
  textAlign: 'center',
};

const tableCellStyle = {
  borderBottom: '1px solid #ddd',
  padding: '10px',
};

export default ClassificationModal;
