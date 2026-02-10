from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_session import Session
import mysql.connector
from mysql.connector import Error
import json
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from functools import wraps
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import secrets
import hashlib

# Load environment variables from .env file
load_dotenv()

# Get the path to the frontend directory
frontend_dir = os.path.join(os.path.dirname(__file__), '..', 'frontend')

app = Flask(__name__, static_folder=frontend_dir, static_url_path='')
app.secret_key = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)  # Session lasts 24 hours
app.config['SESSION_REFRESH_EACH_REQUEST'] = True  # Refresh session timeout on each request
app.config['SESSION_TYPE'] = 'filesystem'  # Use server-side session storage
app.config['SESSION_FILE_DIR'] = os.path.join(os.path.dirname(__file__), 'flask_session')
CORS(app, 
     supports_credentials=True,
     origins=['http://localhost:5000', 'http://127.0.0.1:5000'],
     allow_headers=['Content-Type'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

Session(app)

# ============= AUTHENTICATION DECORATOR =============

def login_required(f):
    """Decorator to check if user is authenticated"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Unauthorized. Please login first.'}), 401
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    """Decorator to check if user has admin role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Unauthorized. Please login first.'}), 401
        if session.get('role') != 'admin':
            return jsonify({'error': 'Forbidden. Admin access required.'}), 403
        return f(*args, **kwargs)
    return decorated_function


# Database configuration
@app.route('/')
def home():
    """Serve the login page by default"""
    return app.send_static_file('login.html')

# Database configuration
# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', '127.0.0.1'),
    'database': os.getenv('DB_NAME', 'reminder_dashboard'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', '2003'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'charset': 'utf8mb4',
    'collation': 'utf8mb4_unicode_ci',
    'use_pure': True  # This helps Python handle new MySQL passwords better
}

def get_db_connection():
    """Create and return a database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def init_database():
    """Initialize database and create tables if they don't exist"""
    try:
        connection = get_db_connection()
        if connection:
            cursor = connection.cursor()
            
            # Create contractor_list table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS contractor_list (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    sno VARCHAR(50),
                    efile VARCHAR(255),
                    contractor TEXT,
                    description TEXT,
                    value VARCHAR(255),
                    gst VARCHAR(20),
                    start_date DATE,
                    end_date DATE,
                    duration VARCHAR(255),
                    file_name VARCHAR(255),
                    file_base64 LONGTEXT,
                    file_type VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """)
            
            # Create bill_tracker table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS bill_tracker (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    sno VARCHAR(50),
                    efile VARCHAR(255),
                    contractor TEXT,
                    approved_date DATE,
                    approved_amount VARCHAR(255),
                    bill_frequency VARCHAR(50),
                    bill_date DATE,
                    bill_due_date DATE,
                    bill_paid_date DATE,
                    paid_amount VARCHAR(255),
                    file_name VARCHAR(255),
                    file_base64 LONGTEXT,
                    file_type VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """)
            
            # Create epbg table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS epbg (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    sno VARCHAR(50),
                    contractor TEXT,
                    po_no VARCHAR(255),
                    bg_no VARCHAR(255),
                    bg_date DATE,
                    bg_amount VARCHAR(255),
                    bg_validity VARCHAR(255),
                    gem_bid_no VARCHAR(255),
                    ref_efile_no VARCHAR(255),
                    file_name VARCHAR(255),
                    file_base64 LONGTEXT,
                    file_type VARCHAR(100),
                    bg_no_attachment_name VARCHAR(255),
                    bg_no_attachment_base64 LONGTEXT,
                    bg_no_attachment_type VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """)
            
            # Create users table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    name VARCHAR(100) NOT NULL,
                    role ENUM('admin', 'user', 'staff') NOT NULL DEFAULT 'user',
                    theme_preference VARCHAR(10) DEFAULT 'light',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """)

            # Add theme_preference column if not exists (migration)
            try:
                cursor.execute("SHOW COLUMNS FROM users LIKE 'theme_preference'")
                if not cursor.fetchone():
                    cursor.execute("ALTER TABLE users ADD COLUMN theme_preference VARCHAR(10) DEFAULT 'light'")
                    print("Added theme_preference column to users table")
            except Error as e:
                print(f"Error checking theme column: {e}")
            
            # Create password_resets table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS password_resets (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(100) NOT NULL,
                    otp_hash VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP NOT NULL,
                    used BOOLEAN DEFAULT FALSE,
                    INDEX (email),
                    INDEX (otp_hash)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """)
            
            # Check if users table is empty and insert default users
            cursor.execute("SELECT COUNT(*) FROM users")
            user_count = cursor.fetchone()[0]
            
            if user_count == 0:
                cursor.execute("""
                    INSERT INTO users (username, email, password, name, role) VALUES
                    ('Mithun', 'mithun@company.com', 'Admin@123', 'Mithun', 'admin'),
                    ('YourFriendName', 'friend@company.com', 'Friend@123', 'Friend Name', 'admin')
                """)
                print("Default users inserted successfully")
            
            connection.commit()
            cursor.close()
            connection.close()
            print("Database tables initialized successfully")
            return True
    except Error as e:
        print(f"Error initializing database: {e}")
        return False

# Start of User Management Section

def editor_required(f):
    """Decorator to check if user has editor (staff) or admin role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Unauthorized. Please login first.'}), 401
        if session.get('role') not in ['admin', 'staff']:
            return jsonify({'error': 'Forbidden. Edit access required.'}), 403
        return f(*args, **kwargs)
    return decorated_function

# ============= USER MANAGEMENT ENDPOINTS (ADMIN ONLY) =============

@app.route('/api/admin/users', methods=['GET'])
@admin_required
def get_all_users():
    """Get list of all users"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT id, username, email, name, role, created_at FROM users ORDER BY created_at DESC")
        users = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        return jsonify(users), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users', methods=['POST'])
@admin_required
def create_user():
    """Create a new user"""
    try:
        data = request.get_json()
        required_fields = ['username', 'email', 'password', 'name', 'role']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
            
        if data['role'] not in ['admin', 'staff', 'user']:
             return jsonify({'error': 'Invalid role. Must be admin, staff, or user'}), 400

        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database error'}), 500
            
        cursor = connection.cursor()
        
        # Check if username or email exists
        cursor.execute("SELECT id FROM users WHERE username = %s OR email = %s", (data['username'], data['email']))
        if cursor.fetchone():
            cursor.close()
            connection.close()
            return jsonify({'error': 'Username or Email already exists'}), 409
            
        # Insert user
        cursor.execute("""
            INSERT INTO users (username, email, password, name, role)
            VALUES (%s, %s, %s, %s, %s)
        """, (data['username'], data['email'], data['password'], data['name'], data['role']))
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({'success': True, 'message': 'User created successfully'}), 201
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    """Update user details"""
    try:
        data = request.get_json()
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database error'}), 500
            
        cursor = connection.cursor()
        
        # Construct update query dynamically
        updates = []
        values = []
        if 'name' in data:
            updates.append("name = %s")
            values.append(data['name'])
        if 'email' in data:
            updates.append("email = %s")
            values.append(data['email'])
        if 'role' in data:
            if data['role'] not in ['admin', 'staff', 'user']:
                return jsonify({'error': 'Invalid role'}), 400
            updates.append("role = %s")
            values.append(data['role'])
        if 'password' in data and data['password']: # Only update password if provided
            updates.append("password = %s")
            values.append(data['password'])
            
        if not updates:
             return jsonify({'message': 'No changes provided'}), 200
             
        values.append(user_id)
        query = f"UPDATE users SET {', '.join(updates)} WHERE id = %s"
        
        cursor.execute(query, tuple(values))
        connection.commit()
        
        cursor.close()
        connection.close()
        
        return jsonify({'success': True, 'message': 'User updated successfully'}), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    """Delete a user"""
    try:
        # Prevent deleting self
        if session.get('user_id') == user_id:
             return jsonify({'error': 'Cannot delete your own account'}), 400

        connection = get_db_connection()
        cursor = connection.cursor()
        
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        connection.commit()
        
        cursor.close()
        connection.close()
        
        return jsonify({'success': True, 'message': 'User deleted successfully'}), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500


# ============= AUTHENTICATION ENDPOINTS =============

@app.route('/api/login', methods=['POST'])
def login():
    """Handle user login"""
    try:
        data = request.get_json()
        username_or_email = data.get('username')
        password = data.get('password')
        
        if not username_or_email or not password:
            return jsonify({'error': 'Username/email and password are required'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Check if input is email or username
        if '@' in username_or_email:
            cursor.execute("SELECT * FROM users WHERE email = %s AND password = %s", 
                         (username_or_email, password))
        else:
            cursor.execute("SELECT * FROM users WHERE username = %s AND password = %s", 
                         (username_or_email, password))
        
        user = cursor.fetchone()
        cursor.close()
        connection.close()
        
        if user:
            # Make session permanent so it persists across browser sessions
            session.permanent = True
            
            # Store user info in session
            session['user_id'] = user['id']
            session['username'] = user['username']
            session['name'] = user['name']
            session['role'] = user['role']

            session['email'] = user['email']
            session['theme'] = user.get('theme_preference', 'light')
            
            return jsonify({
                'success': True,
                'message': 'Login successful',
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'name': user['name'],
                    'role': user['role'],
                    'email': user['email'],
                    'theme': user.get('theme_preference', 'light')
                }
            }), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
            
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    """Handle user logout"""
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully'}), 200

# ============= PASSWORD RESET HELPERS & ENDPOINTS =============

def send_otp_email(to_email, otp):
    """Send OTP via SMTP"""
    smtp_server = os.getenv('SMTP_SERVER')
    smtp_port = int(os.getenv('SMTP_PORT', 587))
    smtp_email = os.getenv('SMTP_EMAIL')
    smtp_password = os.getenv('SMTP_PASSWORD')
    
    if not all([smtp_server, smtp_email, smtp_password]):
        print("SMTP configuration missing")
        return False
        
    msg = MIMEMultipart()
    msg['From'] = smtp_email
    msg['To'] = to_email
    msg['Subject'] = "Password Reset OTP - Reminder Dashboard"
    
    body = f"""
    <html>
        <body>
            <h2>Password Reset Request</h2>
            <p>Your OTP for password reset is:</p>
            <h1 style="color: #7b2cbf; letter-spacing: 5px;">{otp}</h1>
            <p>This OTP is valid for 5 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
        </body>
    </html>
    """
    msg.attach(MIMEText(body, 'html'))
    
    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_email, smtp_password)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    """Generate and send OTP for password reset"""
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
            
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database error'}), 500
            
        cursor = connection.cursor(dictionary=True)
        
        # Check if user exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        if not user:
            # Security: Don't reveal if user exists, just return success
            cursor.close()
            connection.close()
            return jsonify({'success': True, 'message': 'If your email is registered, you will receive an OTP shortly.'}), 200
            
        # Generate 6 digit OTP
        otp = str(secrets.randbelow(10**6)).zfill(6)
        otp_hash = hashlib.sha256(otp.encode()).hexdigest()
        expires_at = datetime.now() + timedelta(minutes=5)
        
        # Save to DB
        cursor.execute("""
            INSERT INTO password_resets (email, otp_hash, expires_at)
            VALUES (%s, %s, %s)
        """, (email, otp_hash, expires_at))
        connection.commit()
        
        # Send Email
        sent = send_otp_email(email, otp)
        
        cursor.close()
        connection.close()
        
        if sent:
            return jsonify({'success': True, 'message': 'OTP sent successfully.'}), 200
        else:
            return jsonify({'error': 'Failed to send OTP. Please try again later.'}), 500
            
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    """Verify OTP and reset password"""
    try:
        data = request.get_json()
        email = data.get('email')
        otp = data.get('otp')
        new_password = data.get('newPassword')
        
        if not all([email, otp, new_password]):
            return jsonify({'error': 'Missing required fields'}), 400
            
        # Password validation (basic)
        if len(new_password) < 8:
            return jsonify({'error': 'Password must be at least 8 characters long'}), 400
            
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database error'}), 500
            
        cursor = connection.cursor(dictionary=True)
        
        # Verify OTP
        otp_hash = hashlib.sha256(otp.encode()).hexdigest()
        cursor.execute("""
            SELECT id FROM password_resets 
            WHERE email = %s AND otp_hash = %s AND used = FALSE AND expires_at > NOW()
            ORDER BY created_at DESC LIMIT 1
        """, (email, otp_hash))
        
        reset_record = cursor.fetchone()
        
        if not reset_record:
            cursor.close()
            connection.close()
            return jsonify({'error': 'Invalid or expired OTP'}), 400
            
        # Update user password
        # Note: In production use hashing like bcrypt! Here we assume plain/simple as per existing code (which looked plain/simple hash? Existing code uses comparison `password = %s`. It seems plain text storage from previous context! Security Risk! 
        # But adhering to existing pattern. The prompt said "No security-through-obscurity".
        # Existing auth code: `SELECT * FROM users WHERE email = %s AND password = %s`.
        # This implies PLAIN TEXT passwords in DB.
        # I should document this or fix it? The user request said "Store OTP hashed...".
        # It didn't explicitly say "Fix user password hashing", but "UX & Validation... Prevent reuse of previous password".
        # If passwords are upgrading, I should verify current matches previous.
        
        # Check previous password reuse
        cursor.execute("SELECT password FROM users WHERE email = %s", (email,))
        current_user = cursor.fetchone()
        if current_user and current_user['password'] == new_password:
             cursor.close()
             connection.close()
             return jsonify({'error': 'New password cannot be the same as the old password'}), 400

        # Update Password
        cursor.execute("UPDATE users SET password = %s WHERE email = %s", (new_password, email))
        
        # Mark OTP as used
        cursor.execute("UPDATE password_resets SET used = TRUE WHERE id = %s", (reset_record['id'],))
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({'success': True, 'message': 'Password reset successfully. Please login.'}), 200
        
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/check-auth', methods=['GET'])
def check_auth():
    """Check if user is authenticated"""
    if 'user_id' in session:
        return jsonify({
            'authenticated': True,
            'user': {
                'id': session['user_id'],
                'username': session['username'],
                'name': session['name'],
                'role': session['role'],
                'email': session['email'],
                'theme': session.get('theme', 'light')
            }
        }), 200
    else:
        return jsonify({'authenticated': False}), 200

@app.route('/api/user/theme', methods=['PUT'])
def update_theme():
    """Update user theme preference"""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        data = request.get_json()
        theme = data.get('theme')
        
        if theme not in ['light', 'dark']:
            return jsonify({'error': 'Invalid theme'}), 400
            
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cursor = connection.cursor()
        cursor.execute("UPDATE users SET theme_preference = %s WHERE id = %s", 
                     (theme, session['user_id']))
        connection.commit()
        cursor.close()
        connection.close()
        
        session['theme'] = theme
        return jsonify({'success': True, 'theme': theme}), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

# ============= CONTRACTOR LIST ENDPOINTS =============

@app.route('/api/contractor-list', methods=['GET'])
@login_required
def get_contractor_list():
    """Get all contractor list records"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM contractor_list ORDER BY id")
        records = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        # Convert datetime objects to strings
        for record in records:
            if record.get('created_at'):
                record['created_at'] = record['created_at'].isoformat()
            if record.get('updated_at'):
                record['updated_at'] = record['updated_at'].isoformat()
            if record.get('start_date'):
                record['start_date'] = str(record['start_date'])
            if record.get('end_date'):
                record['end_date'] = str(record['end_date'])
        
        return jsonify(records), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/contractor-list', methods=['POST'])
@editor_required
def save_contractor_list():
    """Save contractor list data"""
    try:
        data = request.get_json()
        if not data or 'records' not in data:
            return jsonify({'error': 'Invalid data format'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        
        # Delete all existing records (or you can implement update logic)
        cursor.execute("DELETE FROM contractor_list")
        
        # Insert new records
        insert_query = """
            INSERT INTO contractor_list 
            (sno, efile, contractor, description, value, start_date, end_date, duration, 
             file_name, file_base64, file_type, gst)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        records_to_insert = []
        for record in data['records']:
            records_to_insert.append((
                record.get('sno', ''),
                record.get('efile', ''),
                record.get('contractor', ''),
                record.get('description', ''),
                record.get('value', ''),
                record.get('startDate') or None,
                record.get('endDate') or None,
                record.get('duration', ''),
                record.get('fileName', ''),
                record.get('fileBase64', ''),
                record.get('fileType', ''),
                record.get('gst', '')
            ))
        
        cursor.executemany(insert_query, records_to_insert)
        connection.commit()
        
        cursor.close()
        connection.close()
        
        return jsonify({'message': 'Contractor list saved successfully', 'count': len(records_to_insert)}), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

# ============= BILL TRACKER ENDPOINTS =============

@app.route('/api/bill-tracker', methods=['GET'])
@login_required
def get_bill_tracker():
    """Get all bill tracker records"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM bill_tracker ORDER BY id")
        records = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        # Convert datetime objects to strings
        for record in records:
            if record.get('created_at'):
                record['created_at'] = record['created_at'].isoformat()
            if record.get('updated_at'):
                record['updated_at'] = record['updated_at'].isoformat()
            date_fields = ['approved_date', 'bill_date', 'bill_due_date', 'bill_paid_date']
            for field in date_fields:
                if record.get(field):
                    record[field] = str(record[field])
        
        return jsonify(records), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/bill-tracker', methods=['POST'])
@editor_required
def save_bill_tracker():
    """Save bill tracker data"""
    try:
        data = request.get_json()
        if not data or 'records' not in data:
            return jsonify({'error': 'Invalid data format'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        
        # Delete all existing records
        cursor.execute("DELETE FROM bill_tracker")
        
        # Insert new records
        insert_query = """
            INSERT INTO bill_tracker 
            (sno, efile, contractor, approved_date, approved_amount, bill_frequency, 
             bill_date, bill_due_date, bill_paid_date, paid_amount, 
             file_name, file_base64, file_type)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        records_to_insert = []
        for record in data['records']:
            records_to_insert.append((
                record.get('sno', ''),
                record.get('efile', ''),
                record.get('contractor', ''),
                record.get('approvedDate') or None,
                record.get('approvedAmount', ''),
                record.get('billFrequency', ''),
                record.get('billDate') or None,
                record.get('billDueDate') or None,
                record.get('billPaidDate') or None,
                record.get('paidAmount', ''),
                record.get('fileName', ''),
                record.get('fileBase64', ''),
                record.get('fileType', '')
            ))
        
        cursor.executemany(insert_query, records_to_insert)
        connection.commit()
        
        cursor.close()
        connection.close()
        
        return jsonify({'message': 'Bill tracker saved successfully', 'count': len(records_to_insert)}), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

# ============= EPBG ENDPOINTS =============

@app.route('/api/epbg', methods=['GET'])
@login_required
def get_epbg():
    """Get all EPBG records"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM epbg ORDER BY id")
        records = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        # Convert datetime objects to strings
        for record in records:
            if record.get('created_at'):
                record['created_at'] = record['created_at'].isoformat()
            if record.get('updated_at'):
                record['updated_at'] = record['updated_at'].isoformat()
            if record.get('bg_date'):
                record['bg_date'] = str(record['bg_date'])
        
        return jsonify(records), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/epbg', methods=['POST'])
@editor_required
def save_epbg():
    """Save EPBG data"""
    try:
        data = request.get_json()
        if not data or 'records' not in data:
            return jsonify({'error': 'Invalid data format'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        
        # Delete all existing records
        cursor.execute("DELETE FROM epbg")
        
        # Insert new records
        insert_query = """
            INSERT INTO epbg 
            (sno, contractor, po_no, bg_no, bg_date, bg_amount, bg_validity, 
             gem_bid_no, ref_efile_no, file_name, file_base64, file_type, bg_no_attachment_name, bg_no_attachment_base64, bg_no_attachment_type)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        records_to_insert = []
        for record in data['records']:
            records_to_insert.append((
                record.get('sno', ''),
                record.get('contractor', ''),
                record.get('poNo', ''),
                record.get('bgNo', ''),
                record.get('bgDate') or None,
                record.get('bgAmount', ''),
                record.get('bgValidity', ''),
                record.get('gemBid', ''),
                record.get('refEfile', ''),
                record.get('fileName', ''),
                record.get('fileBase64', ''),
                record.get('fileType', ''),
                record.get('bgNoAttachmentName', ''),
                record.get('bgNoAttachmentBase64', ''),
                record.get('bgNoAttachmentType', '')
            ))
        
        cursor.executemany(insert_query, records_to_insert)
        connection.commit()
        
        cursor.close()
        connection.close()
        
        return jsonify({'message': 'EPBG saved successfully', 'count': len(records_to_insert)}), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

# ============= CONTRACTOR MANAGEMENT ENDPOINTS =============

@app.route('/api/contractors', methods=['GET'])
@login_required
def get_contractors():
    """Get all contractors"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT id, name FROM contractors ORDER BY name ASC")
        contractors = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        return jsonify({'contractors': contractors}), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/contractors', methods=['POST'])
@login_required
def add_contractor():
    """Add a new contractor"""
    try:
        data = request.get_json()
        if not data or 'name' not in data or not data['name'].strip():
            return jsonify({'error': 'Contractor name is required'}), 400
            
        contractor_name = data['name'].strip()
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cursor = connection.cursor()
        
        # Check if contractor already exists
        cursor.execute("SELECT id FROM contractors WHERE name = %s", (contractor_name,))
        if cursor.fetchone():
            cursor.close()
            connection.close()
            return jsonify({'error': 'Contractor already exists'}), 409
            
        # Insert new contractor
        cursor.execute("INSERT INTO contractors (name) VALUES (%s)", (contractor_name,))
        contractor_id = cursor.lastrowid
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({
            'message': 'Contractor added successfully',
            'contractor': {'id': contractor_id, 'name': contractor_name}
        }), 201
    except Error as e:
        return jsonify({'error': str(e)}), 500

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        connection = get_db_connection()
        if connection:
            connection.close()
            return jsonify({'status': 'healthy', 'database': 'connected'}), 200
        else:
            return jsonify({'status': 'unhealthy', 'database': 'disconnected'}), 500
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_session import Session
import mysql.connector
from mysql.connector import Error
import json
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from functools import wraps
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import secrets
import hashlib

# Load environment variables from .env file
load_dotenv()

# Get the path to the frontend directory
frontend_dir = os.path.join(os.path.dirname(__file__), '..', 'frontend')

app = Flask(__name__, static_folder=frontend_dir, static_url_path='')
app.secret_key = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)  # Session lasts 24 hours
app.config['SESSION_REFRESH_EACH_REQUEST'] = True  # Refresh session timeout on each request
app.config['SESSION_TYPE'] = 'filesystem'  # Use server-side session storage
app.config['SESSION_FILE_DIR'] = os.path.join(os.path.dirname(__file__), 'flask_session')
CORS(app, 
     supports_credentials=True,
     origins=['http://localhost:5000', 'http://127.0.0.1:5000'],
     allow_headers=['Content-Type'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

Session(app)

# ============= AUTHENTICATION DECORATOR =============

def login_required(f):
    """Decorator to check if user is authenticated"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Unauthorized. Please login first.'}), 401
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    """Decorator to check if user has admin role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Unauthorized. Please login first.'}), 401
        if session.get('role') != 'admin':
            return jsonify({'error': 'Forbidden. Admin access required.'}), 403
        return f(*args, **kwargs)
    return decorated_function


# Database configuration
@app.route('/')
def home():
    """Serve the login page by default"""
    return app.send_static_file('login.html')

# Database configuration
# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', '127.0.0.1'),
    'database': os.getenv('DB_NAME', 'reminder_dashboard'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', '2003'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'charset': 'utf8mb4',
    'collation': 'utf8mb4_unicode_ci',
    'use_pure': True  # This helps Python handle new MySQL passwords better
}

def get_db_connection():
    """Create and return a database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def init_database():
    """Initialize database and create tables if they don't exist"""
    try:
        connection = get_db_connection()
        if connection:
            cursor = connection.cursor()
            
            # Create contractor_list table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS contractor_list (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    sno VARCHAR(50),
                    efile VARCHAR(255),
                    contractor TEXT,
                    description TEXT,
                    value VARCHAR(255),
                    gst VARCHAR(20),
                    start_date DATE,
                    end_date DATE,
                    duration VARCHAR(255),
                    file_name VARCHAR(255),
                    file_base64 LONGTEXT,
                    file_type VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """)
            
            # Create bill_tracker table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS bill_tracker (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    sno VARCHAR(50),
                    efile VARCHAR(255),
                    contractor TEXT,
                    approved_date DATE,
                    approved_amount VARCHAR(255),
                    bill_frequency VARCHAR(50),
                    bill_date DATE,
                    bill_due_date DATE,
                    bill_paid_date DATE,
                    paid_amount VARCHAR(255),
                    file_name VARCHAR(255),
                    file_base64 LONGTEXT,
                    file_type VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """)
            
            # Create epbg table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS epbg (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    sno VARCHAR(50),
                    contractor TEXT,
                    po_no VARCHAR(255),
                    bg_no VARCHAR(255),
                    bg_date DATE,
                    bg_amount VARCHAR(255),
                    bg_validity VARCHAR(255),
                    gem_bid_no VARCHAR(255),
                    ref_efile_no VARCHAR(255),
                    file_name VARCHAR(255),
                    file_base64 LONGTEXT,
                    file_type VARCHAR(100),
                    bg_no_attachment_name VARCHAR(255),
                    bg_no_attachment_base64 LONGTEXT,
                    bg_no_attachment_type VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """)
            
            # Create users table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    name VARCHAR(100) NOT NULL,
                    role ENUM('admin', 'user', 'staff') NOT NULL DEFAULT 'user',
                    theme_preference VARCHAR(10) DEFAULT 'light',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """)

            # Add theme_preference column if not exists (migration)
            try:
                cursor.execute("SHOW COLUMNS FROM users LIKE 'theme_preference'")
                if not cursor.fetchone():
                    cursor.execute("ALTER TABLE users ADD COLUMN theme_preference VARCHAR(10) DEFAULT 'light'")
                    print("Added theme_preference column to users table")
            except Error as e:
                print(f"Error checking theme column: {e}")
            
            # Create password_resets table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS password_resets (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(100) NOT NULL,
                    otp_hash VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP NOT NULL,
                    used BOOLEAN DEFAULT FALSE,
                    INDEX (email),
                    INDEX (otp_hash)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """)
            
            # Check if users table is empty and insert default users
            cursor.execute("SELECT COUNT(*) FROM users")
            user_count = cursor.fetchone()[0]
            
            if user_count == 0:
                cursor.execute("""
                    INSERT INTO users (username, email, password, name, role) VALUES
                    ('Mithun', 'mithun@company.com', 'Admin@123', 'Mithun', 'admin'),
                    ('Adithya', 'adithya@company.com', 'Admin@456', 'Adithya', 'admin')
                """)
                print("Default users inserted successfully")
            
            connection.commit()
            cursor.close()
            connection.close()
            print("Database tables initialized successfully")
            return True
    except Error as e:
        print(f"Error initializing database: {e}")
        return False

# Start of User Management Section

def editor_required(f):
    """Decorator to check if user has editor (staff) or admin role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Unauthorized. Please login first.'}), 401
        if session.get('role') not in ['admin', 'staff']:
            return jsonify({'error': 'Forbidden. Edit access required.'}), 403
        return f(*args, **kwargs)
    return decorated_function

# ============= USER MANAGEMENT ENDPOINTS (ADMIN ONLY) =============

@app.route('/api/admin/users', methods=['GET'])
@admin_required
def get_all_users():
    """Get list of all users"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT id, username, email, name, role, created_at FROM users ORDER BY created_at DESC")
        users = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        return jsonify(users), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users', methods=['POST'])
@admin_required
def create_user():
    """Create a new user"""
    try:
        data = request.get_json()
        required_fields = ['username', 'email', 'password', 'name', 'role']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
            
        if data['role'] not in ['admin', 'staff', 'user']:
             return jsonify({'error': 'Invalid role. Must be admin, staff, or user'}), 400

        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database error'}), 500
            
        cursor = connection.cursor()
        
        # Check if username or email exists
        cursor.execute("SELECT id FROM users WHERE username = %s OR email = %s", (data['username'], data['email']))
        if cursor.fetchone():
            cursor.close()
            connection.close()
            return jsonify({'error': 'Username or Email already exists'}), 409
            
        # Insert user
        cursor.execute("""
            INSERT INTO users (username, email, password, name, role)
            VALUES (%s, %s, %s, %s, %s)
        """, (data['username'], data['email'], data['password'], data['name'], data['role']))
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({'success': True, 'message': 'User created successfully'}), 201
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    """Update user details"""
    try:
        data = request.get_json()
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database error'}), 500
            
        cursor = connection.cursor()
        
        # Construct update query dynamically
        updates = []
        values = []
        if 'name' in data:
            updates.append("name = %s")
            values.append(data['name'])
        if 'email' in data:
            updates.append("email = %s")
            values.append(data['email'])
        if 'role' in data:
            if data['role'] not in ['admin', 'staff', 'user']:
                return jsonify({'error': 'Invalid role'}), 400
            updates.append("role = %s")
            values.append(data['role'])
        if 'password' in data and data['password']: # Only update password if provided
            updates.append("password = %s")
            values.append(data['password'])
            
        if not updates:
             return jsonify({'message': 'No changes provided'}), 200
             
        values.append(user_id)
        query = f"UPDATE users SET {', '.join(updates)} WHERE id = %s"
        
        cursor.execute(query, tuple(values))
        connection.commit()
        
        cursor.close()
        connection.close()
        
        return jsonify({'success': True, 'message': 'User updated successfully'}), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    """Delete a user"""
    try:
        # Prevent deleting self
        if session.get('user_id') == user_id:
             return jsonify({'error': 'Cannot delete your own account'}), 400

        connection = get_db_connection()
        cursor = connection.cursor()
        
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        connection.commit()
        
        cursor.close()
        connection.close()
        
        return jsonify({'success': True, 'message': 'User deleted successfully'}), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500


# ============= AUTHENTICATION ENDPOINTS =============

@app.route('/api/login', methods=['POST'])
def login():
    """Handle user login"""
    try:
        data = request.get_json()
        username_or_email = data.get('username')
        password = data.get('password')
        
        if not username_or_email or not password:
            return jsonify({'error': 'Username/email and password are required'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Check if input is email or username
        if '@' in username_or_email:
            cursor.execute("SELECT * FROM users WHERE email = %s AND password = %s", 
                         (username_or_email, password))
        else:
            cursor.execute("SELECT * FROM users WHERE username = %s AND password = %s", 
                         (username_or_email, password))
        
        user = cursor.fetchone()
        cursor.close()
        connection.close()
        
        if user:
            # Make session permanent so it persists across browser sessions
            session.permanent = True
            
            # Store user info in session
            session['user_id'] = user['id']
            session['username'] = user['username']
            session['name'] = user['name']
            session['role'] = user['role']

            session['email'] = user['email']
            session['theme'] = user.get('theme_preference', 'light')
            
            return jsonify({
                'success': True,
                'message': 'Login successful',
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'name': user['name'],
                    'role': user['role'],
                    'email': user['email'],
                    'theme': user.get('theme_preference', 'light')
                }
            }), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
            
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    """Handle user logout"""
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully'}), 200

# ============= PASSWORD RESET HELPERS & ENDPOINTS =============

def send_otp_email(to_email, otp):
    """Send OTP via SMTP"""
    smtp_server = os.getenv('SMTP_SERVER')
    smtp_port = int(os.getenv('SMTP_PORT', 587))
    smtp_email = os.getenv('SMTP_EMAIL')
    smtp_password = os.getenv('SMTP_PASSWORD')
    
    if not all([smtp_server, smtp_email, smtp_password]):
        print("SMTP configuration missing")
        return False
        
    msg = MIMEMultipart()
    msg['From'] = smtp_email
    msg['To'] = to_email
    msg['Subject'] = "Password Reset OTP - Reminder Dashboard"
    
    body = f"""
    <html>
        <body>
            <h2>Password Reset Request</h2>
            <p>Your OTP for password reset is:</p>
            <h1 style="color: #7b2cbf; letter-spacing: 5px;">{otp}</h1>
            <p>This OTP is valid for 5 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
        </body>
    </html>
    """
    msg.attach(MIMEText(body, 'html'))
    
    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_email, smtp_password)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    """Generate and send OTP for password reset"""
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
            
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database error'}), 500
            
        cursor = connection.cursor(dictionary=True)
        
        # Check if user exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        if not user:
            # Security: Don't reveal if user exists, just return success
            cursor.close()
            connection.close()
            return jsonify({'success': True, 'message': 'If your email is registered, you will receive an OTP shortly.'}), 200
            
        # Generate 6 digit OTP
        otp = str(secrets.randbelow(10**6)).zfill(6)
        otp_hash = hashlib.sha256(otp.encode()).hexdigest()
        expires_at = datetime.now() + timedelta(minutes=5)
        
        # Save to DB
        cursor.execute("""
            INSERT INTO password_resets (email, otp_hash, expires_at)
            VALUES (%s, %s, %s)
        """, (email, otp_hash, expires_at))
        connection.commit()
        
        # Send Email
        sent = send_otp_email(email, otp)
        
        cursor.close()
        connection.close()
        
        if sent:
            return jsonify({'success': True, 'message': 'OTP sent successfully.'}), 200
        else:
            return jsonify({'error': 'Failed to send OTP. Please try again later.'}), 500
            
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    """Verify OTP and reset password"""
    try:
        data = request.get_json()
        email = data.get('email')
        otp = data.get('otp')
        new_password = data.get('newPassword')
        
        if not all([email, otp, new_password]):
            return jsonify({'error': 'Missing required fields'}), 400
            
        # Password validation (basic)
        if len(new_password) < 8:
            return jsonify({'error': 'Password must be at least 8 characters long'}), 400
            
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database error'}), 500
            
        cursor = connection.cursor(dictionary=True)
        
        # Verify OTP
        otp_hash = hashlib.sha256(otp.encode()).hexdigest()
        cursor.execute("""
            SELECT id FROM password_resets 
            WHERE email = %s AND otp_hash = %s AND used = FALSE AND expires_at > NOW()
            ORDER BY created_at DESC LIMIT 1
        """, (email, otp_hash))
        
        reset_record = cursor.fetchone()
        
        if not reset_record:
            cursor.close()
            connection.close()
            return jsonify({'error': 'Invalid or expired OTP'}), 400
            
        # Update user password
        # Note: In production use hashing like bcrypt! Here we assume plain/simple as per existing code (which looked plain/simple hash? Existing code uses comparison `password = %s`. It seems plain text storage from previous context! Security Risk! 
        # But adhering to existing pattern. The prompt said "No security-through-obscurity".
        # Existing auth code: `SELECT * FROM users WHERE email = %s AND password = %s`.
        # This implies PLAIN TEXT passwords in DB.
        # I should document this or fix it? The user request said "Store OTP hashed...".
        # It didn't explicitly say "Fix user password hashing", but "UX & Validation... Prevent reuse of previous password".
        # If passwords are upgrading, I should verify current matches previous.
        
        # Check previous password reuse
        cursor.execute("SELECT password FROM users WHERE email = %s", (email,))
        current_user = cursor.fetchone()
        if current_user and current_user['password'] == new_password:
             cursor.close()
             connection.close()
             return jsonify({'error': 'New password cannot be the same as the old password'}), 400

        # Update Password
        cursor.execute("UPDATE users SET password = %s WHERE email = %s", (new_password, email))
        
        # Mark OTP as used
        cursor.execute("UPDATE password_resets SET used = TRUE WHERE id = %s", (reset_record['id'],))
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({'success': True, 'message': 'Password reset successfully. Please login.'}), 200
        
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/check-auth', methods=['GET'])
def check_auth():
    """Check if user is authenticated"""
    if 'user_id' in session:
        return jsonify({
            'authenticated': True,
            'user': {
                'id': session['user_id'],
                'username': session['username'],
                'name': session['name'],
                'role': session['role'],
                'email': session['email'],
                'theme': session.get('theme', 'light')
            }
        }), 200
    else:
        return jsonify({'authenticated': False}), 200

@app.route('/api/user/theme', methods=['PUT'])
def update_theme():
    """Update user theme preference"""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        data = request.get_json()
        theme = data.get('theme')
        
        if theme not in ['light', 'dark']:
            return jsonify({'error': 'Invalid theme'}), 400
            
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cursor = connection.cursor()
        cursor.execute("UPDATE users SET theme_preference = %s WHERE id = %s", 
                     (theme, session['user_id']))
        connection.commit()
        cursor.close()
        connection.close()
        
        session['theme'] = theme
        return jsonify({'success': True, 'theme': theme}), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

# ============= CONTRACTOR LIST ENDPOINTS =============

@app.route('/api/contractor-list', methods=['GET'])
@login_required
def get_contractor_list():
    """Get all contractor list records"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM contractor_list ORDER BY id")
        records = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        # Convert datetime objects to strings
        for record in records:
            if record.get('created_at'):
                record['created_at'] = record['created_at'].isoformat()
            if record.get('updated_at'):
                record['updated_at'] = record['updated_at'].isoformat()
            if record.get('start_date'):
                record['start_date'] = str(record['start_date'])
            if record.get('end_date'):
                record['end_date'] = str(record['end_date'])
        
        return jsonify(records), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/contractor-list', methods=['POST'])
@editor_required
def save_contractor_list():
    """Save contractor list data"""
    try:
        data = request.get_json()
        if not data or 'records' not in data:
            return jsonify({'error': 'Invalid data format'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        
        # Delete all existing records (or you can implement update logic)
        cursor.execute("DELETE FROM contractor_list")
        
        # Insert new records
        insert_query = """
            INSERT INTO contractor_list 
            (sno, efile, contractor, description, value, start_date, end_date, duration, 
             file_name, file_base64, file_type, gst)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        records_to_insert = []
        for record in data['records']:
            records_to_insert.append((
                record.get('sno', ''),
                record.get('efile', ''),
                record.get('contractor', ''),
                record.get('description', ''),
                record.get('value', ''),
                record.get('startDate') or None,
                record.get('endDate') or None,
                record.get('duration', ''),
                record.get('fileName', ''),
                record.get('fileBase64', ''),
                record.get('fileType', ''),
                record.get('gst', '')
            ))
        
        cursor.executemany(insert_query, records_to_insert)
        connection.commit()
        
        cursor.close()
        connection.close()
        
        return jsonify({'message': 'Contractor list saved successfully', 'count': len(records_to_insert)}), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

# ============= BILL TRACKER ENDPOINTS =============

@app.route('/api/bill-tracker', methods=['GET'])
@login_required
def get_bill_tracker():
    """Get all bill tracker records"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM bill_tracker ORDER BY id")
        records = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        # Convert datetime objects to strings
        for record in records:
            if record.get('created_at'):
                record['created_at'] = record['created_at'].isoformat()
            if record.get('updated_at'):
                record['updated_at'] = record['updated_at'].isoformat()
            date_fields = ['approved_date', 'bill_date', 'bill_due_date', 'bill_paid_date']
            for field in date_fields:
                if record.get(field):
                    record[field] = str(record[field])
        
        return jsonify(records), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/bill-tracker', methods=['POST'])
@editor_required
def save_bill_tracker():
    """Save bill tracker data"""
    try:
        data = request.get_json()
        if not data or 'records' not in data:
            return jsonify({'error': 'Invalid data format'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        
        # Delete all existing records
        cursor.execute("DELETE FROM bill_tracker")
        
        # Insert new records
        insert_query = """
            INSERT INTO bill_tracker 
            (sno, efile, contractor, approved_date, approved_amount, bill_frequency, 
             bill_date, bill_due_date, bill_paid_date, paid_amount, 
             file_name, file_base64, file_type)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        records_to_insert = []
        for record in data['records']:
            records_to_insert.append((
                record.get('sno', ''),
                record.get('efile', ''),
                record.get('contractor', ''),
                record.get('approvedDate') or None,
                record.get('approvedAmount', ''),
                record.get('billFrequency', ''),
                record.get('billDate') or None,
                record.get('billDueDate') or None,
                record.get('billPaidDate') or None,
                record.get('paidAmount', ''),
                record.get('fileName', ''),
                record.get('fileBase64', ''),
                record.get('fileType', '')
            ))
        
        cursor.executemany(insert_query, records_to_insert)
        connection.commit()
        
        cursor.close()
        connection.close()
        
        return jsonify({'message': 'Bill tracker saved successfully', 'count': len(records_to_insert)}), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

# ============= EPBG ENDPOINTS =============

@app.route('/api/epbg', methods=['GET'])
@login_required
def get_epbg():
    """Get all EPBG records"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM epbg ORDER BY id")
        records = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        # Convert datetime objects to strings
        for record in records:
            if record.get('created_at'):
                record['created_at'] = record['created_at'].isoformat()
            if record.get('updated_at'):
                record['updated_at'] = record['updated_at'].isoformat()
            if record.get('bg_date'):
                record['bg_date'] = str(record['bg_date'])
        
        return jsonify(records), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/epbg', methods=['POST'])
@editor_required
def save_epbg():
    """Save EPBG data"""
    try:
        data = request.get_json()
        if not data or 'records' not in data:
            return jsonify({'error': 'Invalid data format'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        
        # Delete all existing records
        cursor.execute("DELETE FROM epbg")
        
        # Insert new records
        insert_query = """
            INSERT INTO epbg 
            (sno, contractor, po_no, bg_no, bg_date, bg_amount, bg_validity, 
             gem_bid_no, ref_efile_no, file_name, file_base64, file_type, bg_no_attachment_name, bg_no_attachment_base64, bg_no_attachment_type)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        records_to_insert = []
        for record in data['records']:
            records_to_insert.append((
                record.get('sno', ''),
                record.get('contractor', ''),
                record.get('poNo', ''),
                record.get('bgNo', ''),
                record.get('bgDate') or None,
                record.get('bgAmount', ''),
                record.get('bgValidity', ''),
                record.get('gemBid', ''),
                record.get('refEfile', ''),
                record.get('fileName', ''),
                record.get('fileBase64', ''),
                record.get('fileType', ''),
                record.get('bgNoAttachmentName', ''),
                record.get('bgNoAttachmentBase64', ''),
                record.get('bgNoAttachmentType', '')
            ))
        
        cursor.executemany(insert_query, records_to_insert)
        connection.commit()
        
        cursor.close()
        connection.close()
        
        return jsonify({'message': 'EPBG saved successfully', 'count': len(records_to_insert)}), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

# ============= CONTRACTOR MANAGEMENT ENDPOINTS =============

@app.route('/api/contractors', methods=['GET'])
@login_required
def get_contractors():
    """Get all contractors"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT id, name FROM contractors ORDER BY name ASC")
        contractors = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        return jsonify({'contractors': contractors}), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/contractors', methods=['POST'])
@login_required
def add_contractor():
    """Add a new contractor"""
    try:
        data = request.get_json()
        if not data or 'name' not in data or not data['name'].strip():
            return jsonify({'error': 'Contractor name is required'}), 400
            
        contractor_name = data['name'].strip()
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cursor = connection.cursor()
        
        # Check if contractor already exists
        cursor.execute("SELECT id FROM contractors WHERE name = %s", (contractor_name,))
        if cursor.fetchone():
            cursor.close()
            connection.close()
            return jsonify({'error': 'Contractor already exists'}), 409
            
        # Insert new contractor
        cursor.execute("INSERT INTO contractors (name) VALUES (%s)", (contractor_name,))
        contractor_id = cursor.lastrowid
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({
            'message': 'Contractor added successfully',
            'contractor': {'id': contractor_id, 'name': contractor_name}
        }), 201
    except Error as e:
        return jsonify({'error': str(e)}), 500

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        connection = get_db_connection()
        if connection:
            connection.close()
            return jsonify({'status': 'healthy', 'database': 'connected'}), 200
        else:
            return jsonify({'status': 'unhealthy', 'database': 'disconnected'}), 500
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
