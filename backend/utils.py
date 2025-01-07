import os
import logging
import win32print
import json
from reportlab.lib.pagesizes import inch
from reportlab.pdfgen import canvas

# ESC/POS commands
ESC = '\x1b'
GS = '\x1d'
NEW_LINE = '\n'
CUT_PAPER = ESC + 'i'
OPEN_DRAWER = ESC + 'p' + '\x00' + '\x0F' + '\x96'  # Command to open the cash drawer

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
    
    try:
        with open(receipt_path, 'w', encoding='utf-8') as f:
            # Add some blank lines at the beginning
            f.write(NEW_LINE * 5)
            
            # Header
            f.write(center_text("Grocery Store Name") + NEW_LINE)
            f.write(center_text("123 Main Street") + NEW_LINE)
            f.write(center_text("City, State ZIP") + NEW_LINE)
            f.write(center_text("Phone: (123) 456-7890") + NEW_LINE + NEW_LINE)
            
            # Order ID
            f.write(center_text(f"Order ID: {order_id}") + NEW_LINE + NEW_LINE)
            
            # Items Header
            f.write(center_text("Item Name       Price  Qty  Total") + NEW_LINE)
            
            # Parse items
            items_list = json.loads(items)  # Convert string back to list of dictionaries
            for item in items_list:
                item_name = item['name']
                item_price = f"${item['price']:.2f}"
                item_quantity = item['quantity']
                item_total = f"${item['price'] * item['quantity']:.2f}"
                f.write(center_text(format_item_line(item_name, item_price, item_quantity, item_total)) + NEW_LINE)
            
            # Total
            f.write(NEW_LINE + center_text(f"Total: ${total:.2f}") + NEW_LINE + NEW_LINE)
            
            # Footer
            f.write(center_text("Thank you for your purchase!") + NEW_LINE)
            
            # Add some blank lines at the end
            f.write(NEW_LINE * 5)
            
            # Add ESC/POS commands for cutting paper and opening the cash drawer
            f.write(CUT_PAPER)
            f.write(OPEN_DRAWER)
        
        logging.info(f"Receipt saved at {receipt_path}")
    except Exception as e:
        logging.error(f"Failed to save receipt: {e}")
    
    return receipt_path

def generate_pdf_receipt(order_id, items, total):
    receipt_dir = "C:\\Users\\igears\\Task 2 Label Printer App"
    if not os.path.exists(receipt_dir):
        os.makedirs(receipt_dir)
    
    pdf_path = os.path.join(receipt_dir, f"receipt_{order_id}.pdf")
    logging.info(f"PDF path: {pdf_path}")
    
    # Set custom page size for receipt printer
    page_width = 2.165 * inch  # 55mm receipt paper width
    page_height = 11 * inch  # Arbitrary length, can be adjusted as needed
    c = canvas.Canvas(pdf_path, pagesize=(page_width, page_height))
    
    # Smaller font size
    c.setFont("Helvetica", 6)  # Adjusted font size to be smaller
    
    y = page_height - 10  # Start from the top of the page with a small margin
    
    try:
        # Header
        c.drawCentredString(page_width / 2.0, y, "Korean BBQ Restaurant")
        y -= 8
        c.drawCentredString(page_width / 2.0, y, "TST")
        y -= 8
        c.drawCentredString(page_width / 2.0, y, "Hong Kong")
        y -= 8
        c.drawCentredString(page_width / 2.0, y, "Phone:852 2323 8238")
        y -= 16
        
        # Order ID
        c.drawCentredString(page_width / 2.0, y, f"Order ID: {order_id}")
        y -= 16
        
        # Items Header
        c.drawString(5, y, "Item Name")
        c.drawString(65, y, "Price")
        c.drawString(105, y, "Qty")
        c.drawString(135, y, "Total")
        y -= 8
        
        # Parse items
        items_list = json.loads(items)  # Convert string back to list of dictionaries
        for item in items_list:
            item_name = item['name']
            item_price = f"${item['price']:.2f}"
            item_quantity = item['quantity']
            item_total = f"${item['price'] * item['quantity']:.2f}"
            c.drawString(5, y, item_name)
            c.drawString(65, y, item_price)
            c.drawString(105, y, str(item_quantity))
            c.drawString(135, y, item_total)
            y -= 8
        
        # Total
        y -= 16
        c.drawString(5, y, f"Total: ${total:.2f}")
        y -= 16
        c.drawCentredString(page_width / 2.0, y, "Thank you for your purchase!")
        
        c.save()
        logging.info(f"PDF receipt saved at {pdf_path}")
    except Exception as e:
        logging.error(f"Failed to save PDF receipt: {e}")
    
    return pdf_path

def print_receipt_star_pop10(text_path):
    printer_name = "Star POP10"  # Manually set the printer name

    try:
        logging.info(f"Attempting to open printer: {printer_name}")
        hPrinter = win32print.OpenPrinter(printer_name)
        logging.info(f"Printer handle: {hPrinter}")

        if not hPrinter:
            logging.error(f"Failed to open printer: {printer_name}")
            return

        logging.info("Starting print job")
        hJob = win32print.StartDocPrinter(hPrinter, 1, ("Text Receipt", None, "RAW"))
        logging.info(f"Print job handle: {hJob}")

        if not hJob:
            logging.error("Failed to start print job")
            return

        try:
            logging.info("Starting page")
            win32print.StartPagePrinter(hPrinter)

            logging.info(f"Reading text file: {text_path}")
            with open(text_path, 'r', encoding='utf-8') as f:
                text_data = f.read()

            logging.info("Writing to printer")
            win32print.WritePrinter(hPrinter, text_data.encode('utf-8'))

            logging.info("Ending page")
            win32print.EndPagePrinter(hPrinter)
        finally:
            logging.info("Ending document")
            if hJob:
                try:
                    win32print.EndDocPrinter(hJob)
                except Exception as e:
                    logging.error(f"Failed to end document: {e}")
            logging.info("Print job completed")
    except Exception as e:
        logging.error(f"Failed to print text receipt: {e}")
    finally:
        if hPrinter:
            try:
                win32print.ClosePrinter(hPrinter)
            except Exception as e:
                logging.error(f"Failed to close printer handle: {e}")