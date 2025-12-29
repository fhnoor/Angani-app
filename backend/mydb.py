import os
import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor
from werkzeug.security import generate_password_hash, check_password_hash

# Postgres connection pool using DATABASE_URL
DATABASE_URL = os.environ.get("DATABASE_URL")

_pg_pool: pool.SimpleConnectionPool | None = None


def _ensure_pool():
    global _pg_pool
    if _pg_pool is None:
        if not DATABASE_URL:
            raise RuntimeError(
                "DATABASE_URL environment variable is not set. Configure it for local dev and Render."
            )
        # Render requires SSL; ok to pass sslmode=require in most environments
        _pg_pool = pool.SimpleConnectionPool(1, 5, dsn=DATABASE_URL, sslmode="require")


def _get_conn():
    _ensure_pool()
    assert _pg_pool is not None
    return _pg_pool.getconn()


def _put_conn(conn):
    assert _pg_pool is not None
    _pg_pool.putconn(conn)


def create_table():
    conn = _get_conn()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    CREATE TABLE IF NOT EXISTS users (
                        id SERIAL PRIMARY KEY,
                        name TEXT NOT NULL,
                        email TEXT UNIQUE NOT NULL,
                        password TEXT NOT NULL
                    )
                    """
                )
    finally:
        _put_conn(conn)


def add_user(name: str, email: str, password: str):
    conn = _get_conn()
    try:
        hashed_password = generate_password_hash(password)
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
                    (name, email, hashed_password),
                )
    finally:
        _put_conn(conn)


def check_user(email: str, password: str):
    conn = _get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT id, name, email, password FROM users WHERE email=%s", (email,))
            user = cur.fetchone()
            if user and check_password_hash(user["password"], password):
                return user
            return None
    finally:
        _put_conn(conn)


def get_user_by_email(email: str):
    conn = _get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT id, name, email, password FROM users WHERE email=%s", (email,))
            return cur.fetchone()
    finally:
        _put_conn(conn)


def update_password(email: str, new_password: str):
    conn = _get_conn()
    try:
        hashed_password = generate_password_hash(new_password)
        with conn:
            with conn.cursor() as cur:
                cur.execute("UPDATE users SET password=%s WHERE email=%s", (hashed_password, email))
    finally:
        _put_conn(conn)
 
