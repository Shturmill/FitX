# backend/main.py
import json
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests

app = FastAPI(title="Фитнес-ассистент", description="Простой endpoint для ИИ-советов")

# --- Загрузка конфига ---
CONFIG_PATH = "config.json"

if not os.path.exists(CONFIG_PATH):
    raise RuntimeError(
        "❌ config.json не найден. Создайте его вручную:\n"
        '{"openrouter_api_key": "sk-or-..."}'
    )

with open(CONFIG_PATH, "r", encoding="utf-8") as f:
    config = json.load(f)
API_KEY = config["openrouter_api_key"]

class AskRequest(BaseModel):
    question: str

class AskResponse(BaseModel):
    answer: str

# --- Endpoint ---
@app.post("/ask", response_model=AskResponse)
def ask_ai(request: AskRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Вопрос не может быть пустым")

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost", 
                "X-Title": "FitnessApp"
            },
            json={
                "model": "meta-llama/llama-3.1-8b-instruct",  
                "messages": [
                    {
                        "role": "system",
                        "content": (
                            "Ты — фитнес-ассистент. Отвечай на русском языке. "
                            "Давай практичные, безопасные советы по тренировкам и питанию. "
                            "Не выдумывай. Если не хватает данных — попроси уточнить цель, вес, возраст."
                        )
                    },
                    {"role": "user", "content": request.question}
                ],
                "temperature": 0.3,
                "max_tokens": 500
            },
            timeout=20
        )
        response.raise_for_status()
        data = response.json()
        answer = data["choices"][0]["message"]["content"].strip()
        return AskResponse(answer=answer)

    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="Таймаут: ИИ не ответил за 20 сек")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Ошибка сети или OpenRouter: {str(e)}")
    except KeyError:
        raise HTTPException(status_code=500, detail=f"Некорректный ответ от ИИ: {response.text}")