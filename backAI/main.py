# backend/main.py
import json
import os
from typing import Optional, List
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

# --- User Context Models for AI Personalization ---
class UserProfile(BaseModel):
    name: str
    age: int
    gender: str
    weight: float  # kg
    height: float  # cm
    activityLevel: str
    goal: str

class NutritionData(BaseModel):
    calorieGoal: float
    proteinGoal: float
    carbsGoal: float
    fatsGoal: float
    todayCalories: float
    todayProtein: float
    todayCarbs: float
    todayFats: float
    mealsLogged: int

class HydrationData(BaseModel):
    waterGlasses: int
    waterGoal: int

class ActivityData(BaseModel):
    steps: int
    stepsGoal: int
    activeMinutes: int
    heartRate: int
    sleepHours: float

class RecentWorkout(BaseModel):
    date: str
    name: str
    duration: int
    exercisesCompleted: int

class TrainingData(BaseModel):
    recentWorkouts: List[RecentWorkout]
    totalWorkoutsThisMonth: int
    activeDaysThisMonth: int

class UserContext(BaseModel):
    profile: Optional[UserProfile] = None
    nutrition: Optional[NutritionData] = None
    hydration: Optional[HydrationData] = None
    activity: Optional[ActivityData] = None
    training: Optional[TrainingData] = None

class ConversationMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class EnhancedAskRequest(BaseModel):
    question: str
    userContext: Optional[UserContext] = None
    conversationHistory: Optional[List[ConversationMessage]] = None

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

# --- AI System Prompt Builder ---
def build_system_prompt(user_context: Optional[UserContext]) -> str:
    """Build a dynamic system prompt incorporating user data for personalized responses."""
    base_prompt = """You are a friendly, professional AI fitness coach assistant for the FitX app.
Respond in the same language the user writes in (Russian or English).
Provide practical, safe, and personalized advice on workouts, nutrition, hydration, and recovery.
Be encouraging and supportive. Keep responses concise but helpful (2-4 paragraphs max).
Never ask for data you already have about the user - use the context provided below.
Reference the user's data naturally in your responses (e.g., "Based on your goal of..." or "Since you've consumed...")."""

    if not user_context:
        return base_prompt + "\n\nNote: No user data available. Ask for relevant details if needed to provide personalized advice."

    context_parts = [base_prompt, "\n\n=== USER DATA (USE THIS TO PERSONALIZE RESPONSES, DO NOT ASK FOR THIS DATA) ==="]

    if user_context.profile:
        p = user_context.profile
        goal_text = {
            "lose_weight": "weight loss",
            "maintain": "maintaining current weight",
            "gain_weight": "weight gain",
            "gain_muscle": "muscle gain"
        }.get(p.goal, p.goal)

        activity_text = {
            "sedentary": "sedentary (little to no exercise)",
            "light": "lightly active (1-3 days/week)",
            "moderate": "moderately active (3-5 days/week)",
            "active": "active (6-7 days/week)",
            "very_active": "very active (intense exercise daily)"
        }.get(p.activityLevel, p.activityLevel)

        context_parts.append(f"""
PROFILE:
- Name: {p.name}
- Age: {p.age} years
- Gender: {p.gender}
- Weight: {p.weight} kg
- Height: {p.height} cm
- Activity Level: {activity_text}
- Fitness Goal: {goal_text}""")

    if user_context.nutrition:
        n = user_context.nutrition
        remaining_cal = round(n.calorieGoal - n.todayCalories)
        context_parts.append(f"""
TODAY'S NUTRITION:
- Daily Goals: {round(n.calorieGoal)} cal, {round(n.proteinGoal)}g protein, {round(n.carbsGoal)}g carbs, {round(n.fatsGoal)}g fats
- Consumed: {round(n.todayCalories)} cal ({remaining_cal} remaining), {round(n.todayProtein)}g protein, {round(n.todayCarbs)}g carbs, {round(n.todayFats)}g fats
- Meals Logged: {n.mealsLogged}""")

    if user_context.hydration:
        h = user_context.hydration
        context_parts.append(f"""
HYDRATION:
- Water: {h.waterGlasses}/{h.waterGoal} glasses (250ml each)""")

    if user_context.activity:
        a = user_context.activity
        context_parts.append(f"""
TODAY'S ACTIVITY:
- Steps: {a.steps}/{a.stepsGoal}
- Active Minutes: {a.activeMinutes}
- Heart Rate: {a.heartRate if a.heartRate > 0 else 'Not tracked'} bpm
- Sleep (last night): {a.sleepHours if a.sleepHours > 0 else 'Not tracked'} hours""")

    if user_context.training:
        t = user_context.training
        context_parts.append(f"""
TRAINING HISTORY:
- Workouts This Month: {t.totalWorkoutsThisMonth}
- Active Days This Month: {t.activeDaysThisMonth}""")
        if t.recentWorkouts:
            context_parts.append("- Recent Workouts:")
            for w in t.recentWorkouts[:5]:
                context_parts.append(f"  * {w.date}: {w.name} ({w.duration} min, {w.exercisesCompleted} exercises)")

    return "\n".join(context_parts)


# --- AI Assistant Endpoint ---
@app.post("/ask", response_model=AskResponse)
def ask_ai(request: EnhancedAskRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    if not API_KEY:
        raise HTTPException(status_code=503, detail="AI service not configured. Set openrouter_api_key in config.json")

    try:
        # Build dynamic system prompt with user context
        system_prompt = build_system_prompt(request.userContext)

        # Build messages array
        messages = [{"role": "system", "content": system_prompt}]

        # Add conversation history (last 10 messages for context)
        if request.conversationHistory:
            for msg in request.conversationHistory[-10:]:
                messages.append({"role": msg.role, "content": msg.content})

        # Add current question
        messages.append({"role": "user", "content": request.question})

        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost",
                "X-Title": "FitnessApp"
            },
            json={
                "model": "meta-llama/llama-3.3-70b-instruct:free",
                "messages": messages,
                "temperature": 0.3,
                "max_tokens": 800
            },
            timeout=20
        )
        response.raise_for_status()
        data = response.json()
        answer = data["choices"][0]["message"]["content"].strip()
        return AskResponse(answer=answer)

    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="Request timed out. Please try again.")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Network error: {str(e)}")
    except KeyError:
        raise HTTPException(status_code=500, detail=f"Invalid AI response: {response.text}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)