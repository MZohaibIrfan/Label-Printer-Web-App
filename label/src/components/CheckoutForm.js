import React from 'react';

function CheckoutForm({ onOrder }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onOrder();
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Place Order</button>
    </form>
  );
}

export default CheckoutForm;