import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderPage from './pages/OrderPage';
import WaiterPage from './pages/WaiterPage';
import CashierPage from './pages/CashierPage';
import OrderHistory from './pages/OrderHistory';
import HomePage from './pages/HomePage';
import { CartProvider } from './contexts/CartContext';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role);
    }
  }, []);

  console.log('isAuthenticated:', isAuthenticated);
  console.log('userRole:', userRole);

  return (
    <CartProvider>
      <Router>
        <NavBar isAuthenticated={isAuthenticated} userRole={userRole} />
        <Routes>
          <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/checkout" element={<CheckoutPage setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/home" element={<HomePage setIsAuthenticated={setIsAuthenticated} />} /> {/* Allow access to HomePage without authentication */}
          <Route path="/waiter-portal" element={isAuthenticated && userRole === 'waiter' ? <WaiterPage setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} />
          <Route path="/cashier-portal" element={isAuthenticated && userRole === 'cashier' ? <CashierPage setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} />
          <Route path="/order-history" element={isAuthenticated && userRole === 'customer' ? <OrderHistory setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to="/home" />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;