"""
RakshaSutra Enterprise PII Scrubbing & Data Redaction Engine
Scrubs sensitive citizen identifiers (Aadhaar, PAN, Phone, Credit Cards, OTPs, Tokens)
prior to persistent logging, telemetry dispatch, or external threat querying.
"""

import re
from typing import Tuple, Dict, Any

class PIIScrubber:
    # Regex patterns for high-sensitivity identifiers
    AADHAAR_PATTERN = re.compile(r'\b[2-9]\d{3}[ -]?\d{4}[ -]?\d{4}\b')
    PAN_PATTERN = re.compile(r'\b[A-Z]{5}[0-9]{4}[A-Z]\b')
    PHONE_PATTERN = re.compile(r'(?:\+91[\-\s]?|91[\-\s]?|0)?[6-9]\d{4}[\-\s]?\d{5}\b')
    CARD_PATTERN = re.compile(r'\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9]{2})[0-9]{12}|3[47][0-9]{13})\b')
    OTP_PATTERN = re.compile(r'(?i)\b(?:otp|one[- ]time[- ]password|pin|passcode|code)\s*(?:is|:|-)?\s*(\d{4,8})\b')
    TOKEN_PATTERN = re.compile(r'(?i)(?:bearer\s+[a-zA-Z0-9_\-\.]{20,}|(?:api[_\-]?key|secret|password)\s*[:=]\s*["\']?[a-zA-Z0-9_\-\.]{12,}["\']?)')

    @classmethod
    def scrub_text(cls, text: str) -> Tuple[str, Dict[str, int]]:
        """
        Scrub sensitive PII from text and return the sanitized string along with redaction counts.
        """
        if not text:
            return text, {}

        redaction_counts = {
            "aadhaar": 0,
            "pan": 0,
            "phone": 0,
            "card": 0,
            "otp": 0,
            "token": 0
        }

        # 1. Redact OTPs / Passcodes
        def otp_repl(match):
            nonlocal redaction_counts
            redaction_counts["otp"] += 1
            full_match = match.group(0)
            code = match.group(1)
            return full_match.replace(code, "[REDACTED-OTP]")
        
        scrubbed = cls.OTP_PATTERN.sub(otp_repl, text)

        # 2. Redact Auth Tokens / Secrets
        def token_repl(match):
            nonlocal redaction_counts
            redaction_counts["token"] += 1
            return "[REDACTED-AUTH-TOKEN]"
        
        scrubbed = cls.TOKEN_PATTERN.sub(token_repl, scrubbed)

        # 3. Redact Aadhaar Numbers
        def aadhaar_repl(match):
            nonlocal redaction_counts
            redaction_counts["aadhaar"] += 1
            return "XXXX-XXXX-[REDACTED-AADHAAR]"
        
        scrubbed = cls.AADHAAR_PATTERN.sub(aadhaar_repl, scrubbed)

        # 4. Redact PAN Cards
        def pan_repl(match):
            nonlocal redaction_counts
            redaction_counts["pan"] += 1
            return "[REDACTED-PAN]"
        
        scrubbed = cls.PAN_PATTERN.sub(pan_repl, scrubbed)

        # 5. Redact Credit / Debit Card Numbers
        def card_repl(match):
            nonlocal redaction_counts
            redaction_counts["card"] += 1
            return "[REDACTED-PAYMENT-CARD]"
        
        scrubbed = cls.CARD_PATTERN.sub(card_repl, scrubbed)

        # 6. Redact Indian Phone Numbers
        def phone_repl(match):
            nonlocal redaction_counts
            redaction_counts["phone"] += 1
            return "+91-XXXXX-[PHONE]"
        
        scrubbed = cls.PHONE_PATTERN.sub(phone_repl, scrubbed)

        total_redactions = sum(redaction_counts.values())
        return scrubbed, {k: v for k, v in redaction_counts.items() if v > 0}

    @classmethod
    def sanitize_payload(cls, data: Any) -> Any:
        """Recursively sanitize PII from dictionaries, lists, and strings."""
        if isinstance(data, str):
            sanitized, _ = cls.scrub_text(data)
            return sanitized
        elif isinstance(data, dict):
            return {k: cls.sanitize_payload(v) for k, v in data.items()}
        elif isinstance(data, list):
            return [cls.sanitize_payload(v) for v in data]
        return data

pii_scrubber = PIIScrubber()
