import React, { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';

function AddToCartButton({ item }) {
  const { addToCart } = useContext(CartContext);

  return (
    <button onClick={() => addToCart(item)}>Add to Cart</button>
  );
}

export default AddToCartButton; 