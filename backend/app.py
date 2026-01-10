import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, request, redirect, send_from_directory, session, jsonify
from flask_cors import CORS
from flask_mail import Mail, Message
import secrets
from mydb import create_table, add_user, check_user, get_user_by_email

# Configure Flask to serve static files from root folder
app = Flask(__name__, 
            static_folder=os.path.join(os.path.dirname(__file__), '..'),
            static_url_path='/')
app.secret_key = 'your-secret-key-here-change-in-production'  # Needed for sessions

# Enable CORS for Netlify frontend
CORS(app, supports_credentials=True)

# Configure email settings
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True') == 'True'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER', 'noreply@angani.com')
mail = Mail(app)

# Ensure the users table exists (will use DATABASE_URL via mydb)
try:
    create_table()
    print("Database ready (users table ensured).")
except Exception as e:
    # Fail fast with a clear message if DATABASE_URL is missing or DB is unreachable
    print("Database initialization error:", e)
    # In production you might choose to continue; here we raise to surface misconfig
    # raise

# Root route — serve landing page
@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")

# Handle signup form
@app.route("/signup", methods=["POST"])
def signup():
    name = request.form["name"]
    email = request.form["email"]
    password = request.form["password"]

    print("Signup attempt:", name, email)  # Debug info

    try:
        add_user(name, email, password)
        print("User added successfully.")
        session['user_id'] = name
        session['user_email'] = email
        return jsonify({"success": True, "name": name, "email": email}), 200
    except Exception as e:
        print("Signup error:", e)
        return jsonify({"success": False, "message": "Email already exists. Try signing in."}), 400

# Handle signin form
@app.route("/signin", methods=["POST"])
def signin():
    email = request.form["email"]
    password = request.form["password"]

    print("Signin attempt:", email)  # Debug info

    user = check_user(email, password)
    if user:
        print("Signin successful:", user["name"])
        session['user_id'] = user['name']
        session['user_email'] = email
        # Return success response for JavaScript handling
        return jsonify({"success": True, "name": user["name"]}), 200
    else:
        print("Signin failed.")
        return jsonify({"success": False, "message": "Invalid email or password."}), 401

# Handle forgot password request
@app.route("/forgot-password", methods=["POST"])
def forgot_password():
    email = request.form.get("email")
    
    if not email:
        return jsonify({"success": False, "message": "Email is required."}), 400
    
    try:
        user = get_user_by_email(email)
        if user:
            # Generate a temporary password (6 character alphanumeric)
            temp_password = secrets.token_hex(3)  # e.g., 'a1b2c3'
            
            # Send reset email
            try:
                msg = Message(
                    subject='Angani - Password Reset',
                    recipients=[email],
                    body=f"""Hello {user['name']},

You requested a password reset for your Angani account.

Temporary Password: {temp_password}

Please sign in with your email and this temporary password, then change it to a permanent one.

If you did not request this, please ignore this email.

Best regards,
Angani Team"""
                )
                mail.send(msg)
                print(f"Password reset email sent to: {email}")
            except Exception as mail_error:
                print(f"Failed to send reset email: {mail_error}")
                return jsonify({"success": False, "message": "Unable to send reset email. Please try again later."}), 500
        
        # For security, always return same message (don't reveal if email exists)
        return jsonify({"success": True, "message": "If an account exists, you will receive reset instructions via email."}), 200
    except Exception as e:
        print("Forgot password error:", e)
        # Still return success to not reveal if email is registered
        return jsonify({"success": True, "message": "If an account exists, you will receive reset instructions via email."}), 200

# DB health check
@app.route("/health/db")
def health_db():
    try:
        # Light check via a cheap read
        _ = get_user_by_email("non-existent@example.com")
        return jsonify({"ok": True}), 200
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

# Catch-all for HTML files and static assets
@app.route("/<path:filename>")
def serve_static(filename):
    if filename.endswith('.html'):
        return send_from_directory(app.static_folder, filename)
    return send_from_directory(app.static_folder, filename)

if __name__ == "__main__":
    app.run()
