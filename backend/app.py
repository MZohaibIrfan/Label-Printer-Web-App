from flask import Flask
from flask_cors import CORS
import logging
from routes import register_routes
from db import init_db, get_hk_time

init_db()

app = Flask(__name__)
SECRET_KEY = 'your_secret_key'
CORS(app, supports_credentials=True)  # Enable CORS with credentials support

# Configure logging
logging.basicConfig(level=logging.WARNING, format='%(asctime)s - %(levelname)s - %(message)s')
app.config['UPLOAD_FOLDER'] = 'images'

# Register routes
register_routes(app, SECRET_KEY)

if __name__ == '__main__':
    app.run(debug=True)