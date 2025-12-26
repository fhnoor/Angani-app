from flask import Flask, request, redirect, send_from_directory, session, jsonify
from my_db import create_table, add_user, check_user

app = Flask(__name__)
app.secret_key = 'your-secret-key-here-change-in-production'  # Needed for sessions

# Ensure the users table exists
create_table()

# Root route — serve landing page
@app.route("/")
def index():
    return send_from_directory(".", "landing.html")

# Serve static HTML files (signup.html, signin.html, etc.)
@app.route("/<path:filename>")
def static_files(filename):
    return send_from_directory(".", filename)

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

if __name__ == "__main__":
    app.run(debug=True)
