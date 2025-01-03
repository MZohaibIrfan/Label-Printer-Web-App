import logging
import sqlite3

def init_db():
    conn = sqlite3.connect('pos.db')
    cursor = conn.cursor()
    try:
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                price REAL
            )
        ''')
        logging.info("Items table created or already exists.")
    except sqlite3.Error as e:
        logging.error(f"Error creating items table: {e}")

    try:
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                items TEXT,
                total REAL,
                status TEXT,
                table_id TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        logging.info("Orders table created or already exists.")
    except sqlite3.Error as e:
        logging.error(f"Error creating orders table: {e}")

    conn.commit()
    conn.close()

init_db()