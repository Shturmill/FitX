#!/bin/bash

# Даем серверу время на запуск
sleep 3

echo "=== Test 1: GET /health (начальные данные) ==="
curl -s http://localhost:8000/health
echo -e "\n"

echo "=== Test 2: PUT /health/steps?steps=5000 ==="
curl -s -X PUT "http://localhost:8000/health/steps?steps=5000"
echo -e "\n"

echo "=== Test 3: GET /health (после обновления steps) ==="
curl -s http://localhost:8000/health
echo -e "\n"

echo "=== Test 4: PUT /health/heart-rate?bpm=72 ==="
curl -s -X PUT "http://localhost:8000/health/heart-rate?bpm=72"
echo -e "\n"

echo "=== Test 5: GET /health (после обновления heart-rate) ==="
curl -s http://localhost:8000/health
echo -e "\n"

echo "=== Test 6: PUT /health/sleep?hours=7.5 ==="
curl -s -X PUT "http://localhost:8000/health/sleep?hours=7.5"
echo -e "\n"

echo "=== Test 7: GET /health (после обновления sleep) ==="
curl -s http://localhost:8000/health
echo -e "\n"

echo "=== Test 8: POST /health (обновление нескольких метрик) ==="
curl -s -X POST http://localhost:8000/health \
  -H "Content-Type: application/json" \
  -d '{"steps": 8000, "heartRate": 75, "sleepHours": 8, "activeMinutes": 45}'
echo -e "\n"

echo "=== Test 9: Final GET /health ==="
curl -s http://localhost:8000/health
echo -e "\n"

echo "All tests completed!"
