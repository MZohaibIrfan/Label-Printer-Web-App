from flask import Flask, request, jsonify, send_file, redirect
import sqlite3
import json
import uuid
from flask_cors import CORS
import os
import logging
from datetime import datetime, timezone, timedelta
from utils import generate_receipt, generate_pdf_receipt, print_receipt_with_cut
import qrcode
from io import BytesIO
import jwt

app = Flask(__name__)
CORS(app)
SECRET_KEY = os.getenv('SECRET_KEY', 'your_secret_key')
logging.basicConfig(level=logging.INFO)

def register_routes(app):
    @app.route('/api/items', methods=['GET'])
    def get_items():
        conn = sqlite3.connect('pos.db')
        try:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM items')
            items = cursor.fetchall()
        except Exception as e:
            logging.error(f"Error fetching items: {e}")
            return jsonify({'error': 'Failed to fetch items'}), 500
        finally:
            conn.close()
        return jsonify(items)

    @app.route('/api/orders/add', methods=['POST'])
    def add_order():
        order = request.json
        items = json.dumps(order['items'])  # Convert items to JSON string
        total = order['total']
        table_id = order.get('table_id', None)

        conn = sqlite3.connect('pos.db')
        try:
            cursor = conn.cursor()
            cursor.execute('INSERT INTO orders (items, total, status, table_id) VALUES (?, ?, ?, ?)', (items, total, 'pending', table_id))
            conn.commit()
            order_id = cursor.lastrowid
        except Exception as e:
            logging.error(f"Error adding order: {e}")
            return jsonify({'error': 'Failed to add order'}), 500
        finally:
            conn.close()

        receipt_path = generate_receipt(order_id, items, total)
        pdf_path = generate_pdf_receipt(order_id, items, total)
        print_receipt_with_cut(receipt_path)
        
        return jsonify({'message': 'Order added', 'order_id': order_id}), 201

    @app.route('/api/orders', methods=['GET'])
    def get_orders():
        conn = sqlite3.connect('pos.db')
        try:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM orders')
            orders = cursor.fetchall()
        except Exception as e:
            logging.error(f"Error fetching orders: {e}")
            return jsonify({'error': 'Failed to fetch orders'}), 500
        finally:
            conn.close()
        return jsonify(orders)
    
    @app.route('/api/orders/<int:order_id>/complete', methods=['POST'])
    def complete_order(order_id):
        conn = sqlite3.connect('pos.db')
        try:
            cursor = conn.cursor()
            cursor.execute('UPDATE orders SET status = ? WHERE id = ?', ('completed', order_id))
            conn.commit()
        except Exception as e:
            logging.error(f"Error completing order: {e}")
            return jsonify({'error': 'Failed to complete order'}), 500
        finally:
            conn.close()
        return jsonify({'message': 'Order completed'}), 200

    @app.route('/api/orders/completed', methods=['GET'])
    def get_completed_orders():
        conn = sqlite3.connect('pos.db')
        try:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM orders WHERE status = ?', ('completed',))
            orders = cursor.fetchall()
        except Exception as e:
            logging.error(f"Error fetching completed orders: {e}")
            return jsonify({'error': 'Failed to fetch completed orders'}), 500
        finally:
            conn.close()

        # Parse items JSON string into list of objects
        formatted_orders = []
        for order in orders:
            formatted_order = list(order)
            formatted_order[1] = json.loads(order[1])  # Assuming items are in the second column
            formatted_orders.append(formatted_order)

        logging.info(f"Formatted completed orders: {formatted_orders}")  # Log the formatted orders
        return jsonify(formatted_orders)

    @app.route('/api/orders/<int:order_id>/pay', methods=['POST'])
    def process_payment(order_id):
        conn = sqlite3.connect('pos.db')
        try:
            cursor = conn.cursor()
            cursor.execute('UPDATE orders SET status = ? WHERE id = ?', ('paid', order_id))
            conn.commit()
        except Exception as e:
            logging.error(f"Error processing payment: {e}")
            return jsonify({'error': 'Failed to process payment'}), 500
        finally:
            conn.close()
        return 'Payment processed', 200
    
    @app.route('/api/orders/pending', methods=['GET'])
    def get_pending_orders():
        conn = sqlite3.connect('pos.db')
        try:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM orders WHERE status = ?', ('pending',))
            orders = cursor.fetchall()
        except Exception as e:
            logging.error(f"Error fetching pending orders: {e}")
            return jsonify({'error': 'Failed to fetch pending orders'}), 500
        finally:
            conn.close()

        # Parse items JSON string into list of objects
        formatted_orders = []
        for order in orders:
            formatted_order = list(order)
            formatted_order[1] = json.loads(order[1])  # Assuming items are in the second column
            formatted_orders.append(formatted_order)

        logging.info(f"Formatted pending orders: {formatted_orders}")  # Log the formatted orders
        return jsonify(formatted_orders)

    @app.route('/generate_qr', methods=['GET'])
    def generate_qr():
        table_id = request.args.get('table_id')
        if not table_id:
            return jsonify({'message': 'Table ID is required'}), 400

        # Generate a unique token for the QR code
        unique_token = str(uuid.uuid4())
        data = f'http://127.0.0.1:5000/scan_qr?token={unique_token}&table_id={table_id}'
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(data)
        qr.make(fit=True)

        img = qr.make_image(fill='black', back_color='white')
        buffer = BytesIO()
        img.save(buffer, 'PNG')
        buffer.seek(0)

        return send_file(buffer, mimetype='image/png', as_attachment=True, download_name=f'table_{table_id}_qr.png')

    @app.route('/scan_qr', methods=['GET'])
    def scan_qr():
        token = request.args.get('token')
        table_id = request.args.get('table_id')
        if not token or not table_id:
            return jsonify({'message': 'Token and Table ID are required'}), 400

        # Redirect to the homepage with the table ID
        return redirect(f'http://127.0.0.1:3000/home?table_id={table_id}')

    @app.route('/register', methods=['POST'])
    def register():
        data = request.json
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400

        # Add your registration logic here (e.g., save to database)
        return jsonify({'message': 'User registered successfully'}), 201

    
    @app.route('/login', methods=['POST'])
    def login():
        data = request.json
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400

        # Add your authentication logic here (e.g., check username and password in the database)
        # For demonstration purposes, let's assume the login is successful and return a token
        # Replace this with actual role fetching logic
        role = 'cashier' if username == 'cashier' else 'waiter'
        token = jwt.encode({'username': username, 'role': role}, SECRET_KEY, algorithm='HS256')
        return jsonify({'token': token}), 200

register_routes(app)

if __name__ == '__main__':
    app.run(debug=True)