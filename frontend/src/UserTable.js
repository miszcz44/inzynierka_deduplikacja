import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function UserTable() {
    const { table_id } = useParams();
    const [tableData, setTableData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTableData = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/user/table/${table_id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setTableData(data);
                } else {
                    const errorData = await response.json();
                    setError(errorData.detail || 'Failed to fetch table data');
                }
            } catch (error) {
                setError('An error occurred. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchTableData();
    }, [table_id]);

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>Table Data</h1>
            {loading ? (
                <p>Loading table data...</p>
            ) : error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : tableData ? (
                <div style={{ width: '100%', height: '60vh', overflow: 'auto', border: '1px solid #ccc', padding: '10px', backgroundColor: '#f9f9f9' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {Object.keys(tableData.data[0]).map((key, index) => (
                                    <th key={index} style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>
                                        {key}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.data.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {Object.values(row).map((value, colIndex) => (
                                        <td key={colIndex} style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                                            {value}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p>No data found for this table.</p>
            )}
        </div>
    );
}

export default UserTable;
