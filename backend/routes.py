from flask import Flask, request, jsonify, send_file, send_from_directory, redirect
import sqlite3
import json
import uuid
from flask_cors import CORS
import os
import logging
from datetime import datetime, timezone, timedelta
from utils import generate_receipt, generate_pdf_receipt, print_receipt_star_pop10  # Ensure generate_receipt, generate_pdf_receipt, and print_receipt_star_pop10 are imported
import qrcode
from io import BytesIO
import jwt
from db import get_hk_time

def register_routes(app, SECRET_KEY):
    # Serve images from the images folder
    @app.route('/images/<path:filename>')
    def serve_image(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    @app.route('/')
    def home():
        # Redirect to the order page for table 1
        return redirect('/home?table_id=1')

    @app.route('/api/items', methods=['GET'])
    def get_items():
        conn = sqlite3.connect('pos.db')
        try:
            cursor = conn.cursor()
            cursor.execute('SELECT id, name, price, image_url FROM items')
            items = cursor.fetchall()
            items = [{'id': item[0], 'name': item[1], 'price': item[2], 'image_url': f'/images/{item[3]}'} for item in items]
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
        timestamp = get_hk_time()

        conn = sqlite3.connect('pos.db')
        try:
            cursor = conn.cursor()
            cursor.execute('INSERT INTO orders (items, total, status, table_id, timestamp) VALUES (?, ?, ?, ?, ?)', (items, total, 'pending', table_id, timestamp))
            conn.commit()
            order_id = cursor.lastrowid
            logging.info(f"Order added with ID: {order_id}")
        except Exception as e:
            logging.error(f"Error adding order: {e}")
            return jsonify({'error': 'Failed to add order'}), 500
        finally:
            conn.close()

        # Generate the receipts
        receipt_path = generate_receipt(order_id, items, total)
        pdf_receipt_path = generate_pdf_receipt(order_id, items, total)
        
        return jsonify({'message': 'Order added', 'order_id': order_id, 'receipt_path': receipt_path, 'pdf_receipt_path': pdf_receipt_path}), 201

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
        served_timestamp = get_hk_time()
        conn = sqlite3.connect('pos.db')
        try:
            cursor = conn.cursor()
            cursor.execute('UPDATE orders SET status = ?, served_timestamp = ? WHERE id = ?', ('completed', served_timestamp, order_id))
            conn.commit()
        except Exception as e:
            logging.error(f"Error completing order: {e}")
            return jsonify({'error': 'Failed to complete order'}), 500
        finally:
            conn.close()
        return jsonify({'message': 'Order completed', 'served_timestamp': served_timestamp}), 200

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

    @app.route('/api/orders/<int:order_id>/receipt', methods=['POST'])
    def generate_order_receipt(order_id):
        data = request.get_json()
        items = json.dumps(data.get('items'))  # Convert items to JSON string
        total = data.get('total')
        
        # Generate the receipt
        receipt_path = generate_receipt(order_id, items, total)
        
        # Print the receipt
        print_receipt_star_pop10(receipt_path)
        
        return jsonify({'receiptPath': receipt_path}), 200

    @app.route('/api/orders/<int:order_id>/print_receipt', methods=['POST'])
    def print_order_receipt(order_id):
        conn = sqlite3.connect('pos.db')
        try:
            cursor = conn.cursor()
            cursor.execute('SELECT items, total FROM orders WHERE id = ?', (order_id,))
            order = cursor.fetchone()
            if order is None:
                return jsonify({'error': 'Order not found'}), 404

            items, total = order
            receipt_path = generate_receipt(order_id, items, total)
            print_receipt_star_pop10(receipt_path)
        except Exception as e:
            logging.error(f"Error printing receipt: {e}")
            return jsonify({'error': 'Failed to print receipt'}), 500
        finally:
            conn.close()
        
        return jsonify({'message': 'Receipt printed'}), 200

    @app.route('/generate_qr', methods=['GET'])
    def generate_qr():
        table_id = request.args.get('table_id')
        if not table_id:
            return jsonify({'message': 'Table ID is required'}), 400

        # Generate a unique token for the QR code
        unique_token = str(uuid.uuid4())
        data = f'http://127.0.0.1:3000/home?table_id={table_id}'
        
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
        table_id = request.args.get('table_id')
        if not table_id:
            return jsonify({'message': 'Table ID is required'}), 400

        # Redirect to the home page with the table ID
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
        if username == 'cashier':
            role = 'cashier'
        elif username == 'waiter':
            role = 'waiter'
        else:
            role = 'customer'
        
        token = jwt.encode({'username': username, 'role': role}, SECRET_KEY, algorithm='HS256')
        return jsonify({'token': token}), 200