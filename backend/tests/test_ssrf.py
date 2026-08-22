import pytest
from app.core.ssrf import is_ip_blocked, validate_destination_safety

def test_private_ipv4_blocked():
    assert is_ip_blocked("127.0.0.1")[0] is True
    assert is_ip_blocked("10.0.0.1")[0] is True
    assert is_ip_blocked("172.16.5.10")[0] is True
    assert is_ip_blocked("192.168.1.1")[0] is True
    assert is_ip_blocked("169.254.169.254")[0] is True  # Cloud metadata
    assert is_ip_blocked("100.64.0.1")[0] is True  # CGNAT
    assert is_ip_blocked("0.0.0.0")[0] is True

def test_ipv6_loopback_and_private_blocked():
    assert is_ip_blocked("::1")[0] is True
    assert is_ip_blocked("fc00::1")[0] is True
    assert is_ip_blocked("fe80::1")[0] is True
    assert is_ip_blocked("::ffff:127.0.0.1")[0] is True

def test_public_ip_allowed():
    assert is_ip_blocked("8.8.8.8")[0] is False
    assert is_ip_blocked("1.1.1.1")[0] is False
    assert is_ip_blocked("142.250.190.46")[0] is False

def test_internal_hostnames_blocked():
    is_safe, _, _ = validate_destination_safety("localhost")
    assert is_safe is False

    is_safe, _, _ = validate_destination_safety("metadata.google.internal")
    assert is_safe is False
