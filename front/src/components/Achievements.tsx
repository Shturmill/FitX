import { Trophy, Lock, Star, TrendingUp, Zap, Target, Award, Flame, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  total?: number;
  date?: string;
  category: 'workout' | 'nutrition' | 'streak' | 'milestone';
  period?: 'daily' | 'weekly' | 'monthly';
}

export function Achievements() {
  // Daily Achievements
  const dailyAchievements: Achievement[] = [
    {
      id: 'd1',
      title: 'Daily Warrior',
      description: 'Complete today\'s workout',
      icon: '⚔️',
      unlocked: true,
      date: 'Today',
      category: 'workout',
      period: 'daily',
    },
    {
      id: 'd2',
      title: 'Hydration Hero',
      description: 'Drink 8 glasses of water today',
      icon: '💧',
      unlocked: false,
      progress: 6,
      total: 8,
      category: 'nutrition',
      period: 'daily',
    },
    {
      id: 'd3',
      title: 'Meal Tracker',
      description: 'Log all 3 meals today',
      icon: '🍽️',
      unlocked: false,
      progress: 2,
      total: 3,
      category: 'nutrition',
      period: 'daily',
    },
    {
      id: 'd4',
      title: 'Step Master',
      description: 'Reach 10,000 steps today',
      icon: '👟',
      unlocked: false,
      progress: 8542,
      total: 10000,
      category: 'workout',
      period: 'daily',
    },
  ];

  // Weekly Achievements
  const weeklyAchievements: Achievement[] = [
    {
      id: 'w1',
      title: 'Consistent Performer',
      description: 'Work out 4 times this week',
      icon: '💪',
      unlocked: true,
      date: 'This Week',
      category: 'workout',
      period: 'weekly',
    },
    {
      id: 'w2',
      title: 'Calorie Conscious',
      description: 'Stay within calorie goals for 5 days',
      icon: '🎯',
      unlocked: false,
      progress: 4,
      total: 5,
      category: 'nutrition',
      period: 'weekly',
    },
    {
      id: 'w3',
      title: 'Strength Builder',
      description: 'Complete 3 strength training sessions',
      icon: '🏋️',
      unlocked: false,
      progress: 2,
      total: 3,
      category: 'workout',
      period: 'weekly',
    },
    {
      id: 'w4',
      title: 'Cardio Champion',
      description: 'Complete 2 cardio sessions this week',
      icon: '🏃',
      unlocked: true,
      date: 'This Week',
      category: 'workout',
      period: 'weekly',
    },
  ];

  // Monthly Achievements
  const monthlyAchievements: Achievement[] = [
    {
      id: 'm1',
      title: 'Monthly Milestone',
      description: 'Complete 15 workouts this month',
      icon: '🏆',
      unlocked: false,
      progress: 12,
      total: 15,
      category: 'workout',
      period: 'monthly',
    },
    {
      id: 'm2',
      title: 'Nutrition Master',
      description: 'Log meals for 20 days this month',
      icon: '📊',
      unlocked: false,
      progress: 18,
      total: 20,
      category: 'nutrition',
      period: 'monthly',
    },
    {
      id: 'm3',
      title: 'Endurance Beast',
      description: 'Burn 5,000 calories this month',
      icon: '🔥',
      unlocked: false,
      progress: 4200,
      total: 5000,
      category: 'workout',
      period: 'monthly',
    },
    {
      id: 'm4',
      title: 'Dedicated Athlete',
      description: 'Maintain a 21-day streak',
      icon: '⭐',
      unlocked: false,
      progress: 7,
      total: 21,
      category: 'streak',
      period: 'monthly',
    },
  ];

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'First Step',
      description: 'Complete your first workout',
      icon: '🎯',
      unlocked: true,
      date: 'Nov 15, 2025',
      category: 'milestone',
    },
    {
      id: '2',
      title: '7 Day Streak',
      description: 'Work out 7 days in a row',
      icon: '🔥',
      unlocked: true,
      date: 'Nov 25, 2025',
      category: 'streak',
    },
    {
      id: '3',
      title: 'Early Bird',
      description: 'Complete 5 morning workouts',
      icon: '🌅',
      unlocked: true,
      date: 'Nov 20, 2025',
      category: 'workout',
    },
    {
      id: '4',
      title: 'Calorie Counter',
      description: 'Log meals for 7 consecutive days',
      icon: '📊',
      unlocked: true,
      date: 'Nov 28, 2025',
      category: 'nutrition',
    },
    {
      id: '5',
      title: 'Century Club',
      description: 'Burn 100 calories in a single workout',
      icon: '💯',
      unlocked: true,
      date: 'Nov 16, 2025',
      category: 'workout',
    },
    {
      id: '6',
      title: 'Iron Will',
      description: 'Complete 10 strength training sessions',
      icon: '💪',
      unlocked: false,
      progress: 8,
      total: 10,
      category: 'workout',
    },
    {
      id: '7',
      title: 'Hydration Hero',
      description: 'Drink 8 glasses of water for 5 days',
      icon: '💧',
      unlocked: false,
      progress: 3,
      total: 5,
      category: 'nutrition',
    },
    {
      id: '8',
      title: '30 Day Warrior',
      description: 'Maintain a 30-day streak',
      icon: '⚔️',
      unlocked: false,
      progress: 7,
      total: 30,
      category: 'streak',
    },
    {
      id: '9',
      title: 'Marathon Runner',
      description: 'Complete 100 workouts',
      icon: '🏃',
      unlocked: false,
      progress: 18,
      total: 100,
      category: 'milestone',
    },
    {
      id: '10',
      title: 'Protein Pro',
      description: 'Meet protein goals for 7 days',
      icon: '🥚',
      unlocked: false,
      progress: 4,
      total: 7,
      category: 'nutrition',
    },
    {
      id: '11',
      title: 'Speed Demon',
      description: 'Complete a workout in under 20 minutes',
      icon: '⚡',
      unlocked: false,
      progress: 0,
      total: 1,
      category: 'workout',
    },
    {
      id: '12',
      title: 'Goal Crusher',
      description: 'Achieve your weight goal',
      icon: '🎖️',
      unlocked: false,
      progress: 40,
      total: 100,
      category: 'milestone',
    },
  ];

  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const lockedAchievements = achievements.filter((a) => !a.unlocked);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'workout':
        return 'from-orange-400 to-red-500';
      case 'nutrition':
        return 'from-green-400 to-emerald-500';
      case 'streak':
        return 'from-yellow-400 to-orange-500';
      case 'milestone':
        return 'from-purple-400 to-pink-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const filterByCategory = (category: string) => {
    if (category === 'all') return achievements;
    return achievements.filter((a) => a.category === category);
  };

  const renderAchievementCard = (achievement: Achievement) => (
    <Card
      key={achievement.id}
      className={
        achievement.unlocked
          ? 'bg-gradient-to-r from-gray-50 to-white border-l-4 border-l-green-500'
          : 'opacity-75'
      }
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div
            className={`size-16 rounded-full ${
              achievement.unlocked
                ? `bg-gradient-to-br ${getCategoryColor(achievement.category)}`
                : 'bg-gray-200'
            } flex items-center justify-center text-2xl flex-shrink-0`}
          >
            {achievement.unlocked ? achievement.icon : <Lock className="size-6 text-gray-400" />}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-gray-900">{achievement.title}</h3>
              {achievement.unlocked ? (
                <Star className="size-5 text-yellow-500 fill-yellow-500" />
              ) : (
                <Badge variant="outline" className="text-xs">
                  {achievement.category}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
            {achievement.unlocked ? (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {achievement.category}
                </Badge>
                {achievement.date && (
                  <span className="text-xs text-gray-500">Unlocked on {achievement.date}</span>
                )}
              </div>
            ) : (
              achievement.progress !== undefined &&
              achievement.total !== undefined && (
                <div className="mt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="text-gray-900">
                      {achievement.progress}/{achievement.total}
                    </span>
                  </div>
                  <Progress value={(achievement.progress / achievement.total) * 100} className="h-2" />
                </div>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="pb-20 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900">Achievements</h1>
        <p className="text-gray-600 mt-1">Track your fitness journey milestones</p>
      </div>

      {/* Stats Overview */}
      <Card className="bg-gradient-to-br from-indigo-600 to-purple-600 border-0 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="opacity-90">Total Achievements</p>
              <p className="text-4xl mt-1">
                {unlockedAchievements.length}/{achievements.length}
              </p>
            </div>
            <Trophy className="size-16 opacity-80" />
          </div>
          <Progress
            value={(unlockedAchievements.length / achievements.length) * 100}
            className="h-2 bg-white/20"
          />
          <p className="text-sm opacity-90 mt-2">
            {achievements.length - unlockedAchievements.length} more to unlock
          </p>
        </CardContent>
      </Card>

      {/* Daily, Weekly, Monthly Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-5 text-indigo-600" />
            Time-Based Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="daily">
                <Calendar className="size-4 mr-2" />
                Daily
              </TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="space-y-3 mt-4">
              {dailyAchievements.map((achievement) => renderAchievementCard(achievement))}
            </TabsContent>

            <TabsContent value="weekly" className="space-y-3 mt-4">
              {weeklyAchievements.map((achievement) => renderAchievementCard(achievement))}
            </TabsContent>

            <TabsContent value="monthly" className="space-y-3 mt-4">
              {monthlyAchievements.map((achievement) => renderAchievementCard(achievement))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Achievement Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="size-12 mx-auto bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-xl mb-2">
              💪
            </div>
            <p className="text-gray-900">
              {achievements.filter((a) => a.category === 'workout' && a.unlocked).length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Workouts</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="size-12 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-xl mb-2">
              🥗
            </div>
            <p className="text-gray-900">
              {achievements.filter((a) => a.category === 'nutrition' && a.unlocked).length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Nutrition</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="size-12 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-xl mb-2">
              🔥
            </div>
            <p className="text-gray-900">
              {achievements.filter((a) => a.category === 'streak' && a.unlocked).length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Streaks</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="size-12 mx-auto bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-xl mb-2">
              🏆
            </div>
            <p className="text-gray-900">
              {achievements.filter((a) => a.category === 'milestone' && a.unlocked).length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Milestones</p>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Tabs */}
      <Tabs defaultValue="unlocked" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="unlocked">
            Unlocked ({unlockedAchievements.length})
          </TabsTrigger>
          <TabsTrigger value="locked">
            Locked ({lockedAchievements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unlocked" className="space-y-4 mt-6">
          {unlockedAchievements.map((achievement) => (
            <Card
              key={achievement.id}
              className="bg-gradient-to-r from-gray-50 to-white border-l-4 border-l-green-500"
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`size-16 rounded-full bg-gradient-to-br ${getCategoryColor(
                      achievement.category
                    )} flex items-center justify-center text-2xl flex-shrink-0`}
                  >
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-gray-900">{achievement.title}</h3>
                      <Star className="size-5 text-yellow-500 fill-yellow-500" />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {achievement.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {achievement.category}
                      </Badge>
                      {achievement.date && (
                        <span className="text-xs text-gray-500">
                          Unlocked on {achievement.date}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="locked" className="space-y-4 mt-6">
          {lockedAchievements.map((achievement) => (
            <Card key={achievement.id} className="opacity-75">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="size-16 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <Lock className="size-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-gray-900">{achievement.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {achievement.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {achievement.description}
                    </p>
                    {achievement.progress !== undefined &&
                      achievement.total !== undefined && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="text-gray-900">
                              {achievement.progress}/{achievement.total}
                            </span>
                          </div>
                          <Progress
                            value={(achievement.progress / achievement.total) * 100}
                            className="h-2"
                          />
                        </div>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Motivation Card */}
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="size-6 text-orange-600" />
            <h3 className="text-gray-900">Keep Going!</h3>
          </div>
          <p className="text-gray-600 mb-4">
            You're making great progress! Complete 2 more strength training sessions to
            unlock the "Iron Will" achievement.
          </p>
          <div className="bg-white rounded-lg p-3 border border-orange-200">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Next Achievement</span>
              <span className="text-gray-900">80% Complete</span>
            </div>
            <Progress value={80} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}