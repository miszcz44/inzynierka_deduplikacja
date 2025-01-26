import React from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';

function BlockBuilding() {

    const location = useLocation();
    const navigate = useNavigate();
    const { table_id } = useParams();
    const { table_name } = location.state || {};

    const buttonStyle = {
        padding: '15px 30px',
        fontSize: '18px',
        margin: '20px 0',
        cursor: 'pointer',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        display: 'block',
        width: '100%',
        textAlign: 'center',
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <h1>Step 1: Block Building</h1>
            <h2>{table_name}</h2>

            <button
                style={buttonStyle}
                onClick={() => navigate(`/block_building/rolling_window/${table_id}`)}
            >
                Method: Rolling window
            </button>

            <button
                style={buttonStyle}
                onClick={() => navigate(`/block_building/suffix_table/${table_id}`)}
            >
                Method: Suffix table
            </button>
        </div>
    );
}

export default BlockBuilding;
