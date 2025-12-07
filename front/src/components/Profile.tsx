import { Edit, Target, TrendingUp, Award, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback } from './ui/avatar';

export function Profile() {
  return (
    <div className="pb-20 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-indigo-600 to-purple-600 border-0 text-white">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="size-20 border-4 border-white/20">
                <AvatarFallback className="bg-white text-indigo-600 text-xl">
                  JD
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl">John Doe</h2>
                <p className="opacity-90">Fitness Enthusiast</p>
                <p className="text-sm opacity-75 mt-1">Member since Jan 2025</p>
              </div>
            </div>
            <Button variant="ghost" className="text-white hover:bg-white/20">
              <Edit className="size-4" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl">68 kg</p>
              <p className="text-sm opacity-90">Weight</p>
            </div>
            <div className="text-center">
              <p className="text-2xl">175 cm</p>
              <p className="text-sm opacity-90">Height</p>
            </div>
            <div className="text-center">
              <p className="text-2xl">23.5</p>
              <p className="text-sm opacity-90">BMI</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Goal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="size-5 text-indigo-600" />
            Current Goal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Lose Weight</span>
                <span className="text-gray-900">68 kg → 65 kg</span>
              </div>
              <Progress value={40} className="h-2" />
              <p className="text-sm text-gray-600 mt-2">40% Complete • 1.2 kg lost</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="size-4" />
              <span>Target date: March 15, 2025</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-5 text-indigo-600" />
            Monthly Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-gray-600">Workouts</p>
              <p className="text-2xl text-gray-900 mt-1">18</p>
              <p className="text-sm text-green-600 mt-1">+3 from last month</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-gray-600">Active Days</p>
              <p className="text-2xl text-gray-900 mt-1">22</p>
              <p className="text-sm text-green-600 mt-1">+5 from last month</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-gray-600">Avg. Calories</p>
              <p className="text-2xl text-gray-900 mt-1">1,850</p>
              <p className="text-sm text-gray-600 mt-1">Daily average</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-gray-600">Active Time</p>
              <p className="text-2xl text-gray-900 mt-1">42 hrs</p>
              <p className="text-sm text-green-600 mt-1">+8 hrs from last month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="size-5 text-indigo-600" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
              <div className="size-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xl">
                🔥
              </div>
              <div>
                <p className="text-gray-900">7 Day Streak</p>
                <p className="text-sm text-gray-600">Completed workouts 7 days in a row</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
              <div className="size-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-xl">
                💪
              </div>
              <div>
                <p className="text-gray-900">First 10K</p>
                <p className="text-sm text-gray-600">Reached 10,000 steps milestone</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <div className="size-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-xl">
                🎯
              </div>
              <div>
                <p className="text-gray-900">Goal Achiever</p>
                <p className="text-sm text-gray-600">Met weekly calorie goals</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Age</span>
              <span className="text-gray-900">28 years</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Gender</span>
              <span className="text-gray-900">Male</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Activity Level</span>
              <span className="text-gray-900">Moderately Active</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Goal Type</span>
              <span className="text-gray-900">Weight Loss</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="h-12">
          Edit Profile
        </Button>
        <Button variant="outline" className="h-12">
          Settings
        </Button>
      </div>
    </div>
  );
}
