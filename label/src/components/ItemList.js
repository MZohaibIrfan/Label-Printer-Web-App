import React, { useContext, useState } from 'react';
import { CartContext } from '../contexts/CartContext';

const jsonString = `[
  { "id": 1, "name": "Beef Short Ribs", "price": 15 },
  { "id": 2, "name": "Chicken Thighs", "price": 10 },
  { "id": 3, "name": "Beef Brisket", "price": 12 },
  { "id": 4, "name": "Spicy Chicken", "price": 11 },
  { "id": 5, "name": "Shrimp", "price": 14 },
  { "id": 6, "name": "Scallops", "price": 16 },
  { "id": 7, "name": "Vegetable Platter", "price": 8 },
  { "id": 8, "name": "Tofu", "price": 7 },
  { "id": 9, "name": "Beef Tongue", "price": 13 },
  { "id": 10, "name": "Mushroom Platter", "price": 9 },
  { "id": 11, "name": "Kimchi", "price": 5 }
]`;

const items = JSON.parse(jsonString);

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

  const styles = {
    itemContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px',
      borderBottom: '1px solid #ccc',
      marginBottom: '10px',
    },
    itemName: {
      fontWeight: 'bold',
    },
    itemPrice: {
      color: '#555',
    },
    quantitySelect: {
      marginRight: '10px',
    },
    addButton: {
      padding: '5px 10px',
      backgroundColor: '#28a745',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
    },
    removeButton: {
      padding: '5px 10px',
      backgroundColor: '#dc3545',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
    },
  };

  return (
    <div>
      {items.map(item => (
        <div key={item.id} style={styles.itemContainer}>
          <div>
            <span style={styles.itemName}>{item.name}</span> - <span style={styles.itemPrice}>${item.price.toFixed(2)}</span>
          </div>
          <div>
            <select
              style={styles.quantitySelect}
              value={quantities[item.id] || 1}
              onChange={(e) => handleQuantityChange(item, parseInt(e.target.value))}
            >
              {[...Array(10).keys()].map(i => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            <button style={styles.addButton} onClick={() => addToCart(item, quantities[item.id] || 1)}>Add to Cart</button>
            {isInCart(item) && (
              <button style={styles.removeButton} onClick={() => removeFromCart(item, quantities[item.id] || 1)}>Remove from Cart</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ItemList;