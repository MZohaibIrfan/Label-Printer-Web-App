import React, { useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import ItemList from '../components/ItemList';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function OrderPage() {
    const query = useQuery();
    const tableId = query.get('table');
    const { cart, clearCart } = useContext(CartContext);

    useEffect(() => {
        // Fetch any necessary data based on tableId
        console.log(`Table ID: ${tableId}`);
    }, [tableId]);

    const handleOrder = async () => {
        const order = {
            items: JSON.stringify(cart),
            total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
            table_id: tableId,
        };

        const token = localStorage.getItem('token');  // Retrieve the token from local storage

        try {
            const response = await fetch('http://127.0.0.1:5000/api/orders/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`  // Include the token in the request headers
                },
                body: JSON.stringify(order)
            });

            if (response.ok) {
                alert('Order placed successfully!');
                clearCart();
            } else {
                const data = await response.json();
                alert(data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to place order. Please try again.');
        }
    };

    return (
        <div>
            <h1>Order for Table {tableId}</h1>
            <ItemList />
            <button onClick={handleOrder}>Place Order</button>
        </div>
    );
}

export default OrderPage;