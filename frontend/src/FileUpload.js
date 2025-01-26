import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function FileUpload() {
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [rawData, setRawData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [id, setId] = useState(null);
    const navigate = useNavigate();

    const fetchRawDataByID = async (id) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/api/raw-data/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setRawData(data);
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to fetch data');
            }
        } catch (error) {
            setError('An error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setFile(null);
        setError('');
        setRawData(null);
        setId(null);
    }, []);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!file) {
            setError('Please select a file to upload');
            return;
        }

        setUploading(true);

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
                setId(result.id);
                fetchRawDataByID(result.id);
                setFile(null);
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'File upload failed');
            }
        } catch (error) {
            setError('An error occurred. Please try again later.');
        } finally {
            setUploading(false);
        }
    };

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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Uploaded Data</h2>
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
                        margin: '0 auto',
                        padding: '10px',
                        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                        backgroundColor: '#f9f9f9' 
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
                                                    backgroundColor: idx % 2 === 0 ? '#f9f9f9' : '#ffffff'
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
