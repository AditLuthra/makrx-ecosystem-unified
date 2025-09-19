# Ensure the repository root is on sys.path so 'import backends' works in tests
import sys
from pathlib import Path

# Add repo root (the directory containing 'backends') to sys.path once
_REPO_ROOT = Path(__file__).resolve().parent
if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))

# Optionally, also add the 'backends' package dir explicitly (not strictly
# needed)
_BACKENDS_DIR = _REPO_ROOT / "backends"
if _BACKENDS_DIR.is_dir():
    backends_path = str(_BACKENDS_DIR.resolve())
    if backends_path not in sys.path:
        sys.path.insert(0, backends_path)
