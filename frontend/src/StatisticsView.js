import React, { useEffect, useState } from 'react';
import './css/StatisticsView.css';
import {useNavigate, useParams} from "react-router-dom";
import { CSVLink } from "react-csv"; // Import CSVLink for CSV export
import {BackButton, HomeButton} from "./Buttons";
import Loading from './Loading';

// Utility function to fetch workflow data
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

const formatStepName = (name) => {
  // Convert step names to title case
  return name
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const renderStepParameters = (parameters) => {
  return Object.entries(parameters).map(([key, value]) => {
    // Handle specific cases for formatting certain parameters
    if (typeof value === 'boolean') {
      return (
        <div key={key} className="parameter-item">
          <strong>{formatParameterName(key)}:</strong> {value === true ? 'True' : 'False'}
        </div>
      );
    }
    if (typeof value === 'object' && !Array.isArray(value)) {
      return Object.entries(value).map(([subKey, subValue]) => (
        <div key={subKey} className="parameter-item">
          <strong>{formatParameterName(subKey)}:</strong> {subKey === 'columns' ? subValue.join(', ') : subValue}
        </div>
      ));
    } else if (Array.isArray(value)) {
      return (
        <div key={key} className="parameter-item">
          <strong>{formatParameterName(key)}:</strong> {value.join(', ')}
        </div>
      );
    } else {
      return (
        <div key={key} className="parameter-item">
          <strong>{formatParameterName(key)}:</strong> {value === 'sortedNeighborhood' ? 'Sorted neighborhood' :
            value === 'standardBlocking' ? 'Standard blocking' :
            value === 'dynamicSortedNeighborhood' ? 'Dynamic sorted neighborhood' :
            value === 'weighted-threshold' ? 'Weighted threshold' :
            value === 'threshold' ? 'Threshold' :
            value === 'cost-based' ? 'Cost based' : value
            }
        </div>
      );
    }
  });
};

const formatParameterName = (name) => {
  // Convert parameter names to a human-readable format
  return name
    .replace(/_/g, ' ')      // Replace underscores with spaces
    .replace(/([A-Z])/g, ' $1')  // Add a space before capital letters
    .replace(/^./, (str) => str.toUpperCase());  // Capitalize the first letter
};


const StatisticsView = () => {
  const { workflowId } = useParams();
  const [statistics, setStatistics] = useState([]);
  const [deduplicatedData, setDeduplicatedData] = useState([]);
  const [matches, setMatches] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQueryMatches, setSearchQueryMatches] = useState('');
  const [searchQueryDedup, setSearchQueryDedup] = useState('');
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false); // Modal visibility
  const [saveTitle, setSaveTitle] = useState(''); // Title input
  const [successMessage, setSuccessMessage] = useState(''); // Success message

  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);

        const stats = await fetchWorkflowData(workflowId, 'statistics');
        const dedupData = await fetchWorkflowData(workflowId, 'deduplicated-data');
        const matchesData = await fetchWorkflowData(workflowId, 'matches');
        const paramsData = await fetchWorkflowData(workflowId, 'parameters');

        // Sort the parameters in the desired order
        const sortedParams = paramsData.sort((a, b) => {
            const order = {
                "DATA_PREPROCESSING": 0,
                "BLOCK_BUILDING": 1,
                "FIELD_AND_RECORD_COMPARISON": 2,
                "CLASSIFICATION": 3
            };

            return order[a.name] - order[b.name];
        });

        setStatistics(stats);
        setDeduplicatedData(dedupData);
        setMatches(matchesData);
        setParameters(sortedParams);

        setLoading(false);
    };

    fetchData();
  }, [workflowId]);

  const groupedMatches = matches.reduce((acc, match) => {
    if (!acc[match.dedup_id]) {
      acc[match.dedup_id] = { nonDropped: [], dropped: [] };
    }
    if (match.dropped === "YES") {
      acc[match.dedup_id].dropped.push(match);
    } else {
      acc[match.dedup_id].nonDropped.push(match);
    }
    return acc;
  }, {});

  useEffect(() => {
    const filtered = Object.keys(groupedMatches).reduce((acc, dedup_id) => {
      const dropped = groupedMatches[dedup_id].dropped.filter((match) =>
        Object.keys(match).some(key =>
          String(match[key]).toLowerCase().includes(searchQueryMatches.toLowerCase())
        )
      );

      if (dropped.length > 0) {
        acc[dedup_id] = dropped;
      }

      return acc;
    }, {});

    setFilteredMatches(filtered);
  }, [searchQueryMatches, groupedMatches]);

  const handleSaveStatistics = async () => {
    if (!saveTitle.trim()) {
      alert("Please enter a valid title.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/workflows/${workflowId}/save-statistics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${token}`,
        },
        body: new URLSearchParams({ title: saveTitle }),
      });

      if (response.ok) {
        setShowSaveModal(false);
        setSaveTitle('');
        alert("Statistics successfully saved")
      } else {
        const errorData = await response.json();
        alert(`Failed to save statistics: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error saving statistics:", error);
      alert("An error occurred while saving statistics.");
    }
  };

  const filteredData = deduplicatedData.filter((row) => {
    return Object.keys(row).some(key =>
      String(row[key]).toLowerCase().includes(searchQueryDedup.toLowerCase())
    );
  });

  const dynamicColumns = deduplicatedData.length > 0 ? Object.keys(deduplicatedData[0]) : [];
  const matchColumns = matches.length > 0
    ? Object.keys(matches[0]).filter((col) => col !== 'dedup_id' && col !== 'dropped')
    : [];


  const csvHeaders = dynamicColumns.map((column) => ({
    label: column, // Column label
    key: column,   // Key in the data
  }));

  return (
    <div className="statistics-view">
      {loading ? (
        <Loading />
      ) : (<></>)}
      <div className="header-container">
        <h3><strong>Workflow Statistics</strong></h3>
        <div className="button-group">
          <button onClick={() => {navigate(`/workflow/${workflowId}`);}}>Go to Workflow</button>
          <button className="save" onClick={() => setShowSaveModal(true)}>Save statistics</button>
        </div>
      </div>
      {showSaveModal && (
        <div className="modal-overlay1">
          <div className="modal1">
            <h3>Save Statistics</h3>
            <input
              type="text"
              placeholder="Enter a title for the statistics"
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              className="modal-input"
            />
            <div className="modal-actions1">
              <button className="modal-save" onClick={handleSaveStatistics}>Save</button>
              <button className="modal-cancel" onClick={() => setShowSaveModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="success-message">
          <p>{successMessage}</p>
        </div>
      )}
      <div className="card-container">
        {/* First Row: Parameters and Deduplicated Data */}
        <div className="card parameters-card">
          <h3><strong>Workflow Parameters</strong></h3>
          <div className="parameters-scroll-container">
            {parameters.map((param) => {
              const { name, parameters: stepParams } = param;

              return (
                <div key={name} className="parameter-step">
                  <h4>{formatStepName(name)}</h4>
                  <div className="parameter-details">
                    {renderStepParameters(stepParams)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card deduplicated-data-card">
          <div className="title-search-container">
            <h3><strong>Deduplicated Data</strong></h3>
            <CSVLink
              data={deduplicatedData}
              headers={csvHeaders}
              filename="deduplication_results.csv"
              className="download-button"
              quoteStrings={""}
            >
              Download CSV
            </CSVLink>
            <input
              type="text"
              placeholder="Search deduplicated data..."
              value={searchQueryDedup}
              onChange={(e) => setSearchQueryDedup(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="table-wrapper" style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  {dynamicColumns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, idx) => (
                  <tr key={idx}>
                    {dynamicColumns.map((key) => (
                      <td key={key}>{row[key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Second Row: Matches and Statistics */}
      <div className="card-container">
        <div className="card matches-card">
          <div className="title-search-container">
            <h3><strong>Matches</strong></h3>
            <input
              type="text"
              placeholder="Search matches..."
              value={searchQueryMatches}
              onChange={(e) => setSearchQueryMatches(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="matches-scroll-container">
            {Object.keys(filteredMatches).map((dedup_id) => (
              filteredMatches[dedup_id].map((droppedMatch, idx) => {
                const correspondingMatch = groupedMatches[dedup_id].nonDropped.find(
                  (match) => match.dedup_id === droppedMatch.dedup_id
                );
                return (
                  <div key={idx} className="comparison-rows matches-row-spacing">
                    <div className="row-data">
                      <h5>Row (Dropped)</h5>
                      {matchColumns.map((col) => (
                        <p key={col}><strong>{col}:</strong> {droppedMatch[col]}</p>
                      ))}
                    </div>
                    <div className="row-data">
                      <h5>Row (Corresponding)</h5>
                      {matchColumns.map((col) => (
                        <p key={col}><strong>{col}:</strong> {correspondingMatch?.[col] || 'N/A'}</p>
                      ))}
                    </div>
                  </div>
                );
              })
            ))}
          </div>
        </div>
        <div className="card statistics-card">
          <h3><strong>Statistics</strong></h3>
          <ul>
            {statistics.map((stat, index) => (
              <li key={index} className="statistics-row">
                <p style={{marginTop: '15px', marginBottom: '12px'}}>Detected Duplicates: {stat["Detected duplicates"]}</p>
                <p style={{marginBottom: '12px'}}>Row Count Before Deduplication: {stat["Row count before deduplication"]}</p>
                <p style={{marginBottom: '12px'}}>Row Count After Deduplication: {stat["Row count after deduplication"]}</p>
                <p style={{marginBottom: '12px'}}>Duplicate Percentage: {stat["Duplicate percentage"]}%</p>
                <p style={{marginBottom: '12px'}}>Average Similarity Per Block: {stat["Average similarity per block"]}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StatisticsView;
