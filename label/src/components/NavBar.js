import React from 'react';
import { Link } from 'react-router-dom';

function NavBar({ isAuthenticated, userRole }) {
  console.log('isAuthenticated:', isAuthenticated);
  console.log('userRole:', userRole);

  return (
    <nav>
      <ul>
        {isAuthenticated && userRole === 'customer' && (
          <>
            <li><Link to="/home">Home</Link></li>
            <li><Link to="/checkout">Checkout</Link></li>
            <li><Link to="/order-history">Order History</Link></li>
          </>
        )}
        {isAuthenticated && userRole === 'waiter' && (
          <li><Link to="/waiter-portal">Waiter Portal</Link></li>
        )}
        {isAuthenticated && userRole === 'cashier' && (
          <li><Link to="/cashier-portal">Cashier Portal</Link></li>
        )}
        {!isAuthenticated && <li><Link to="/login">Login</Link></li>}
      </ul>
    </nav>
  );
}

export default NavBar;