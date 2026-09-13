"""
Sarvam AI Service Module.
Interfaces with Sarvam AI REST APIs for:
1. Speech-to-Text (Saaras ASR): Transcribes audio (Gujarati, Hindi, English) to text.
2. Text-to-Speech (Bulbul TTS): Converts text (Gujarati, Hindi, English) into natural speech.
"""

import os
import re
import logging
import requests
import base64
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY", "sk_z7rt5kcf_dtpfLgylR7WF5C9DQmVz5boo")
SARVAM_STT_URL = "https://api.sarvam.ai/speech-to-text"
SARVAM_TTS_URL = "https://api.sarvam.ai/text-to-speech"
DEFAULT_TTS_MODEL = os.getenv("SARVAM_TTS_MODEL", "bulbul:v3")
DEFAULT_STT_MODEL = os.getenv("SARVAM_STT_MODEL", "saaras:v3")
DEFAULT_SPEAKER = os.getenv("SARVAM_DEFAULT_SPEAKER", "pooja")
DEFAULT_LANG = os.getenv("SARVAM_DEFAULT_LANG", "gu-IN")

# Valid bulbul:v3 speakers
VALID_SPEAKERS = {
    "pooja", "shreya", "priya", "neha", "simran", "ritu", "aditya", "rahul",
    "kavya", "amit", "dev", "ishita", "ratan", "varun", "manan", "sumit",
    "roopa", "kabir", "aayan", "shubh", "advait", "anand", "tanya", "tarun",
    "sunny", "mani", "gokul", "vijay", "shruti", "suhani", "mohit", "kavitha",
    "rehan", "soham", "rupali"
}


class SarvamService:
    """Service wrapper for Sarvam AI Voice APIs."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or SARVAM_API_KEY

    def speech_to_text(
        self,
        file_bytes: bytes,
        filename: str = "audio.wav",
        language_code: str = "gu-IN",
        prompt: Optional[str] = None,
        model: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send audio binary to Sarvam Saaras Speech-to-Text API.
        """
        if not self.api_key:
            logger.error("SARVAM_API_KEY is missing!")
            return {"transcript": "", "error": "Sarvam API Key is not configured.", "success": False}

        headers = {
            "api-subscription-key": self.api_key
        }

        stt_model = model or DEFAULT_STT_MODEL
        data = {
            "model": stt_model,
            "language_code": language_code
        }
        if prompt:
            data["prompt"] = prompt

        mime_type = "audio/webm" if filename.endswith(".webm") else "audio/wav"
        files = {
            "file": (filename, file_bytes, mime_type)
        }

        try:
            logger.info(f"Sending audio ({len(file_bytes)} bytes, model={stt_model}) to Sarvam STT (lang={language_code})...")
            response = requests.post(SARVAM_STT_URL, headers=headers, data=data, files=files, timeout=30)
            
            if response.status_code == 200:
                res_data = response.json()
                transcript = res_data.get("transcript", "").strip()
                detected_lang = res_data.get("language_code", language_code)
                logger.info(f"Sarvam STT success! Transcript: '{transcript}'")
                return {
                    "transcript": transcript,
                    "language_code": detected_lang,
                    "success": True
                }
            else:
                logger.error(f"Sarvam STT failed with HTTP {response.status_code}: {response.text}")
                return {
                    "transcript": "",
                    "error": f"Sarvam STT returned HTTP {response.status_code}: {response.text}",
                    "success": False
                }

        except Exception as e:
            logger.error(f"Exception during Sarvam STT request: {e}")
            return {
                "transcript": "",
                "error": str(e),
                "success": False
            }

    def text_to_speech(
        self,
        text: str,
        target_language_code: str = "gu-IN",
        speaker: str = DEFAULT_SPEAKER,
        pace: float = 1.0,
        pitch: float = 0.0,
        model: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send text to Sarvam Bulbul Text-to-Speech API.
        """
        if not self.api_key:
            return {"audio_base64": None, "error": "Sarvam API key not set", "success": False}

        # Normalize speaker if unknown
        chosen_speaker = speaker.lower() if speaker else DEFAULT_SPEAKER
        if chosen_speaker not in VALID_SPEAKERS:
            chosen_speaker = "pooja"

        tts_model = model or DEFAULT_TTS_MODEL

        # Clean markdown headers, asterisks, links, emojis for smooth audio output
        clean_text = re.sub(r"[#*`_\-\[\]\(\)]", " ", text)
        clean_text = re.sub(r"https?://\S+", "", clean_text)
        clean_text = re.sub(r"\s+", " ", clean_text).strip()
        if len(clean_text) > 1500:
            clean_text = clean_text[:1500] + "..."

        if not clean_text:
            return {"audio_base64": None, "error": "Cleaned text is empty", "success": False}

        headers = {
            "api-subscription-key": self.api_key,
            "Content-Type": "application/json"
        }

        payload = {
            "inputs": [clean_text],
            "target_language_code": target_language_code,
            "speaker": chosen_speaker,
            "pitch": pitch,
            "pace": pace,
            "loudness": 1.5,
            "speech_sample_rate": 8000,
            "enable_preprocessing": True,
            "model": tts_model
        }

        try:
            logger.info(f"Synthesizing Gujarati TTS for text length {len(clean_text)} (speaker={chosen_speaker}, model={tts_model})...")
            response = requests.post(SARVAM_TTS_URL, headers=headers, json=payload, timeout=30)
            
            if response.status_code == 200:
                res_data = response.json()
                audios = res_data.get("audios", [])
                if audios and len(audios) > 0:
                    audio_b64 = audios[0]
                    audio_url = f"data:audio/wav;base64,{audio_b64}"
                    logger.info("Sarvam TTS synthesized audio successfully.")
                    return {
                        "audio_base64": audio_b64,
                        "audio_url": audio_url,
                        "speaker": chosen_speaker,
                        "language_code": target_language_code,
                        "success": True
                    }
                else:
                    return {"audio_base64": None, "error": "No audio returned in response", "success": False}
            else:
                logger.error(f"Sarvam TTS failed HTTP {response.status_code}: {response.text}")
                return {"audio_base64": None, "error": f"HTTP {response.status_code}: {response.text}", "success": False}

        except Exception as e:
            logger.error(f"Exception during Sarvam TTS request: {e}")
            return {"audio_base64": None, "error": str(e), "success": False}


sarvam_service = SarvamService()


def test_sarvam_connection() -> Dict[str, Any]:
    """
    Diagnostic helper to test Sarvam AI API connectivity for both STT and TTS.
    """
    results = {"tts": None, "stt": None, "overall_status": "FAILED"}

    # 1. Test TTS
    sample_guj_text = "નમસ્તે, આરોગ્યમિત્ર માં આપનું સ્વાગત છે."
    tts_res = sarvam_service.text_to_speech(sample_guj_text, target_language_code="gu-IN", speaker="pooja")
    results["tts"] = {
        "success": tts_res.get("success", False),
        "has_audio": bool(tts_res.get("audio_base64")),
        "error": tts_res.get("error")
    }

    # 2. Test STT with synthesized audio if available
    if tts_res.get("audio_base64"):
        raw_audio = base64.b64decode(tts_res["audio_base64"])
        stt_res = sarvam_service.speech_to_text(raw_audio, filename="test_sample.wav", language_code="gu-IN")
        results["stt"] = {
            "success": stt_res.get("success", False),
            "transcript": stt_res.get("transcript", ""),
            "error": stt_res.get("error")
        }

    if results["tts"]["success"] and results.get("stt", {}).get("success"):
        results["overall_status"] = "ALL_SYSTEMS_OPERATIONAL"
    elif results["tts"]["success"]:
        results["overall_status"] = "TTS_OPERATIONAL"

    return results
