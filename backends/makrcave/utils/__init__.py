"""
MakrCave Utility Functions

This package contains utility functions and services for the MakrCave application.

Note: Some utilities (reports/invoices) depend on heavy optional libraries like
`reportlab` and `openpyxl`. To keep imports lightweight in environments where
these aren't installed (e.g., unit tests), we import them lazily and provide
clear error messages if used without dependencies.
"""

# Import commonly used utilities
from .email_service import EmailService
from .payment_service import PaymentService

# Lazily import heavy utilities, falling back to stubs when dependencies
# are not installed. This prevents ModuleNotFoundError during app import in
# test environments where report generation isn't exercised.
try:  # pragma: no cover - exercised indirectly
    from .report_generator import ReportGenerator  # type: ignore
except Exception as _e:  # noqa: F841
    class ReportGenerator:  # type: ignore
        def __init__(self, *_, **__):  # pragma: no cover
            raise ImportError(
                "ReportGenerator requires optional dependencies (reportlab, openpyxl). "
                "Install them or avoid using report generation in this environment."
            )

try:  # pragma: no cover
    from .invoice_generator import InvoiceGenerator  # type: ignore
except Exception as _e:  # noqa: F841
    class InvoiceGenerator:  # type: ignore
        def __init__(self, *_, **__):  # pragma: no cover
            raise ImportError(
                "InvoiceGenerator requires optional dependencies (reportlab). "
                "Install them or avoid using invoice generation in this environment."
            )

__all__ = [
    "EmailService",
    "PaymentService",
    "ReportGenerator",
    "InvoiceGenerator",
]
