import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, request, redirect, send_from_directory, session, jsonify
from flask_cors import CORS
from mydb import create_table, add_user, check_user, get_user_by_email

# Configure Flask to serve static files from root folder
app = Flask(__name__, 
            static_folder=os.path.join(os.path.dirname(__file__), '..'),
            static_url_path='/')
app.secret_key = 'your-secret-key-here-change-in-production'  # Needed for sessions

# Enable CORS for Netlify frontend
CORS(app, supports_credentials=True)

# Ensure the users table exists
create_table()

# Root route — serve landing page
@app.route("/")
def index():
    return send_from_directory(app.static_folder, "landing.html")

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
        return jsonify({"success": True}), 200
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
        # For security, don't reveal if email exists or not
        print(f"Password reset requested for: {email}")
        
        # In a production app, you would:
        # 1. Generate a unique reset token
        # 2. Store it in database with expiration time
        # 3. Send email with reset link containing the token
        
        return jsonify({"success": True, "message": "If an account exists, you will receive reset instructions."}), 200
    except Exception as e:
        print("Forgot password error:", e)
        return jsonify({"success": True, "message": "If an account exists, you will receive reset instructions."}), 200

# Catch-all for HTML files and static assets
@app.route("/<path:filename>")
def serve_static(filename):
    if filename.endswith('.html'):
        return send_from_directory(app.static_folder, filename)
    return send_from_directory(app.static_folder, filename)

if __name__ == "__main__":
    app.run()
