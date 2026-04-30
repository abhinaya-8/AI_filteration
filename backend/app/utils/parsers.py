from werkzeug.utils import secure_filename
from app.config import Config


def allowed_file(filename):
    if not filename:
        return False
    return "." in filename and filename.rsplit(".", 1)[1].lower() in Config.ALLOWED_EXTENSIONS


def safe_save_path(filename, folder):
    name = secure_filename(filename)
    if not name:
        name = "resume"
    base, ext = name.rsplit(".", 1) if "." in name else (name, "")
    from datetime import datetime
    import uuid
    unique = f"{base}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:8]}"
    if ext:
        unique += f".{ext}"
    return folder / unique
