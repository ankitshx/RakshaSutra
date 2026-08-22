import sqlite3
import os

db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../rakshasutra.db"))
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Set all non-admin users default quota to 10 scans per login
cursor.execute("UPDATE users SET monthly_quota = 10 WHERE role != 'admin'")
conn.commit()

cursor.execute("SELECT email, role, monthly_quota, scans_used FROM users")
rows = cursor.fetchall()
print("Current users & quota limits:")
for r in rows:
    print(f" - {r[0]} ({r[1]}): {r[3]}/{r[2]} scans")

conn.close()
print("Quota database migration completed successfully!")
