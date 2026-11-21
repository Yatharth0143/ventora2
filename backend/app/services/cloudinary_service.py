import cloudinary
import cloudinary.uploader
import cloudinary.utils
from app.config import settings

_configured = False


def ensure_configured():
    global _configured
    if not _configured:
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True,
        )
        _configured = True


def upload_deck(file_bytes: bytes, filename: str) -> dict:
    ensure_configured()
    try:
        res = cloudinary.uploader.upload(
            file_bytes,
            resource_type="raw",
            folder="ventora_decks",
            public_id=f"deck_{filename}_{int(cloudinary.utils.now())}",
        )
        return {
            "url": res.get("url"),
            "secure_url": res.get("secure_url"),
            "public_id": res.get("public_id"),
        }
    except Exception as e:
        # Fallback for dev / offline or unconfigured
        return {
            "url": f"/mock_uploads/{filename}",
            "secure_url": f"/mock_uploads/{filename}",
            "public_id": f"mock_{filename}",
        }


def get_signed_url(public_id: str, ttl_seconds: int = 604800) -> str:
    ensure_configured()
    try:
        url, _ = cloudinary.utils.cloudinary_url(
            public_id,
            resource_type="raw",
            sign_url=True,
            expires_at=int(cloudinary.utils.now()) + ttl_seconds
        )
        return url
    except Exception:
        return f"/mock_uploads/{public_id}"


def delete_file(public_id: str) -> bool:
    ensure_configured()
    try:
        res = cloudinary.uploader.destroy(public_id, resource_type="raw")
        return res.get("result") == "ok"
    except Exception:
        return True

