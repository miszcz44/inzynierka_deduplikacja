import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function UserTables() {
    const [tables, setTables] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserTables = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/user/tables', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setTables(data);
                } else {
                    const errorData = await response.json();
                    setError(errorData.detail || 'Failed to fetch tables');
                }
            } catch (error) {
                setError('An error occurred. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserTables();
    }, []);

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>User Tables</h1>
            {loading ? (
                <p>Loading tables...</p>
            ) : error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : tables.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>ID</th>
                            <th style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>Date Created</th>
                            <th style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tables.map((table) => (
                            <tr key={table.id}>
                                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{table.id}</td>
                                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{new Date(table.date_created).toLocaleString()}</td>
                                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                                    <Link to={`/user/table/${table.id}`}>View Table</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No tables found.</p>
            )}
        </div>
    );
}

export default UserTables;
