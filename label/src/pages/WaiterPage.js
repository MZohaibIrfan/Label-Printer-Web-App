import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logout from '../components/Logout';  // Ensure the correct import path

function WaiterPage({ setIsAuthenticated }) {
    const [pendingOrders, setPendingOrders] = useState([]);
    const [completedOrders, setCompletedOrders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const role = localStorage.getItem('role');
        const token = localStorage.getItem('token');

        if (role !== 'waiter' || !token) {
            navigate('/login');
            return;
        }

        const fetchPendingOrders = async () => {
            const response = await fetch('http://127.0.0.1:5000/api/orders/pending', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 403) {
                alert('Access denied');
                navigate('/login');
                return;
            }

            const data = await response.json();
            console.log('Fetched pending orders:', data);  // Log the fetched data
            setPendingOrders(data);
        };

        const fetchCompletedOrders = async () => {
            const response = await fetch('http://127.0.0.1:5000/api/orders/completed', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 403) {
                alert('Access denied');
                navigate('/login');
                return;
            }

            const data = await response.json();
            console.log('Fetched completed orders:', data);  // Log the fetched data
            setCompletedOrders(data);
        };

        fetchPendingOrders();
        fetchCompletedOrders();
    }, [navigate]);

    const handleCompleteOrder = async (orderId) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://127.0.0.1:5000/api/orders/${orderId}/complete`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const updatedPendingOrders = pendingOrders.filter(order => order[0] !== orderId);
            setPendingOrders(updatedPendingOrders);

            const completedOrder = pendingOrders.find(order => order[0] === orderId);
            if (completedOrder) {
                completedOrder[4] = 'completed';  // Update the status to 'completed'
                setCompletedOrders([...completedOrders, completedOrder]);
            }
        } else {
            alert('Failed to complete order');
        }
    };

    const parseItems = (items) => {
        try {
            if (Array.isArray(items)) {
                return items;
            } else {
                console.error('Items is not an array:', items);
                return [];
            }
        } catch (error) {
            console.error('Failed to parse items:', error);
            return [];
        }
    };

    const styles = {
        container: {
            padding: '20px',
            fontFamily: 'Arial, sans-serif',
        },
        header: {
            textAlign: 'center',
            color: '#333',
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '20px',
        },
        th: {
            backgroundColor: '#f2f2f2',
            padding: '10px',
            border: '1px solid #ddd',
        },
        td: {
            padding: '10px',
            border: '1px solid #ddd',
            textAlign: 'center',
        },
        itemList: {
            listStyleType: 'none',
            padding: 0,
            margin: 0,
        },
        item: {
            textAlign: 'left',
        },
        button: {
            padding: '5px 10px',
            backgroundColor: '#007BFF',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
        },
        logoutButton: {
            display: 'block',
            margin: '20px auto',
            padding: '10px 20px',
            backgroundColor: '#007BFF',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
        },
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Pending Orders</h1>
            <Logout setIsAuthenticated={setIsAuthenticated} />  {/* Add the Logout button */}
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Order ID</th>
                        <th style={styles.th}>Items</th>
                        <th style={styles.th}>Total</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {pendingOrders.map(order => (
                        <tr key={order[0]}>
                            <td style={styles.td}>{order[0]}</td>
                            <td style={styles.td}>
                                <ul style={styles.itemList}>
                                    {parseItems(order[1]).map((item, index) => (
                                        <li key={index} style={styles.item}>
                                            {item.name} - ${item.price} x {item.quantity} = ${item.price * item.quantity}
                                        </li>
                                    ))}
                                </ul>
                            </td>
                            <td style={styles.td}>${order[2]}</td>
                            <td style={styles.td}>{order[3]}</td>
                            <td style={styles.td}>
                                <button style={styles.button} onClick={() => handleCompleteOrder(order[0])}>Complete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h1 style={styles.header}>Completed Orders</h1>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Order ID</th>
                        <th style={styles.th}>Items</th>
                        <th style={styles.th}>Total</th>
                        <th style={styles.th}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {completedOrders.map(order => (
                        <tr key={order[0]}>
                            <td style={styles.td}>{order[0]}</td>
                            <td style={styles.td}>
                                <ul style={styles.itemList}>
                                    {parseItems(order[1]).map((item, index) => (
                                        <li key={index} style={styles.item}>
                                            {item.name} - ${item.price} x {item.quantity} = ${item.price * item.quantity}
                                        </li>
                                    ))}
                                </ul>
                            </td>
                            <td style={styles.td}>${order[2]}</td>
                            <td style={styles.td}>{order[3]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default WaiterPage;