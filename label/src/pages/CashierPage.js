import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logout from '../components/Logout';  // Ensure the correct import path

function CashierPage({ setIsAuthenticated }) {
    const [completedOrders, setCompletedOrders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const role = localStorage.getItem('role');
        console.log('Role:', role);  // Debugging: Log the role
        if (role !== 'cashier') {
            navigate('/login');
            return;
        }

        const fetchCompletedOrders = async () => {
            const token = localStorage.getItem('token');
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
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/orders/${orderId}/receipt`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ items, total })
            });

            if (response.ok) {
                const { receiptPath } = await response.json();
                window.open(receiptPath, '_blank');  // Open the receipt in a new tab
            } else {
                alert('Failed to generate receipt');
            }
        } catch (error) {
            console.error('Error generating receipt:', error);
            alert('Error generating receipt');
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
            <h1 style={styles.header}>Completed Orders</h1>
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