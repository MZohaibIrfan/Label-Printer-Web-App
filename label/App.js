import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CheckoutPage from './pages/CheckoutPage';
import OrderPage from './pages/OrderPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WaiterPage from './pages/WaiterPage';
import CashierPage from './pages/CashierPage';
import OrderHistory from './pages/OrderHistory';
import NavBar from './components/NavBar';
import { CartProvider } from './contexts/CartContext';

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [userRole, setUserRole] = React.useState('');

  React.useEffect(() => {
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
          <Route path="/order" element={isAuthenticated ? <OrderPage /> : <Navigate to="/login" />} />
          <Route path="/waiter-portal" element={isAuthenticated && userRole === 'waiter' ? <WaiterPage setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} />
          <Route path="/cashier-portal" element={isAuthenticated && userRole === 'cashier' ? <CashierPage setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} />
          <Route path="/order-history" element={isAuthenticated && userRole === 'customer' ? <OrderHistory setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} />
          <Route path="/home" element={<HomePage setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/" element={<Navigate to="/home" />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;