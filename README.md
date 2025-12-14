# FitX 

FitX — это комплексное фитнес-приложение для Android, объединяющее функции дневника питания, журнала тренировок, системы достижений и AI-помощника для достижения пользовательских целей.

## Tech Stack

**Frontend:** React Native (Expo)

**Backend:** Python (FastAPI)

**Database:** AsyncStorage (local)

**AI/ML:** OpenRouter API (LLaMA 3.1)

## Features

* Дневник питания с базой продуктов и подсчетом БЖУ
* Журнал тренировок с предустановленными и адаптивными планами
* Система достижений и прогресса
* AI-помощник с чат-интерфейсом для персонализированных рекомендаций
* Интеграция с внешними сервисами (фитнес-трекеры, умные часы)

## Backend API

Backend **порт 8000** по умолчанию.

### Starting the Server

```bash
cd backAI
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### API Endpoints

Base URL: `http://localhost:8000`

#### Health Metrics (External App Integration)

Тестовые точки для работы с внешними приложениями

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Отображает текущие метрики |
| PUT | `/health/steps?steps=<value>` | Обновляет количество шагов |
| PUT | `/health/heart-rate?bpm=<value>` | Обновляет сердцебиение|
| PUT | `/health/sleep?hours=<value>` | Обновляет время сна в часах |
| PUT | `/health/active-minutes?minutes=<value>` | Обновляет минуты активности |

#### Example Requests

**Get health metrics:**
```bash
curl http://localhost:8000/health
```

**Update steps from fitness tracker:**
```bash
curl -X PUT "http://localhost:8000/health/steps?steps=8500"
```

**Update heart rate from smartwatch:**
```bash
curl -X PUT "http://localhost:8000/health/heart-rate?bpm=72"
```

**Update sleep data:**
```bash
curl -X PUT "http://localhost:8000/health/sleep?hours=7.5"
```

**Update all metrics at once:**
```bash
curl -X POST http://localhost:8000/health \
  -H "Content-Type: application/json" \
  -d '{"steps": 10000, "heartRate": 68, "sleepHours": 8, "activeMinutes": 45}'
```

#### AI Assistant

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ask` | Спросить ИИ |

**Example:**
```bash
curl -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "How many calories should I eat to lose weight?"}'
```

### API Documentation

Interactive API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Configuration

Create `backAI/config.json` for AI features:
```json
{
  "openrouter_api_key": "sk-or-your-api-key"
}
```