import { useState } from 'react';
import {
  Dumbbell,
  Play,
  Clock,
  Flame,
  CheckCircle2,
  ChevronRight,
  Calendar,
  TrendingUp,
  Video,
  X,
  Maximize2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  completed: boolean;
}

interface Workout {
  id: string;
  name: string;
  duration: string;
  calories: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  exercises: Exercise[];
}

export function Training() {
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [videoExercise, setVideoExercise] = useState<string | null>(null);
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);

  const workoutPlans: Workout[] = [
    {
      id: '1',
      name: 'Upper Body Strength',
      duration: '45 min',
      calories: '320',
      difficulty: 'Intermediate',
      category: 'Strength',
      exercises: [
        { name: 'Bench Press', sets: '4', reps: '8-10', completed: false },
        { name: 'Dumbbell Rows', sets: '4', reps: '10-12', completed: false },
        { name: 'Shoulder Press', sets: '3', reps: '10', completed: false },
        { name: 'Bicep Curls', sets: '3', reps: '12', completed: false },
        { name: 'Tricep Dips', sets: '3', reps: '12', completed: false },
      ],
    },
    {
      id: '2',
      name: 'HIIT Cardio Blast',
      duration: '30 min',
      calories: '450',
      difficulty: 'Advanced',
      category: 'Cardio',
      exercises: [
        { name: 'Burpees', sets: '4', reps: '15', completed: false },
        { name: 'Mountain Climbers', sets: '4', reps: '20', completed: false },
        { name: 'Jump Squats', sets: '4', reps: '15', completed: false },
        { name: 'High Knees', sets: '4', reps: '30 sec', completed: false },
      ],
    },
    {
      id: '3',
      name: 'Lower Body Power',
      duration: '50 min',
      calories: '380',
      difficulty: 'Intermediate',
      category: 'Strength',
      exercises: [
        { name: 'Squats', sets: '4', reps: '10', completed: false },
        { name: 'Deadlifts', sets: '4', reps: '8', completed: false },
        { name: 'Lunges', sets: '3', reps: '12 each', completed: false },
        { name: 'Leg Press', sets: '3', reps: '12', completed: false },
        { name: 'Calf Raises', sets: '3', reps: '15', completed: false },
      ],
    },
    {
      id: '4',
      name: 'Core & Abs',
      duration: '25 min',
      calories: '180',
      difficulty: 'Beginner',
      category: 'Core',
      exercises: [
        { name: 'Plank', sets: '3', reps: '60 sec', completed: false },
        { name: 'Crunches', sets: '3', reps: '20', completed: false },
        { name: 'Russian Twists', sets: '3', reps: '20', completed: false },
        { name: 'Leg Raises', sets: '3', reps: '15', completed: false },
      ],
    },
  ];

  const workoutHistory = [
    {
      date: 'Today, 7:30 AM',
      name: 'Upper Body Strength',
      duration: '42 min',
      calories: '305',
    },
    {
      date: 'Yesterday, 6:00 PM',
      name: 'HIIT Cardio Blast',
      duration: '28 min',
      calories: '420',
    },
    {
      date: 'Nov 28, 7:00 AM',
      name: 'Lower Body Power',
      duration: '48 min',
      calories: '365',
    },
    {
      date: 'Nov 27, 6:30 PM',
      name: 'Core & Abs',
      duration: '25 min',
      calories: '180',
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-700';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'Advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="pb-20 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900">Training</h1>
        <p className="text-gray-600 mt-1">Choose your workout and start training</p>
      </div>

      {/* Weekly Progress */}
      <Card className="bg-gradient-to-br from-indigo-600 to-purple-600 border-0 text-white">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="opacity-90">This Week</p>
              <p className="text-3xl mt-1">4 Workouts</p>
              <p className="text-sm opacity-75 mt-1">180 min • 1,270 calories burned</p>
            </div>
            <TrendingUp className="size-10 opacity-80" />
          </div>
          <div className="flex gap-2 mt-4">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full ${
                  i < 4 ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="plans">Workout Plans</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4 mt-6">
          {workoutPlans.map((workout) => (
            <Card
              key={workout.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedWorkout(workout)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-gray-900">{workout.name}</h3>
                      <Badge className={getDifficultyColor(workout.difficulty)}>
                        {workout.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{workout.category}</p>
                  </div>
                  <ChevronRight className="size-5 text-gray-400" />
                </div>

                <div className="flex gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="size-4" />
                    {workout.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="size-4" />
                    {workout.calories} cal
                  </div>
                  <div className="flex items-center gap-1">
                    <Dumbbell className="size-4" />
                    {workout.exercises.length} exercises
                  </div>
                </div>

                <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700">
                  <Play className="size-4 mr-2" />
                  Start Workout
                </Button>
              </CardContent>
            </Card>
          ))}

          {/* Custom Workout */}
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-dashed border-2">
            <CardContent className="pt-6 text-center">
              <Dumbbell className="size-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-gray-900 mb-2">Create Custom Workout</h3>
              <p className="text-sm text-gray-600 mb-4">
                Build your own workout routine
              </p>
              <Button variant="outline">
                <Play className="size-4 mr-2" />
                Get Started
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-4 mb-2">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl text-gray-900">18</p>
                <p className="text-sm text-gray-600 mt-1">Workouts</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl text-gray-900">12.5</p>
                <p className="text-sm text-gray-600 mt-1">Hours</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl text-gray-900">5.2K</p>
                <p className="text-sm text-gray-600 mt-1">Calories</p>
              </CardContent>
            </Card>
          </div>

          {/* History List */}
          {workoutHistory.map((workout, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                      <CheckCircle2 className="size-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-gray-900">{workout.name}</h3>
                      <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                        <Calendar className="size-3" />
                        {workout.date}
                      </p>
                      <div className="flex gap-3 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {workout.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Flame className="size-3" />
                          {workout.calories} cal
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="size-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Workout Details Modal */}
      {selectedWorkout && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setSelectedWorkout(null)}
        >
          <Card
            className="w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedWorkout.name}</span>
                <Badge className={getDifficultyColor(selectedWorkout.difficulty)}>
                  {selectedWorkout.difficulty}
                </Badge>
              </CardTitle>
              <div className="flex gap-4 text-sm text-gray-600 mt-2">
                <div className="flex items-center gap-1">
                  <Clock className="size-4" />
                  {selectedWorkout.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Flame className="size-4" />
                  {selectedWorkout.calories} cal
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <h4 className="text-gray-900 mb-3">Exercises</h4>
              {selectedWorkout.exercises.map((exercise, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-gray-900">{exercise.name}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {exercise.sets} sets × {exercise.reps} reps
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVideoExercise(exercise.name)}
                    className="ml-3"
                  >
                    <Video className="size-4 mr-2" />
                    Demo
                  </Button>
                </div>
              ))}
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 mt-4"
                onClick={() => setSelectedWorkout(null)}
              >
                <Play className="size-4 mr-2" />
                Start This Workout
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Exercise Video Modal */}
      {videoExercise && (
        <div
          className={`fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 ${
            isVideoFullscreen ? '' : ''
          }`}
          onClick={() => {
            setVideoExercise(null);
            setIsVideoFullscreen(false);
          }}
        >
          <div
            className={`bg-white rounded-lg overflow-hidden ${
              isVideoFullscreen ? 'w-full h-full' : 'w-full max-w-4xl'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Video Header */}
            <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
              <h3>{videoExercise}</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={() => setIsVideoFullscreen(!isVideoFullscreen)}
                >
                  <Maximize2 className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={() => {
                    setVideoExercise(null);
                    setIsVideoFullscreen(false);
                  }}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            {/* Video Player Placeholder */}
            <div
              className={`bg-gray-900 flex items-center justify-center ${
                isVideoFullscreen ? 'h-[calc(100%-120px)]' : 'aspect-video'
              }`}
            >
              <div className="text-center text-white">
                <Play className="size-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl mb-2">{videoExercise} Tutorial</p>
                <p className="text-sm text-gray-400">Video demonstration would play here</p>
              </div>
            </div>

            {/* Video Info */}
            <div className="p-4 bg-white">
              <h4 className="text-gray-900 mb-2">How to perform {videoExercise}</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>1. Start in the proper position with correct form</p>
                <p>2. Engage your core and maintain proper posture</p>
                <p>3. Perform the movement with controlled motion</p>
                <p>4. Return to starting position and repeat</p>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Tip:</strong> Focus on proper form rather than speed or weight
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}