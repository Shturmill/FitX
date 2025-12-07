import { useState } from 'react';
import { Plus, Coffee, Sun, Moon, Apple, ChevronRight, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  time: string;
}

interface MealSection {
  title: string;
  icon: React.ReactNode;
  meals: Meal[];
  totalCalories: number;
}

export function FoodDiary() {
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [mealData, setMealData] = useState<MealSection[]>([
    {
      title: 'Breakfast',
      icon: <Coffee className="size-5" />,
      totalCalories: 520,
      meals: [
        {
          id: '1',
          name: 'Oatmeal with Berries',
          calories: 320,
          protein: 12,
          carbs: 54,
          fats: 6,
          time: '8:30 AM',
        },
        {
          id: '2',
          name: 'Greek Yogurt',
          calories: 200,
          protein: 20,
          carbs: 15,
          fats: 8,
          time: '8:45 AM',
        },
      ],
    },
    {
      title: 'Lunch',
      icon: <Sun className="size-5" />,
      totalCalories: 680,
      meals: [
        {
          id: '3',
          name: 'Grilled Chicken Salad',
          calories: 450,
          protein: 42,
          carbs: 25,
          fats: 18,
          time: '1:00 PM',
        },
        {
          id: '4',
          name: 'Apple',
          calories: 95,
          protein: 0,
          carbs: 25,
          fats: 0,
          time: '1:30 PM',
        },
        {
          id: '5',
          name: 'Protein Shake',
          calories: 135,
          protein: 25,
          carbs: 8,
          fats: 2,
          time: '2:00 PM',
        },
      ],
    },
    {
      title: 'Dinner',
      icon: <Moon className="size-5" />,
      totalCalories: 0,
      meals: [],
    },
    {
      title: 'Snacks',
      icon: <Apple className="size-5" />,
      totalCalories: 180,
      meals: [
        {
          id: '6',
          name: 'Almonds',
          calories: 180,
          protein: 6,
          carbs: 6,
          fats: 15,
          time: '4:00 PM',
        },
      ],
    },
  ]);

  const totalCalories = mealData.reduce((acc, section) => acc + section.totalCalories, 0);
  const calorieGoal = 2000;
  const totalProtein = mealData
    .flatMap((s) => s.meals)
    .reduce((acc, meal) => acc + meal.protein, 0);
  const totalCarbs = mealData
    .flatMap((s) => s.meals)
    .reduce((acc, meal) => acc + meal.carbs, 0);
  const totalFats = mealData
    .flatMap((s) => s.meals)
    .reduce((acc, meal) => acc + meal.fats, 0);

  return (
    <div className="pb-20 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-gray-900">Food Diary</h1>
          <p className="text-gray-600 mt-1">Sunday, November 30</p>
        </div>
        <Dialog open={isAddingMeal} onOpenChange={setIsAddingMeal}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="size-4 mr-2" />
              Add Meal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Meal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="meal-name">Meal Name</Label>
                <Input id="meal-name" placeholder="e.g., Grilled Chicken" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="calories">Calories</Label>
                  <Input id="calories" type="number" placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input id="protein" type="number" placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input id="carbs" type="number" placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="fats">Fats (g)</Label>
                  <Input id="fats" type="number" placeholder="0" />
                </div>
              </div>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                Add to Diary
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Calorie Summary */}
      <Card className="bg-gradient-to-br from-indigo-600 to-purple-600 border-0 text-white">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="opacity-90">Calories Today</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl">{totalCalories}</span>
                <span className="text-xl opacity-75">/ {calorieGoal}</span>
              </div>
            </div>
            <Flame className="size-12 opacity-80" />
          </div>
          <Progress
            value={(totalCalories / calorieGoal) * 100}
            className="h-2 bg-white/20"
          />
          <p className="text-sm opacity-90 mt-2">
            {calorieGoal - totalCalories} calories remaining
          </p>
        </CardContent>
      </Card>

      {/* Macros */}
      <Card>
        <CardHeader>
          <CardTitle>Macronutrients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="size-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white mb-2">
                <span className="text-xl">{totalProtein}g</span>
              </div>
              <p className="text-gray-600">Protein</p>
              <Progress value={75} className="mt-2 h-1" />
            </div>
            <div className="text-center">
              <div className="size-16 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white mb-2">
                <span className="text-xl">{totalCarbs}g</span>
              </div>
              <p className="text-gray-600">Carbs</p>
              <Progress value={60} className="mt-2 h-1" />
            </div>
            <div className="text-center">
              <div className="size-16 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white mb-2">
                <span className="text-xl">{totalFats}g</span>
              </div>
              <p className="text-gray-600">Fats</p>
              <Progress value={65} className="mt-2 h-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meals */}
      {mealData.map((section, sectionIndex) => (
        <Card key={sectionIndex}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {section.icon}
                {section.title}
              </div>
              <span className="text-sm text-gray-600">{section.totalCalories} cal</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {section.meals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No meals logged yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => setIsAddingMeal(true)}
                >
                  <Plus className="size-4 mr-2" />
                  Add {section.title}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {section.meals.map((meal) => (
                  <div
                    key={meal.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <p className="text-gray-900">{meal.name}</p>
                      <p className="text-sm text-gray-600 mt-1">{meal.time}</p>
                      <div className="flex gap-3 mt-2 text-xs text-gray-600">
                        <span>P: {meal.protein}g</span>
                        <span>C: {meal.carbs}g</span>
                        <span>F: {meal.fats}g</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900">{meal.calories} cal</span>
                      <ChevronRight className="size-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Water Intake */}
      <Card>
        <CardHeader>
          <CardTitle>Water Intake</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-12 rounded-lg ${
                  i < 6
                    ? 'bg-gradient-to-br from-blue-400 to-cyan-500'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-gray-600 mt-3">6 / 8 glasses</p>
        </CardContent>
      </Card>
    </div>
  );
}
