import React, { useContext, useState } from 'react';
import { CartContext } from '../contexts/CartContext';

const items = [
  { id: 1, name: 'Item 1', price: 10 },
  { id: 2, name: 'Item 2', price: 20 },
  // Add more items as needed
];

function ItemList() {
  const { cart, addToCart, removeFromCart } = useContext(CartContext);
  const [quantities, setQuantities] = useState({});

  const handleQuantityChange = (item, quantity) => {
    setQuantities(prevQuantities => ({
      ...prevQuantities,
      [item.id]: quantity
    }));
  };

  const isInCart = (item) => cart.some(cartItem => cartItem.id === item.id);

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>
          <span>{item.name} - ${item.price}</span>
          <select
            value={quantities[item.id] || 1}
            onChange={(e) => handleQuantityChange(item, parseInt(e.target.value))}
          >
            {[...Array(10).keys()].map(i => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
          <button onClick={() => addToCart(item, quantities[item.id] || 1)}>Add to Cart</button>
          {isInCart(item) && (
            <button onClick={() => removeFromCart(item)}>Remove from Cart</button>
          )}
        </div>
      ))}
    </div>
  );
}

export default ItemList;