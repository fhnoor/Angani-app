import os
from mydb import create_table

if __name__ == "__main__":
    create_table()
    print("Users table ensured in PostgreSQL (DATABASE_URL).")
