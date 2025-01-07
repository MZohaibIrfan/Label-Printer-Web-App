import sqlite3
import logging
from datetime import datetime, timezone, timedelta

def init_db():
    conn = sqlite3.connect('pos.db')
    cursor = conn.cursor()

    # Check if the items table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='items'")
    if cursor.fetchone() is None:
        cursor.execute('''
            CREATE TABLE items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                price REAL NOT NULL,
                image_url TEXT  -- Add the image_url column
            )
        ''')
        logging.info("Items table created.")

        # Insert initial data into the items table
        items = [
            ('Beef Short Ribs', 15, 'Beef Short Ribs.jpg'),
            ('Chicken Thighs', 10, 'Chicken Thighs.jpg'),
            ('Beef Brisket', 12, 'Beef Brisket.jpg'),
            ('Spicy Chicken', 11, 'Spicy Chicken.jpg'),
            ('Shrimp', 14, 'Shrimp.jpg'),
            ('Scallops', 16, 'Scallops.jpg'),
            ('Vegetable Platter', 8, 'Vegetable Platter.jpg'),
            ('Tofu', 7, 'Tofu.jpg'),
            ('Beef Tongue', 13, 'Beef Tongue.jpg'),
            ('Mushroom Platter', 9, 'Mushroom Platter.jpg'),
            ('Kimchi', 5, 'Kimchi.jpg')
        ]
        cursor.executemany('''
            INSERT INTO items (name, price, image_url) VALUES (?, ?, ?)
        ''', items)
        logging.info("Initial items inserted.")
    else:
        logging.debug("Items table already exists.")

    # Check if the orders table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='orders'")
    if cursor.fetchone() is None:
        cursor.execute('''
            CREATE TABLE orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                items TEXT NOT NULL,
                total REAL NOT NULL,
                status TEXT NOT NULL,
                table_id INTEGER,
                timestamp TEXT NOT NULL,
                served_timestamp TEXT
            )
        ''')
        logging.info("Orders table created.")
    else:
        logging.debug("Orders table already exists.")

    conn.commit()
    conn.close()

def get_hk_time():
    hk_timezone = timezone(timedelta(hours=8))
    return datetime.now(hk_timezone).strftime('%Y-%m-%d %H:%M:%S')

if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    init_db()