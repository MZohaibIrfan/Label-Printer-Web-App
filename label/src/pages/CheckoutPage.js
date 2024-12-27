import React, { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';
import CheckoutForm from '../components/CheckoutForm'; // Adjust the path as needed

function CheckoutPage() {
  const { cart, clearCart } = useContext(CartContext);

  const handleOrder = () => {
    const order = {
      items: JSON.stringify(cart),
      total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0) // Updated to include quantity
    };

    fetch('http://127.0.0.1:5000/api/orders/add', { // Updated URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    })
    .then(response => response.text())
    .then(data => {
      clearCart();
      alert('Order placed successfully!');
    })
    .catch(error => console.error('Error:', error));
  };

  return (
    <div>
      <h1>Checkout</h1>
      <ul>
        {cart.map((item, index) => (
          <li key={index}>
            {item.name} - ${item.price} x {item.quantity} = ${item.price * item.quantity}
          </li>
        ))}
      </ul>
      <h2>Total: ${cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}</h2> {/* Display total */}
      <CheckoutForm onOrder={handleOrder} />
    </div>
  );
}

export default CheckoutPage;