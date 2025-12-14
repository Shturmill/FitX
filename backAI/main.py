# backend/main.py
import json
import os
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests

app = FastAPI(
    title="FitX API",
    description="Backend API for FitX fitness app - AI assistant and health metrics",
    version="1.0.0"
)

# Enable CORS for mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- In-memory storage for health metrics (in production use a database) ---
health_data = {
    "steps": 0,
    "stepsGoal": 10000,
    "heartRate": 0,
    "sleepHours": 0,
    "activeMinutes": 0,
}

# --- Загрузка конфига ---
CONFIG_PATH = "config.json"
API_KEY = None

if os.path.exists(CONFIG_PATH):
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        config = json.load(f)
    API_KEY = config.get("openrouter_api_key")

# --- Request/Response Models ---
class AskRequest(BaseModel):
    question: str

class AskResponse(BaseModel):
    answer: str

class HealthMetricsUpdate(BaseModel):
    steps: Optional[int] = None
    stepsGoal: Optional[int] = None
    heartRate: Optional[int] = None
    sleepHours: Optional[float] = None
    activeMinutes: Optional[int] = None

class HealthMetricsResponse(BaseModel):
    steps: int
    stepsGoal: int
    heartRate: int
    sleepHours: float
    activeMinutes: int
    message: str

# --- Health Metrics Endpoints ---
@app.get("/health", response_model=HealthMetricsResponse)
def get_health_metrics():
    """Get current health metrics"""
    return HealthMetricsResponse(
        **health_data,
        message="Health metrics retrieved successfully"
    )

@app.post("/health", response_model=HealthMetricsResponse)
def update_health_metrics(update: HealthMetricsUpdate):
    """Update health metrics from external apps (fitness trackers, smartwatches, etc.)"""
    if update.steps is not None:
        health_data["steps"] = max(0, update.steps)
    if update.stepsGoal is not None:
        health_data["stepsGoal"] = max(1, update.stepsGoal)
    if update.heartRate is not None:
        health_data["heartRate"] = max(0, min(300, update.heartRate))
    if update.sleepHours is not None:
        health_data["sleepHours"] = max(0, min(24, update.sleepHours))
    if update.activeMinutes is not None:
        health_data["activeMinutes"] = max(0, update.activeMinutes)
    
    return HealthMetricsResponse(
        **health_data,
        message="Health metrics updated successfully"
    )

@app.put("/health/steps", response_model=HealthMetricsResponse)
def update_steps(steps: int):
    """Update step count"""
    health_data["steps"] = max(0, steps)
    return HealthMetricsResponse(**health_data, message=f"Steps updated to {steps}")

@app.put("/health/heart-rate", response_model=HealthMetricsResponse)
def update_heart_rate(bpm: int):
    """Update heart rate in BPM"""
    health_data["heartRate"] = max(0, min(300, bpm))
    return HealthMetricsResponse(**health_data, message=f"Heart rate updated to {bpm} bpm")

@app.put("/health/sleep", response_model=HealthMetricsResponse)
def update_sleep(hours: float):
    """Update sleep hours"""
    health_data["sleepHours"] = max(0, min(24, hours))
    return HealthMetricsResponse(**health_data, message=f"Sleep updated to {hours} hours")

@app.put("/health/active-minutes", response_model=HealthMetricsResponse)
def update_active_minutes(minutes: int):
    """Update active minutes"""
    health_data["activeMinutes"] = max(0, minutes)
    return HealthMetricsResponse(**health_data, message=f"Active minutes updated to {minutes}")

# --- AI Assistant Endpoint ---
@app.post("/ask", response_model=AskResponse)
def ask_ai(request: AskRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    
    if not API_KEY:
        raise HTTPException(status_code=503, detail="AI service not configured. Set openrouter_api_key in config.json")

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)