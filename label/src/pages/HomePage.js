import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ItemList from '../components/ItemList';
import { CartContext } from '../contexts/CartContext';
import Logout from '../components/Logout';

function HomePage({ setIsAuthenticated }) {
  const { cart } = useContext(CartContext);
  const [tableId, setTableId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tableId = params.get('table_id');
    setTableId(tableId);
  }, [location]);

  const handleGoToCheckout = () => {
    navigate('/checkout', { state: { tableId } });
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
    section: {
      margin: '20px 0',
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
    checkoutButton: {
      display: 'block',
      margin: '20px auto',
      padding: '10px 20px',
      backgroundColor: '#28a745',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Items</h1>
      <div style={styles.section}>
        <ItemList />
      </div>
      <h2 style={styles.header}>Cart</h2>
      <ul style={styles.cartList}>
        {cart.map((item, index) => (
          <li key={index} style={styles.cartItem}>
            <span>{item.name} - ${item.price} x {item.quantity}</span>
            <span>= ${item.price * item.quantity}</span>
          </li>
        ))}
      </ul>
      <button style={styles.checkoutButton} onClick={handleGoToCheckout}>Go to Checkout</button>
      <button style={styles.logoutButton} onClick={() => setIsAuthenticated(false)}>Logout</button>
    </div>
  );
}

export default HomePage;