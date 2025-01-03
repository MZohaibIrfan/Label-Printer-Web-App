import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logout from '../components/Logout';  // Ensure the correct import path

function LoginPage({ setIsAuthenticated, setUserRole }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();
        const response = await fetch('http://127.0.0.1:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            alert('Login successful');
            localStorage.setItem('token', data.token);  // Store the token in local storage
            const decodedToken = JSON.parse(atob(data.token.split('.')[1])); // Decode the token to get the role
            localStorage.setItem('role', decodedToken.role); // Store the role in local storage
            setIsAuthenticated(true);
            setUserRole(decodedToken.role);  // Set the user role in state

            // Redirect based on role
            if (decodedToken.role === 'cashier') {
                navigate('/cashier-portal');
            } else if (decodedToken.role === 'waiter') {
                navigate('/waiter-portal');
            } else {
                navigate('/');
            }
        } else {
            alert(data.message);
        }
    };

    return (
        <div>
            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? <Link to="/register">Register here</Link></p>
            <Logout setIsAuthenticated={setIsAuthenticated} />  {/* Add the Logout button */}
        </div>
    );
}

export default LoginPage;