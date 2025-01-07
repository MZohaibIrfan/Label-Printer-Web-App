import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';

function CheckoutPage({ setIsAuthenticated }) {
  const { cart, clearCart } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();
  const tableId = location.state?.tableId;
  const previousPage = location.state?.from || '/home';

  const handlePlaceOrder = async () => {
    const order = {
      items: cart,
      total: cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
      table_id: tableId,
    };

    try {
      const response = await fetch('http://127.0.0.1:5000/api/orders/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      const data = await response.json();
      console.log('Order placed:', data);
      clearCart();
      alert('Order placed successfully!');
      navigate(previousPage, { state: { orderId: data.order_id } });
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    }
  };

  const styles = {
    page: {
      backgroundColor: '#f0f2f5',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
    },
    container: {
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      width: '100%',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    header: {
      textAlign: 'center',
      color: '#333',
      marginBottom: '20px',
    },
    section: {
      margin: '20px 0',
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    cartList: {
      listStyleType: 'none',
      padding: 0,
      margin: 0,
    },
    cartItem: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '10px',
      borderBottom: '1px solid #ccc',
    },
    button: {
      display: 'block',
      width: '100%',
      padding: '10px 20px',
      margin: '10px 0',
      backgroundColor: '#007BFF',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      textAlign: 'center',
      textDecoration: 'none',
    },
    placeOrderButton: {
      backgroundColor: '#28a745',
    },
    logoutButton: {
      backgroundColor: '#dc3545',
    },
  };

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.header}>Checkout</h1>
        <div style={styles.section}>
          <ul style={styles.cartList}>
            {cart.map((item, index) => (
              <li key={index} style={styles.cartItem}>
                <span>{item.name} - ${item.price} x {item.quantity}</span>
                <span>= ${item.price * item.quantity}</span>
              </li>
            ))}
            <li style={styles.cartItem}>
              <span><strong>Total</strong></span>
              <span><strong>= ${totalPrice.toFixed(2)}</strong></span>
            </li>
          </ul>
          <button style={{ ...styles.button, ...styles.placeOrderButton }} onClick={handlePlaceOrder}>Place Order</button>
          <button style={{ ...styles.button, ...styles.logoutButton }} onClick={() => setIsAuthenticated(false)}>Logout</button>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;