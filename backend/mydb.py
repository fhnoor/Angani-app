import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

def get_db():
    conn = sqlite3.connect("users.db")
    conn.row_factory = sqlite3.Row
    return conn

def create_table():
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


def add_user(name, email, password):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    hashed_password = generate_password_hash(password)
    conn.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", (name, email, hashed_password))
    conn.commit()
    conn.close()

def check_user(email, password):
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
    conn.close()
    if user and check_password_hash(user['password'], password):
        return user
    return None

def get_user_by_email(email):
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
    conn.close()
    return user

def update_password(email, new_password):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    hashed_password = generate_password_hash(new_password)
    cursor.execute("UPDATE users SET password=? WHERE email=?", (hashed_password, email))
    conn.commit()
    conn.close()
