"""
Database Reset Script
Wipes out all existing tables and re-applies the new user-scoped schema.
Run from backend/ directory:
    python reset_db.py
"""

import sys
import os
from sqlalchemy import text

sys.path.insert(0, os.path.dirname(__file__))

from app.database import engine, SessionLocal


def reset_database():
    migration_file = os.path.join(os.path.dirname(__file__), "..", "supabase_migration.sql")
    if not os.path.exists(migration_file):
        print(f"❌ Migration file not found at {migration_file}")
        return

    with open(migration_file, "r") as f:
        sql_script = f.read()

    print("Connecting to database...")
    with engine.connect() as conn:
        print("Executing reset migration...")
        # Split statements or execute script block
        conn.execute(text(sql_script))
        conn.commit()
        print("✅ Database successfully reset and migrated to user-scoped schema!")


if __name__ == "__main__":
    reset_database()
