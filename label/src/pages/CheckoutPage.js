import React, { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';
import CheckoutForm from '../components/CheckoutForm';

function CheckoutPage() {
  const { cart, clearCart } = useContext(CartContext);

  const handleOrder = () => {
    const order = {
      items: JSON.stringify(cart),
      total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    };

    fetch('http://127.0.0.1:5000/api/orders/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    })
      .then(response => response.json())
      .then(data => {
        clearCart();
        alert('Order placed successfully!');
        printReceipt(data.order_id);
      })
      .catch(error => console.error('Error:', error));
  };

  const printReceipt = (orderId) => {
    const printData = `
      <initialization/>
      <text>Order ID: ${orderId}\n</text>
      <cutpaper/>
    `;

    fetch('http://192.168.62.213/WebPRNT', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: printData,
    })
      .then(response => response.text())
      .then(data => {
        console.log('Print Success:', data);
      })
      .catch(error => console.error('Print Error:', error));
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