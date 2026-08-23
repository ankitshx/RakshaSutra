"""
RakshaSutra Database Migration & Seeding Utility
Safely migrates SQLite and PostgreSQL schemas and seeds official Super Admin and Plan catalog.
"""

import os
import sqlite3
from app.core.database import engine, Base, SessionLocal
from app.core.security import get_password_hash
from app.core.config import settings
import app.models  # Imports all models
from app.models.user import User
from app.models.billing import Plan

def run_migration():
    print("Running database migrations...")
    
    # 1. Create all SQLAlchemy models/tables
    Base.metadata.create_all(bind=engine)
    print("All SQLAlchemy tables verified and created.")

    # 2. If SQLite, safely check and add any missing columns in users table
    db_url = settings.DATABASE_URL
    if "sqlite" in db_url:
        db_file = db_url.replace("sqlite:///", "").replace("./", "")
        if os.path.exists(db_file):
            conn = sqlite3.connect(db_file)
            cursor = conn.cursor()
            cursor.execute("PRAGMA table_info(users)")
            existing_cols = [row[1] for row in cursor.fetchall()]

            new_cols = {
                "daily_quota": "INTEGER DEFAULT 6",
                "scans_today": "INTEGER DEFAULT 0",
                "last_scan_date": "VARCHAR(20) DEFAULT ''",
                "osint_quota": "INTEGER DEFAULT 1",
                "osint_today": "INTEGER DEFAULT 0",
                "last_osint_date": "VARCHAR(20) DEFAULT ''",
                "subscription_tier": "VARCHAR(50) DEFAULT 'free'"
            }

            for col_name, col_type in new_cols.items():
                if col_name not in existing_cols:
                    try:
                        cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
                        print(f"Added column {col_name} ({col_type}) to users table.")
                    except Exception as e:
                        print(f"Column notice for {col_name}: {e}")
            conn.commit()
            conn.close()

    # 3. Seed Plan Catalog and Super Admin via SessionLocal
    db = SessionLocal()
    try:
        # Seed Plans
        plans_data = [
            {"id": "free", "name": "Community Free", "tier": "free", "price_inr": 0, "daily_scan_quota": 6, "osint_daily_quota": 1, "api_monthly_quota": 0},
            {"id": "pro", "name": "Pro Cyber Defender", "tier": "pro", "price_inr": 299, "daily_scan_quota": 100, "osint_daily_quota": 999999, "api_monthly_quota": 0},
            {"id": "business", "name": "Business Team Suite", "tier": "business", "price_inr": 999, "daily_scan_quota": 500, "osint_daily_quota": 999999, "api_monthly_quota": 1000},
            {"id": "enterprise", "name": "Enterprise SOC & Defense", "tier": "enterprise", "price_inr": 4999, "daily_scan_quota": 999999, "osint_daily_quota": 999999, "api_monthly_quota": 50000}
        ]

        for p_info in plans_data:
            existing_p = db.query(Plan).filter(Plan.id == p_info["id"]).first()
            if not existing_p:
                p = Plan(
                    id=p_info["id"],
                    name=p_info["name"],
                    tier=p_info["tier"],
                    price_inr=p_info["price_inr"],
                    daily_scan_quota=p_info["daily_scan_quota"],
                    osint_daily_quota=p_info["osint_daily_quota"],
                    api_monthly_quota=p_info["api_monthly_quota"]
                )
                db.add(p)

        # Seed / Update Super Admin
        admin_email = settings.ADMIN_EMAIL
        admin_pass = settings.ADMIN_PASSWORD
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                email=admin_email,
                hashed_password=get_password_hash(admin_pass),
                full_name="Chief Security Officer",
                role="super_admin",
                subscription_tier="enterprise",
                daily_quota=999999,
                osint_quota=999999,
                is_active=True
            )
            db.add(admin)
            print(f"Created official Super Admin account: {admin_email}")
        else:
            admin.hashed_password = get_password_hash(admin_pass)
            admin.role = "super_admin"
            admin.subscription_tier = "enterprise"
            admin.daily_quota = 999999
            admin.osint_quota = 999999
            admin.is_active = True
            print(f"Updated official Super Admin account: {admin_email}")

        db.commit()
        print("Database migration and seeding completed successfully.")
    except Exception as e:
        print(f"Migration error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run_migration()
