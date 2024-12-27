import React, { useContext, useState } from 'react';
import { CartContext } from '../contexts/CartContext';

const items = [
  { id: 1, name: 'Apples', price: 3 },
  { id: 2, name: 'Bananas', price: 1 },
  { id: 3, name: 'Carrots', price: 2 },
  { id: 4, name: 'Bread', price: 2.5 },
  { id: 5, name: 'Milk', price: 1.5 },
  { id: 6, name: 'Eggs', price: 2 },
  { id: 7, name: 'Chicken Breast', price: 5 },
  { id: 8, name: 'Rice', price: 1.2 },
  { id: 9, name: 'Pasta', price: 1.3 },
  { id: 10, name: 'Tomatoes', price: 2.5 },
  { id: 11, name: 'Coke', price: 1 },
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
          <span>{item.name} - ${item.price.toFixed(2)}</span>
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
            <div>
              <button onClick={() => removeFromCart(item, quantities[item.id] || 1)}>Remove from Cart</button>
              <select
                value={quantities[item.id] || 1}
                onChange={(e) => handleQuantityChange(item, parseInt(e.target.value))}
              >
                {[...Array(cart.find(cartItem => cartItem.id === item.id).quantity).keys()].map(i => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ItemList;