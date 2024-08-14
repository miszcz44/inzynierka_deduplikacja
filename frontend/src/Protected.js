import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

    return <div>This is a proteced page. Only visible to authenticated users.</div>
}

export default ProtectedPage;