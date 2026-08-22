import sqlite3
import os

db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../rakshasutra.db"))
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(users)")
existing_cols = [row[1] for row in cursor.fetchall()]
print(f"Existing users columns: {existing_cols}")

if "subscription_tier" not in existing_cols:
    cursor.execute("ALTER TABLE users ADD COLUMN subscription_tier VARCHAR(30) DEFAULT 'free'")
    print("Added column: subscription_tier")

if "monthly_quota" not in existing_cols:
    cursor.execute("ALTER TABLE users ADD COLUMN monthly_quota INTEGER DEFAULT 50")
    print("Added column: monthly_quota")

if "scans_used" not in existing_cols:
    cursor.execute("ALTER TABLE users ADD COLUMN scans_used INTEGER DEFAULT 0")
    print("Added column: scans_used")

conn.commit()
conn.close()
print("Migration script finished successfully!")
