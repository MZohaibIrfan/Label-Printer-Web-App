import React, { useContext } from 'react';
import ItemList from '../components/ItemList';
import { CartContext } from '../contexts/CartContext';

function HomePage() {
  const { cart } = useContext(CartContext);

  return (
    <div>
      <h1>Items</h1>
      <ItemList />
      <h2>Cart</h2>
      <ul>
        {cart.map((item, index) => (
          <li key={index}>
            {item.name} - ${item.price} x {item.quantity} = ${item.price * item.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HomePage;