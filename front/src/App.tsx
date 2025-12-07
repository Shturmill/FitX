import { useState } from 'react';
import { Home, User, BookOpen, Dumbbell, Trophy } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Profile } from './components/Profile';
import { FoodDiary } from './components/FoodDiary';
import { Training } from './components/Training';
import { Achievements } from './components/Achievements';

type Page = 'dashboard' | 'profile' | 'diary' | 'training' | 'achievements';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'profile':
        return <Profile />;
      case 'diary':
        return <FoodDiary />;
      case 'training':
        return <Training />;
      case 'achievements':
        return <Achievements />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {renderPage()}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-around items-center h-16">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                currentPage === 'dashboard'
                  ? 'text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Home className="size-6" />
              <span className="text-xs mt-1">Home</span>
            </button>

            <button
              onClick={() => setCurrentPage('diary')}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                currentPage === 'diary'
                  ? 'text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BookOpen className="size-6" />
              <span className="text-xs mt-1">Diary</span>
            </button>

            <button
              onClick={() => setCurrentPage('training')}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                currentPage === 'training'
                  ? 'text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Dumbbell className="size-6" />
              <span className="text-xs mt-1">Training</span>
            </button>

            <button
              onClick={() => setCurrentPage('achievements')}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                currentPage === 'achievements'
                  ? 'text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Trophy className="size-6" />
              <span className="text-xs mt-1">Awards</span>
            </button>

            <button
              onClick={() => setCurrentPage('profile')}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                currentPage === 'profile'
                  ? 'text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="size-6" />
              <span className="text-xs mt-1">Profile</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
