import { useState } from 'react';
import { Flame, Droplets, Activity, TrendingUp, Send, Sparkles, Heart, Brain, Moon, Zap, Target, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Progress } from './ui/progress';

export function Dashboard() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m your AI fitness coach. How can I help you today?',
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = { role: 'user', content: inputValue };
    setMessages([...messages, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'Great question! Based on your goals, I recommend focusing on consistency.',
        'That\'s a smart approach! Let me help you optimize your routine.',
        'I\'ve analyzed your progress, and you\'re doing great! Keep it up!',
        'Here\'s a personalized tip: Try to increase your protein intake by 20g.',
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: randomResponse },
      ]);
    }, 1000);

    setInputValue('');
  };

  return (
    <div className="pb-20 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-gray-900">Welcome Back!</h1>
          <p className="text-gray-600 mt-1">Let's crush your goals today</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full size-12 flex items-center justify-center">
          <span className="text-white">JD</span>
        </div>
      </div>

      {/* AI Assistant Chat - Moved to Top */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-indigo-600" />
            AI Fitness Coach
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Ask me anything about fitness..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} className="bg-indigo-600 hover:bg-indigo-700">
              <Send className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Calorie Tracker - Bigger and More Attractive */}
      <Card className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 border-0 text-white shadow-xl">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Flame className="size-10" />
                <span className="text-sm opacity-90">Calories Today</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl">1,847</span>
                <span className="text-2xl opacity-75">/ 2,400</span>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 text-center">
              <p className="text-3xl">553</p>
              <p className="text-xs opacity-90 mt-1">Remaining</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <Progress value={77} className="h-3 bg-white/20" />
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <p className="text-2xl">2,150</p>
                <p className="text-xs opacity-90 mt-1">Consumed</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <p className="text-2xl">303</p>
                <p className="text-xs opacity-90 mt-1">Burned</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <p className="text-2xl">77%</p>
                <p className="text-xs opacity-90 mt-1">Goal Met</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 border-0 text-white">
          <CardContent className="pt-6">
            <Droplets className="size-8 mb-2" />
            <p className="text-3xl">6/8</p>
            <p className="text-sm opacity-90">Water Glasses</p>
            <Progress value={75} className="mt-3 bg-white/20 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-emerald-500 border-0 text-white">
          <CardContent className="pt-6">
            <Activity className="size-8 mb-2" />
            <p className="text-3xl">8,542</p>
            <p className="text-sm opacity-90">Steps</p>
            <Progress value={85} className="mt-3 bg-white/20 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-pink-500 border-0 text-white">
          <CardContent className="pt-6">
            <TrendingUp className="size-8 mb-2" />
            <p className="text-3xl">45 min</p>
            <p className="text-sm opacity-90">Active Time</p>
            <Progress value={60} className="mt-3 bg-white/20 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Health Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="size-5 text-red-500" />
            Health Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border border-red-100">
              <Heart className="size-8 text-red-500 mb-2" />
              <p className="text-2xl text-gray-900">72 bpm</p>
              <p className="text-sm text-gray-600 mt-1">Heart Rate</p>
              <p className="text-xs text-green-600 mt-1">Normal</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
              <Moon className="size-8 text-purple-500 mb-2" />
              <p className="text-2xl text-gray-900">7.5 hrs</p>
              <p className="text-sm text-gray-600 mt-1">Sleep</p>
              <p className="text-xs text-green-600 mt-1">Good</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-100">
              <Zap className="size-8 text-orange-500 mb-2" />
              <p className="text-2xl text-gray-900">85%</p>
              <p className="text-sm text-gray-600 mt-1">Energy</p>
              <p className="text-xs text-green-600 mt-1">High</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
              <Brain className="size-8 text-blue-500 mb-2" />
              <p className="text-2xl text-gray-900">92%</p>
              <p className="text-sm text-gray-600 mt-1">Focus</p>
              <p className="text-xs text-green-600 mt-1">Excellent</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="size-5 text-indigo-600" />
            Weekly Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white">
                  <Flame className="size-6" />
                </div>
                <div>
                  <p className="text-gray-900">Calories Burned</p>
                  <p className="text-sm text-gray-600">This week</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl text-gray-900">2,150</p>
                <p className="text-xs text-green-600">+15% vs last week</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white">
                  <Activity className="size-6" />
                </div>
                <div>
                  <p className="text-gray-900">Workouts Completed</p>
                  <p className="text-sm text-gray-600">This week</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl text-gray-900">4/5</p>
                <p className="text-xs text-orange-600">1 more to goal</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white">
                  <Target className="size-6" />
                </div>
                <div>
                  <p className="text-gray-900">Weekly Streak</p>
                  <p className="text-sm text-gray-600">Consecutive days</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl text-gray-900">7 days</p>
                <p className="text-xs text-green-600">Personal best!</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" className="h-20 flex-col">
            <Activity className="size-5 mb-1" />
            Log Workout
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <Flame className="size-5 mb-1" />
            Add Meal
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <Droplets className="size-5 mb-1" />
            Track Water
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <TrendingUp className="size-5 mb-1" />
            View Stats
          </Button>
        </CardContent>
      </Card>

      {/* Today's Goal */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Complete morning workout</span>
              <span className="text-green-600">✓ Done</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Drink 8 glasses of water</span>
              <span className="text-indigo-600">6/8</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Log all meals</span>
              <span className="text-orange-600">2/3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Reach 10,000 steps</span>
              <span className="text-indigo-600">8,542</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}