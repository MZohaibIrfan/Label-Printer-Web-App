from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

app = Flask(__name__)
CORS(app)  # Enable CORS

# Initialize SQLite database
def init_db():
    conn = sqlite3.connect('orders.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            items TEXT,
            total REAL
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@app.route('/')
def home():
    return "Server is running"

@app.route('/api/orders/add', methods=['POST'])
def add_order():
    order = request.json
    items = order['items']
    total = order['total']

    conn = sqlite3.connect('orders.db')
    cursor = conn.cursor()
    cursor.execute('INSERT INTO orders (items, total) VALUES (?, ?)', (items, total))
    conn.commit()
    order_id = cursor.lastrowid
    conn.close()

    print(f"Order ID: {order_id}, Items: {items}, Total: {total}")  # Debugging statement
    generate_receipt(order_id, items, total)
    return 'Order added', 201

@app.route('/api/orders', methods=['GET'])
def get_orders():
    conn = sqlite3.connect('orders.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM orders')
    orders = cursor.fetchall()
    conn.close()
    return jsonify(orders)

def generate_receipt(order_id, items, total):
    print(f"Generating receipt for Order ID: {order_id}")  # Debugging statement
    c = canvas.Canvas(f"receipt_{order_id}.pdf", pagesize=letter)
    
    # Set up the receipt layout
    c.setFont("Helvetica", 12)
    width, height = letter
    y_position = height - 50
    
    # Centered Header
    c.drawCentredString(width / 2, y_position, f"Order ID: {order_id}")
    y_position -= 20
    c.drawCentredString(width / 2, y_position, "Items:")
    y_position -= 20
    
    # Parse items
    items_list = eval(items)  # Convert string back to list of dictionaries
    for item in items_list:
        item_line = f"{item['name']} - ${item['price']} x {item['quantity']} = ${item['price'] * item['quantity']}"
        c.drawCentredString(width / 2, y_position, item_line)
        y_position -= 20
    
    # Total
    y_position -= 20
    c.drawCentredString(width / 2, y_position, f"Total: ${total}")
    
    # Footer
    y_position -= 40
    c.drawCentredString(width / 2, y_position, "Thank you for your purchase!")
    
    c.save()
    print(f"Receipt generated: receipt_{order_id}.pdf")  # Debugging statement

if __name__ == '__main__':
    app.run(debug=True)