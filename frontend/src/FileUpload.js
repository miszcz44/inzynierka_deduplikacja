import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function FileUpload() {
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [rawData, setRawData] = useState(null); // Start with null to indicate no data has been loaded
    const [loading, setLoading] = useState(false); // Only load data when necessary
    const [uploading, setUploading] = useState(false); // To handle the upload process state
    const [id, setId] = useState(null); // Store the id after upload
    const navigate = useNavigate();

    // Fetch raw data by ID from the backend
    const fetchRawDataByID = async (id) => {
        setLoading(true); // Start loading when fetching data
        try {
            const response = await fetch(`http://localhost:8000/api/raw-data/${id}`, { // Fetch by ID
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setRawData(data); // Set the data once fetched
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to fetch data');
            }
        } catch (error) {
            setError('An error occurred. Please try again later.');
        } finally {
            setLoading(false); // End loading after fetching data
        }
    };

    // Clear the state when the component first mounts
    useEffect(() => {
        setFile(null);
        setError('');
        setRawData(null); // Start in a clear state, no data loaded
        setId(null);  // Clear any previous id
    }, []);

    // Handle file selection
    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!file) {
            setError('Please select a file to upload');
            return;
        }

        setUploading(true); // Start uploading state

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8000/api/upload/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                setId(result.id); // Store the id
                fetchRawDataByID(result.id); // Fetch the data immediately after upload
                setFile(null); // Reset the file input
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'File upload failed');
            }
        } catch (error) {
            setError('An error occurred. Please try again later.');
        } finally {
            setUploading(false); // End uploading state
        }
    };

    // Navigate to the block_building page
    const goToBlockBuilding = (raw_data) => {
        if (raw_data) {
            navigate(`/block_building/${raw_data.id}`, { state: { table_name: raw_data.table_name } });
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '30px' }}>Upload a File</h1>
            <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
                <input
                    type="file"
                    accept=".csv, .json"
                    onChange={handleFileChange}
                    style={{ marginBottom: '10px' }}
                />
                <br />
                <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }} disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload'}
                </button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Header section with "Existing Data" and button on the same line */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Uploaded Data</h2>
                {/* render the button when rawData is available */}
                {rawData && (
                    <button
                        onClick={goToBlockBuilding}
                        style={{
                            padding: '10px 20px',
                            cursor: 'pointer',
                            backgroundColor: '#007bff',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px'
                        }}>
                        Go to Block Building
                    </button>
                )}
            </div>

            {loading ? (
                <p>Loading data...</p>
            ) : (
                rawData && (
                    <div style={{
                        width: '80%',
                        height: '60vh',
                        overflow: 'auto',
                        border: '1px solid #ccc',
                        margin: '0 auto', // Center the table
                        padding: '10px',
                        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', // Add slight shadow for better appearance
                        backgroundColor: '#f9f9f9' // Light background color for the table container
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', margin: '0 auto' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f2f2f2' }}>
                                    {Object.keys(rawData.data[0]).map((key, index) => (
                                        <th
                                            key={index}
                                            style={{
                                                position: 'sticky',
                                                top: 0,
                                                backgroundColor: '#f2f2f2',
                                                borderBottom: '2px solid #ddd',
                                                padding: '8px',
                                                textAlign: 'left'
                                            }}>
                                            {key}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rawData.data.map((row, idx) => (
                                    <tr key={idx}>
                                        {Object.values(row).map((value, i) => (
                                            <td
                                                key={i}
                                                style={{
                                                    border: '1px solid #ddd',
                                                    padding: '8px',
                                                    textAlign: 'left',
                                                    backgroundColor: idx % 2 === 0 ? '#f9f9f9' : '#ffffff' // Alternate row colors
                                                }}>
                                                {value}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}
        </div>
    );
}

export default FileUpload;
