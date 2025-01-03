import React from 'react';
import { useNavigate } from 'react-router-dom';

function Logout({ setIsAuthenticated }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');  // Remove the token from local storage
        localStorage.removeItem('role');   // Remove the role from local storage
        sessionStorage.clear();            // Clear session storage
        setIsAuthenticated(false);
        navigate('/login');  // Redirect to the login page
        window.location.reload();  // Refresh the page after logging out
    };

    return (
        <button onClick={handleLogout}>Logout</button>
    );
}

export default Logout;