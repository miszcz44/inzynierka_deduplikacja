import React, { useEffect } from 'react';
import {Link, useNavigate} from 'react-router-dom';

function ProtectedPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('token');
            console.log(token)
            try {
                const response = await fetch(`http://localhost:8000/api/verify-token/?token=${token}`);

                if (!response.ok) {
                    throw new Error('Token verification failed');
                }
            } catch (error) {
                console.error(error.message);
                localStorage.removeItem('token');
                navigate('/login');
            }
        };

        verifyToken();
    }, [navigate]);

    return (
        <div>
            <h1>This is a protected page. Only visible to authenticated users.</h1>
            <Link to="/upload">Go to File Upload</Link>
        </div>
    );
}

export default ProtectedPage;