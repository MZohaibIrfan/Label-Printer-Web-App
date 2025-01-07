import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logout from '../components/Logout';  // Ensure the correct import path

function CashierPage({ setIsAuthenticated }) {
    const [completedOrders, setCompletedOrders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const role = localStorage.getItem('role');
        const token = localStorage.getItem('token');

        if (role !== 'cashier' || !token) {
            navigate('/login');
            return;
        }

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

        fetchCompletedOrders();
    }, [navigate]);

    const handlePrintReceipt = async (orderId, items, total) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://127.0.0.1:5000/api/orders/${orderId}/print_receipt`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ items, total })
        });

        if (response.ok) {
            alert('Receipt printed successfully');
        } else {
            alert('Failed to print receipt');
        }
    };

    const parseItems = (items) => {
        try {
            return JSON.parse(items);
        } catch (error) {
            console.error('Error parsing items:', error);
            return [];
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' });
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
            <h1 style={styles.header}>Completed Orders</h1>
            <Logout setIsAuthenticated={setIsAuthenticated} />  {/* Add the Logout button */}
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Order ID</th>
                        <th style={styles.th}>Table Number</th>
                        <th style={styles.th}>Items</th>
                        <th style={styles.th}>Total</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Timestamps</th> {/* New column for timestamps */}
                        <th style={styles.th}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {completedOrders.map(order => (
                        <tr key={order[0]}>
                            <td style={styles.td}>{order[0]}</td>
                            <td style={styles.td}>{order[4]}</td> {/* Display table number */}
                            <td style={styles.td}>
                                <ul style={styles.itemList}>
                                    {order[1].map((item, index) => (
                                        <li key={index} style={styles.item}>
                                            {item.name} - ${item.price} x {item.quantity} = ${item.price * item.quantity}
                                        </li>
                                    ))}
                                </ul>
                            </td>
                            <td style={styles.td}>${order[2]}</td>
                            <td style={styles.td}>{order[3]}</td>
                            <td style={styles.td}>
                                Placed: {formatTimestamp(order[5])}<br />
                                Served: {order[6] ? formatTimestamp(order[6]) : 'N/A'} {/* Display both timestamps */}
                            </td>
                            <td style={styles.td}>
                                <button style={styles.button} onClick={() => handlePrintReceipt(order[0], order[1], order[2])}>Print Receipt</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default CashierPage;