from flask import Flask
from flask_cors import CORS
import logging
from auth import token_required
from routes import register_routes
from db import init_db

init_db()

app = Flask(__name__)
SECRET_KEY = 'your_secret_key'
CORS(app, supports_credentials=True)  # Enable CORS with credentials support

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# Register routes
register_routes(app)

if __name__ == '__main__':
    app.run(debug=True)