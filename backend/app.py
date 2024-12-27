from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from reportlab.lib.pagesizes import inch
from reportlab.pdfgen import canvas
import os
import logging
import win32print

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

    receipt_path = generate_receipt(order_id, items, total)
    pdf_path = generate_pdf_receipt(order_id, items, total)
    print_receipt_with_cut(receipt_path)
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
    receipt_dir = "C:\\Users\\igears\\Task 2 Label Printer App"
    if not os.path.exists(receipt_dir):
        os.makedirs(receipt_dir)
    
    receipt_path = os.path.join(receipt_dir, f"receipt_{order_id}.txt")
    
    receipt_width = 32  # Adjusted width for the mini printer
    
    def center_text(text):
        return text.center(receipt_width)
    
    def format_item_line(item_name, item_price, item_quantity, item_total):
        return f"{item_name:<15}{item_price:<7}{item_quantity:<4}{item_total}"
    
    with open(receipt_path, 'w') as f:
        # Header
        f.write(center_text("Grocery Store Name") + "\n")
        f.write(center_text("123 Main Street") + "\n")
        f.write(center_text("City, State ZIP") + "\n")
        f.write(center_text("Phone: (123) 456-7890") + "\n\n")
        
        # Order ID
        f.write(center_text(f"Order ID: {order_id}") + "\n\n")
        
        # Items Header
        f.write(center_text("Item Name       Price  Qty  Total") + "\n")
        
        # Parse items
        items_list = eval(items)  # Convert string back to list of dictionaries
        for item in items_list:
            item_name = item['name']
            item_price = f"${item['price']:.2f}"
            item_quantity = item['quantity']
            item_total = f"${item['price'] * item['quantity']:.2f}"
            f.write(center_text(format_item_line(item_name, item_price, item_quantity, item_total)) + "\n")
        
        # Total
        f.write("\n" + center_text(f"Total: ${total:.2f}") + "\n\n")
        
        # Footer
        f.write(center_text("Thank you for your purchase!") + "\n")
    
    return receipt_path

def generate_pdf_receipt(order_id, items, total):
    receipt_dir = "C:\\Users\\igears\\Task 2 Label Printer App"
    if not os.path.exists(receipt_dir):
        os.makedirs(receipt_dir)
    
    pdf_path = os.path.join(receipt_dir, f"receipt_{order_id}.pdf")
    #pdf is same as a receipt on a roll.
    # Set page size to match thermal paper roll width (3 1/8 inches)
    page_width = 3.125 * inch
    page_height = 11 * inch  # Arbitrary length, can be adjusted as needed
    c = canvas.Canvas(pdf_path, pagesize=(page_width, page_height))
    
    # Smaller font size
    c.setFont("Helvetica", 10)  # Adjusted font size to be smaller
    
    # Header
    c.drawCentredString(page_width / 2.0, page_height - 50, "Grocery Store Name")
    c.drawCentredString(page_width / 2.0, page_height - 70, "123 Main Street")
    c.drawCentredString(page_width / 2.0, page_height - 90, "City, State ZIP")
    c.drawCentredString(page_width / 2.0, page_height - 110, "Phone: (123) 456-7890")
    
    # Order ID
    c.drawCentredString(page_width / 2.0, page_height - 150, f"Order ID: {order_id}")
    
    # Items Header
    c.drawString(10, page_height - 200, "Item Name")
    c.drawString(100, page_height - 200, "Price")
    c.drawString(150, page_height - 200, "Qty")
    c.drawString(180, page_height - 200, "Total")
    
    # Parse items
    items_list = eval(items)  # Convert string back to list of dictionaries
    y = page_height - 220
    for item in items_list:
        item_name = item['name']
        item_price = f"${item['price']:.2f}"
        item_quantity = item['quantity']
        item_total = f"${item['price'] * item['quantity']:.2f}"
        c.drawString(10, y, item_name)
        c.drawString(100, y, item_price)
        c.drawString(150, y, str(item_quantity))
        c.drawString(180, y, item_total)
        y -= 20
    
    
    c.drawString(10, y - 40, f"Total: ${total:.2f}")
    
    
    c.drawCentredString(page_width / 2.0, y - 80, "Thank you for your purchase!")
    
    c.save()
    
    return pdf_path

def print_receipt_with_cut(receipt_path):
    printer_name = 'Star TSP143LAN Cutter'  # Updated printer name/different from the one on the device itself

    try:
        with open(receipt_path, 'r') as f:
            text_data = f.read()

        # Add extra line feeds to ensure the receipt is fully out
        text_data += "\n" * 10  # Add 10 extra line feeds

        # ESC/POS commands
        esc = b'\x1b'
        gs = b'\x1d'
        initialize_printer = esc + b'@'
        set_font_size = gs + b'!' + b'\x01' 
        align_center = esc + b'a' + b'\x01'  
        align_left = esc + b'a' + b'\x00'    

        hPrinter = win32print.OpenPrinter(printer_name)
        try:
            
            hJob = win32print.StartDocPrinter(hPrinter, 1, ("Receipt", None, "RAW"))
            try:
                
                win32print.StartPagePrinter(hPrinter)
                win32print.WritePrinter(hPrinter, initialize_printer)
                win32print.WritePrinter(hPrinter, set_font_size)
                
                # Split the text data into lines and center each line
                lines = text_data.split('\n')
                receipt_width = 32  
                for line in lines:
                    
                    padding = (receipt_width - len(line)) // 2
                    centered_line = ' ' * padding + line
                    win32print.WritePrinter(hPrinter, centered_line.encode('utf-8') + b'\n')
                
                
                cut_command = b'\x1d\x56\x00'
                win32print.WritePrinter(hPrinter, cut_command)
                
                win32print.EndPagePrinter(hPrinter)
            finally:
                win32print.EndDocPrinter(hJob)
        finally:
            win32print.ClosePrinter(hPrinter)
        
        logging.info(f"Receipt {receipt_path} sent to printer {printer_name}")
    except Exception as e:
        logging.error(f"Failed to print receipt: {e}")

if __name__ == '__main__':
    app.run(debug=True)