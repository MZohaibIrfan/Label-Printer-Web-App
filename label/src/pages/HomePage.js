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
    navigate('/checkout', { state: { tableId, from: location.pathname + location.search } });
  };

  const styles = {
    page: {
      backgroundColor: '#f5f5f5', // Light gray background
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: '20px',
    },
    container: {
      display: 'flex',
      justifyContent: 'space-between',
      width: '100%',
      maxWidth: '1200px',
    },
    itemListContainer: {
      flex: 1,
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#ffffff', // White background for container
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      color: '#333333', // Dark gray text color
    },
    cartContainer: {
      width: '300px',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#ffffff', // White background for container
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      color: '#333333', // Dark gray text color
      marginLeft: '20px',
    },
    header: {
      textAlign: 'center',
      color: '#333333', // Dark gray color for headers
      marginBottom: '20px',
      fontSize: '2em',
      fontWeight: 'bold',
    },
    section: {
      margin: '20px 0',
      padding: '20px',
      backgroundColor: '#ffffff', // White background for sections
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      color: '#333333', // Dark gray text color
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
      borderBottom: '1px solid #dddddd', // Light gray border for cart items
      color: '#333333', // Dark gray text color for cart items
    },
    button: {
      display: 'block',
      width: '100%',
      padding: '10px 20px',
      margin: '10px 0',
      backgroundColor: '#007BFF', // Blue color for buttons
      color: '#ffffff', // White text color
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      textAlign: 'center',
      textDecoration: 'none',
      transition: 'background-color 0.3s ease',
    },
    buttonHover: {
      backgroundColor: '#0056b3', // Darker blue for hover effect
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.itemListContainer}>
          <Logout setIsAuthenticated={setIsAuthenticated} />
          <h1 style={styles.header}>Menu</h1>
          <div style={styles.section}>
            <ItemList />
          </div>
          <button
            style={styles.button}
            onClick={handleGoToCheckout}
            onMouseEnter={(e) => e.target.style.backgroundColor = styles.buttonHover.backgroundColor}
            onMouseLeave={(e) => e.target.style.backgroundColor = styles.button.backgroundColor}
          >
            Go to Checkout
          </button>
          <button
            style={styles.button}
            onClick={() => setIsAuthenticated(false)}
            onMouseEnter={(e) => e.target.style.backgroundColor = styles.buttonHover.backgroundColor}
            onMouseLeave={(e) => e.target.style.backgroundColor = styles.button.backgroundColor}
          >
            Logout
          </button>
        </div>
        <div style={styles.cartContainer}>
          <h2 style={styles.header}>Your Cart</h2>
          <div style={styles.section}>
            <ul style={styles.cartList}>
              {cart.map((item, index) => (
                <li key={index} style={styles.cartItem}>
                  <span>{item.name} - ${item.price} x {item.quantity}</span>
                  <span>= ${item.price * item.quantity}</span>
                </li>
              ))}
            </ul>
            <button
              style={styles.button}
              onClick={handleGoToCheckout}
              onMouseEnter={(e) => e.target.style.backgroundColor = styles.buttonHover.backgroundColor}
              onMouseLeave={(e) => e.target.style.backgroundColor = styles.button.backgroundColor}
            >
              Go to Checkout
            </button>
            <button
              style={styles.button}
              onClick={() => setIsAuthenticated(false)}
              onMouseEnter={(e) => e.target.style.backgroundColor = styles.buttonHover.backgroundColor}
              onMouseLeave={(e) => e.target.style.backgroundColor = styles.button.backgroundColor}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;