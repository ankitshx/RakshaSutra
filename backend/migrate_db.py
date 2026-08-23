import sqlite3
import os
from app.core.security import get_password_hash

DB_PATH = "rakshasutra.db"

def migrate():
    if not os.path.exists(DB_PATH):
        print(f"{DB_PATH} not found.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Get existing columns in users table
    cursor.execute("PRAGMA table_info(users)")
    existing_cols = [row[1] for row in cursor.fetchall()]
    print("Existing users columns:", existing_cols)

    # Columns to add if missing
    new_cols = {
        "daily_quota": "INTEGER DEFAULT 6",
        "scans_today": "INTEGER DEFAULT 0",
        "last_scan_date": "VARCHAR(20) DEFAULT ''",
        "subscription_tier": "VARCHAR(50) DEFAULT 'free'"
    }

    for col_name, col_type in new_cols.items():
        if col_name not in existing_cols:
            cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
            print(f"Added column {col_name} ({col_type}) to users table.")

    # Ensure official default Admin account exists with known secure password
    admin_email = "admin@rakshasutra.org"
    admin_pass = "Admin@RakshaSutra2026"
    hashed_pass = get_password_hash(admin_pass)

    cursor.execute("SELECT id FROM users WHERE email = ?", (admin_email,))
    existing_admin = cursor.fetchone()

    if existing_admin:
        cursor.execute(
            "UPDATE users SET hashed_password = ?, role = 'admin', is_active = 1, daily_quota = 999999 WHERE email = ?",
            (hashed_pass, admin_email)
        )
        print(f"Updated existing admin account: {admin_email}")
    else:
        cursor.execute(
            """INSERT INTO users (email, hashed_password, full_name, role, subscription_tier, daily_quota, scans_today, last_scan_date, monthly_quota, scans_used, is_active, api_key, created_at, updated_at)
               VALUES (?, ?, ?, 'admin', 'enterprise', 999999, 0, '', 999999, 0, 1, 'rs_admin_master_key_2026', datetime('now'), datetime('now'))""",
            (admin_email, hashed_pass, "Chief Security Officer")
        )
        print(f"Created official admin account: {admin_email}")

    conn.commit()
    conn.close()
    print("Migration and admin provisioning complete.")

if __name__ == "__main__":
    migrate()
