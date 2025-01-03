import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';

function CheckoutPage({ setIsAuthenticated }) {
  const { cart } = useContext(CartContext);
  const location = useLocation();
  const tableId = location.state?.tableId;

  const handlePlaceOrder = async () => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const response = await fetch('http://127.0.0.1:5000/api/orders/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ items: cart, total, table_id: tableId })
    });

    if (response.ok) {
      alert('Order placed successfully');
    } else {
      alert('Failed to place order');
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
    cartList: {
      listStyleType: 'none',
      padding: 0,
    },
    cartItem: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '10px',
      borderBottom: '1px solid #ccc',
    },
    total: {
      textAlign: 'right',
      fontWeight: 'bold',
      marginTop: '20px',
    },
    placeOrderButton: {
      display: 'block',
      margin: '20px auto',
      padding: '10px 20px',
      backgroundColor: '#28a745',
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

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Checkout</h1>
      <ul style={styles.cartList}>
        {cart.map((item, index) => (
          <li key={index} style={styles.cartItem}>
            <span>{item.name} - ${item.price} x {item.quantity}</span>
            <span>= ${item.price * item.quantity}</span>
          </li>
        ))}
      </ul>
      <div style={styles.total}>
        Total: ${totalAmount.toFixed(2)}
      </div>
      <button style={styles.placeOrderButton} onClick={handlePlaceOrder}>Place Order</button>
      <button style={styles.logoutButton} onClick={() => setIsAuthenticated(false)}>Logout</button>
    </div>
  );
}

export default CheckoutPage;