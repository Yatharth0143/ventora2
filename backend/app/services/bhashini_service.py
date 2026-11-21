import httpx
from app.config import settings

SCHEDULED_INDIAN_LANGUAGES = [
    "hi", "en", "bn", "te", "mr", "ta", "ur", "gu", "kn", "ml", "or",
    "pa", "as", "mai", "sat", "ks", "ne", "sd", "kok", "doi", "mni", "brx", "sa"
]


def detect_language_simple(text: str) -> str:
    # Check for Devanagari Unicode range
    for char in text[:1000]:
        if '\u0900' <= char <= '\u097F':
            return "hi"
    return "en"


async def translate_text(text: str, source_lang: str, target_lang: str) -> str:
    """Translate text using Bhashini NLTM API with graceful fallback."""
    if not text.strip() or source_lang == target_lang:
        return text

    if not settings.BHASHINI_INFERENCE_KEY or not settings.BHASHINI_UDYAT_KEY:
        return text

    try:
        headers = {
            "udyat-key": settings.BHASHINI_UDYAT_KEY,
            "Authorization": settings.BHASHINI_INFERENCE_KEY,
            "Content-Type": "application/json",
        }
        payload = {
            "pipelineTasks": [
                {
                    "taskType": "translation",
                    "config": {
                        "language": {
                            "sourceLanguage": source_lang,
                            "targetLanguage": target_lang,
                        }
                    }
                }
            ],
            "inputData": {
                "input": [{"source": text[:2000]}]  # Bhashini chunk limit
            }
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(settings.BHASHINI_API_URL, json=payload, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                trans_text = data.get("pipelineResponse", [{}])[0].get("output", [{}])[0].get("target")
                if trans_text:
                    return trans_text
    except Exception:
        pass

    return text

