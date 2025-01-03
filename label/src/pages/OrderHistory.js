import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logout from '../components/Logout';  // Ensure the correct import path

function OrderHistory({ setIsAuthenticated }) {
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrderHistory = async () => {
            const token = localStorage.getItem('token');
            const response = await fetch('http://127.0.0.1:5000/api/orders/history', {
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
            setOrders(data);
        };

        fetchOrderHistory();
    }, [navigate]);

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
            <h1 style={styles.header}>Order History</h1>
            <Logout setIsAuthenticated={setIsAuthenticated} />  {/* Add the Logout button */}
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Order ID</th>
                        <th style={styles.th}>Items</th>
                        <th style={styles.th}>Total</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order[0]}>
                            <td style={styles.td}>{order[0]}</td>
                            <td style={styles.td}>
                                <ul style={styles.itemList}>
                                    {parseItems(order[2]).map(item => (
                                        <li key={item.id} style={styles.item}>{item.name} - ${item.price} x {item.quantity}</li>
                                    ))}
                                </ul>
                            </td>
                            <td style={styles.td}>${order[3]}</td>
                            <td style={styles.td}>{order[4]}</td>
                            <td style={styles.td}>{new Date(order[5]).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default OrderHistory;