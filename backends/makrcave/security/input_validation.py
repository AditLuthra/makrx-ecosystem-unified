"""
Input Validation and Sanitization Module
Adapted from legacy MakrCave backend for unified repo.
"""

import re
import html
from typing import List

try:
    import bleach  # type: ignore
except Exception:  # bleach may not be installed in all envs
    bleach = None  # noqa


class InputSanitizer:
    XSS_PATTERNS = [
        r"<script[^>]*>.*?</script>",
        r"javascript:",
        r"on\w+\s*=",
        r"<iframe[^>]*>.*?</iframe>",
        r"<object[^>]*>.*?</object>",
        r"<embed[^>]*>.*?</embed>",
        r"<applet[^>]*>.*?</applet>",
        r"<meta[^>]*>",
        r"<link[^>]*>",
        r"<style[^>]*>.*?</style>",
        r"expression\s*\(",
        r"url\s*\(",
        r"@import",
        r"vbscript:",
        r"data:text/html",
    ]

    PATH_TRAVERSAL_PATTERNS = [
        r"\.\./\.\.",
        r"\.\.\\\.\.",
        r"\.\./",
        r"\.\.\\",
        r"%2e%2e%2f",
        r"%2e%2e%5c",
        r"%252e%252e%252f",
    ]

    SQL_INJECTION_PATTERNS = [
        r"(\s|^)(union|select|insert|update|delete|drop|create|alter|exec|execute)(\s|$)",
        r"(\s|^)(or|and)\s+\d+\s*=\s*\d+",
        r"--",
        r"/\*.*\*/",
        r";",
        r"\|\|",
        r"&&",
    ]

    @classmethod
    def sanitize_html(cls, text: str, allowed_tags: List[str] = None) -> str:
        if not text:
            return ""
        allowed = allowed_tags or ["b", "i", "u", "em", "strong", "p", "br", "ul", "ol", "li"]
        if bleach:
            return bleach.clean(text, tags=allowed, attributes={"*": ["class"]}, strip=True)
        # Fallback: basic escape + strip risky patterns
        sanitized = html.escape(text)
        for pattern in cls.XSS_PATTERNS:
            sanitized = re.sub(pattern, "", sanitized, flags=re.IGNORECASE)
        return sanitized

    @classmethod
    def sanitize_text(cls, text: str) -> str:
        if not text:
            return ""
        sanitized = html.escape(text)
        for pattern in cls.XSS_PATTERNS:
            sanitized = re.sub(pattern, "", sanitized, flags=re.IGNORECASE)
        return sanitized.strip()

    @classmethod
    def sanitize_filename(cls, filename: str) -> str:
        if not filename:
            return ""
        sanitized = filename
        for pattern in cls.PATH_TRAVERSAL_PATTERNS:
            sanitized = re.sub(pattern, "", sanitized, flags=re.IGNORECASE)
        sanitized = re.sub(r'[<>:"/\\|?*]', "", sanitized)
        sanitized = sanitized.strip('. ')
        return sanitized[:255]

    @classmethod
    def detect_sql_injection(cls, text: str) -> bool:
        if not text:
            return False
        text_lower = text.lower()
        return any(re.search(p, text_lower, flags=re.IGNORECASE) for p in cls.SQL_INJECTION_PATTERNS)

