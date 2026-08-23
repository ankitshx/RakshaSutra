"""
RakshaSutra Billing & Subscription Data Models
Supports complete Razorpay subscription lifecycle, plans, payments, invoices, and webhook idempotency.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Plan(Base):
    __tablename__ = "plans"

    id = Column(String(50), primary_key=True)  # "free", "pro", "business", "enterprise"
    name = Column(String(100), nullable=False)
    tier = Column(String(30), nullable=False, unique=True)  # "free", "pro", "business", "enterprise"
    price_inr = Column(Integer, nullable=False, default=0)
    price_usd = Column(Integer, nullable=False, default=0)
    billing_period = Column(String(20), default="monthly")  # "monthly", "yearly", "forever"
    
    # Quotas & Limits
    daily_scan_quota = Column(Integer, default=6)
    monthly_scan_quota = Column(Integer, default=180)
    osint_daily_quota = Column(Integer, default=1)
    api_monthly_quota = Column(Integer, default=0)
    api_rate_limit_per_min = Column(Integer, default=0)
    team_seats = Column(Integer, default=1)
    
    # Feature matrix
    features = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    plan_id = Column(String(50), ForeignKey("plans.id"), nullable=False)
    
    # Gateway specific IDs
    razorpay_subscription_id = Column(String(100), nullable=True, index=True)
    razorpay_order_id = Column(String(100), nullable=True, index=True)
    
    status = Column(String(30), default="active", index=True)  # "active", "trialing", "past_due", "canceled", "expired"
    current_period_start = Column(DateTime, default=datetime.utcnow)
    current_period_end = Column(DateTime, nullable=True)
    cancel_at_period_end = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="subscriptions")
    payments = relationship("Payment", back_populates="subscription", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="subscription", cascade="all, delete-orphan")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subscription_id = Column(String(36), ForeignKey("subscriptions.id", ondelete="SET NULL"), nullable=True)
    
    razorpay_payment_id = Column(String(100), unique=True, nullable=True, index=True)
    razorpay_order_id = Column(String(100), nullable=True, index=True)
    razorpay_signature = Column(String(255), nullable=True)
    
    amount = Column(Integer, nullable=False)  # in smallest currency unit (e.g. paise / cents)
    currency = Column(String(10), default="INR")
    status = Column(String(30), default="created", index=True)  # "created", "authorized", "captured", "failed", "refunded"
    method = Column(String(50), nullable=True)  # "upi", "card", "netbanking"
    
    error_code = Column(String(100), nullable=True)
    error_description = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="payments")
    subscription = relationship("Subscription", back_populates="payments")

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subscription_id = Column(String(36), ForeignKey("subscriptions.id", ondelete="SET NULL"), nullable=True)
    payment_id = Column(String(36), ForeignKey("payments.id", ondelete="SET NULL"), nullable=True)
    
    invoice_number = Column(String(50), unique=True, nullable=False, index=True)
    amount = Column(Integer, nullable=False)
    tax_amount = Column(Integer, default=0)
    currency = Column(String(10), default="INR")
    status = Column(String(30), default="paid")  # "draft", "paid", "uncollectible", "void"
    invoice_pdf_url = Column(String(255), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    subscription = relationship("Subscription", back_populates="invoices")

class WebhookEvent(Base):
    __tablename__ = "webhook_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String(100), unique=True, nullable=False, index=True)  # For idempotency
    event_type = Column(String(100), nullable=False, index=True)
    payload = Column(JSON, nullable=False)
    status = Column(String(30), default="processed")  # "received", "processed", "failed", "ignored"
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
