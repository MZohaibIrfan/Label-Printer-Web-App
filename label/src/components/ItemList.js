import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from '../contexts/CartContext';

const jsonString = `[
  { "id": 1, "name": "Beef Short Ribs", "price": 15, "image_url": "Beef Short Ribs.jpg" },
  { "id": 2, "name": "Chicken Thighs", "price": 10, "image_url": "Chicken Thighs.jpg" },
  { "id": 3, "name": "Beef Brisket", "price": 12, "image_url": "Beef Brisket.jpg" },
  { "id": 4, "name": "Spicy Chicken", "price": 11, "image_url": "Spicy Chicken.jpg" },
  { "id": 5, "name": "Shrimp", "price": 14, "image_url": "Shrimp.jpg" },
  { "id": 6, "name": "Scallops", "price": 16, "image_url": "Scallops.jpg" },
  { "id": 7, "name": "Vegetable Platter", "price": 8, "image_url": "Vegetable Platter.jpg" },
  { "id": 8, "name": "Tofu", "price": 7, "image_url": "Tofu.jpg" },
  { "id": 9, "name": "Beef Tongue", "price": 13, "image_url": "Beef Tongue.jpg" },
  { "id": 10, "name": "Mushroom Platter", "price": 9, "image_url": "Mushroom Platter.jpg" },
  { "id": 11, "name": "Kimchi", "price": 5, "image_url": "Kimchi.jpg" }
]`;

const items = JSON.parse(jsonString);

function ItemList() {
  const { cart, addToCart, removeFromCart } = useContext(CartContext);
  const [quantities, setQuantities] = useState({});
  const [fetchedItems, setFetchedItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      const response = await fetch('http://127.0.0.1:5000/api/items');
      const data = await response.json();
      setFetchedItems(data);
    };

    fetchItems();
  }, []);

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
      borderBottom: '1px solid #ddd',
    },
    itemImage: {
      width: '100px',
      height: '100px',
      objectFit: 'cover',
      borderRadius: '8px',
      marginRight: '10px',
    },
    itemDetails: {
      flex: 1,
    },
    itemName: {
      fontSize: '18px',
      fontWeight: 'bold',
    },
    itemPrice: {
      fontSize: '16px',
      color: '#888',
    },
    quantityInput: {
      width: '50px',
      marginRight: '10px',
    },
    button: {
      padding: '5px 10px',
      backgroundColor: '#007BFF',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      marginRight: '5px',
    },
  };

  return (
    <div>
      {fetchedItems.length > 0 ? fetchedItems.map(item => (
        <div key={item.id} style={styles.itemContainer}>
          <img src={`http://127.0.0.1:5000${item.image_url}`} alt={item.name} style={styles.itemImage} />
          <div style={styles.itemDetails}>
            <div style={styles.itemName}>{item.name}</div>
            <div style={styles.itemPrice}>${item.price}</div>
            <input
              type="number"
              min="1"
              value={quantities[item.id] || 1}
              onChange={(e) => handleQuantityChange(item, parseInt(e.target.value))}
              style={styles.quantityInput}
            />
            <button style={styles.button} onClick={() => addToCart(item, quantities[item.id] || 1)}>Add to Cart</button>
            {isInCart(item) && (
              <button style={styles.button} onClick={() => removeFromCart(item.id, quantities[item.id] || 1)}>Remove from Cart</button>
            )}
          </div>
        </div>
      )) : items.map(item => (
        <div key={item.id} style={styles.itemContainer}>
          <img src={`http://127.0.0.1:5000/images/${encodeURIComponent(item.image_url)}`} alt={item.name} style={styles.itemImage} />
          <div style={styles.itemDetails}>
            <div style={styles.itemName}>{item.name}</div>
            <div style={styles.itemPrice}>${item.price}</div>
            <input
              type="number"
              min="1"
              value={quantities[item.id] || 1}
              onChange={(e) => handleQuantityChange(item, parseInt(e.target.value))}
              style={styles.quantityInput}
            />
            <button style={styles.button} onClick={() => addToCart(item, quantities[item.id] || 1)}>Add to Cart</button>
            {isInCart(item) && (
              <button style={styles.button} onClick={() => removeFromCart(item.id, quantities[item.id] || 1)}>Remove from Cart</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ItemList;