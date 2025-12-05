import os
import requests
import json

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://ollama:11434")

def strip_before_first_colon(text: str) -> str:
    """
    Removes anything before the first colon (:)
    Example:
        "Sure, here is the summary: ... real summary ..."
        → "... real summary ..."
    """
    if ":" in text:
        return text.split(":", 1)[1].strip()
    return text.strip()



def analyze_text(text: str):

    prompt = f"""
    You are a summarization engine.

    Your ONLY task:
    - Read the text.
    - Produce a summary of 5–7 sentences.
    - Length MUST be between 120 and 300 words.

    RULES (STRICT):
    - Do NOT start with phrases like "Sure", "Here is the summary", etc.
    - Do NOT explain what you are doing.
    - Do NOT add introductions or conclusions.
    - Output ONLY the summary text. No headings. No labels. No greeting.

    Text to summarize:
    {text}
    """

    resp = requests.post(
        f"{OLLAMA_URL}/api/generate",
        json={"model": "gemma:2b", "prompt": prompt, "stream": False},
    )

    data = resp.json()
    print("OLLAMA RAW:", data)

    if "error" in data:
        raise ValueError(f"Ollama error: {data['error']}")
    
    if "response" not in data:
        raise ValueError(f"No 'response' in Ollama output: {data}")

    try:
        return {
            "summary": strip_before_first_colon(data["response"])
        }

    except Exception as e:
        print("JSON parse error:", e)
        raise ValueError(f"Model did not return valid JSON: {data['response']}")
