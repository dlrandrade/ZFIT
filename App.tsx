
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Calendar from './components/Calendar';
import TrainingCard from './components/TrainingCard';
import WeeklyStats from './components/WeeklyStats';
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import Feed from './components/Feed';
import StatsPage from './components/StatsPage';
import ProfilePage from './components/ProfilePage';
import BlogPage from './components/BlogPage';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import StartWorkoutDrawer from './components/StartWorkoutDrawer';
import WorkoutExecution from './components/WorkoutExecution';
import CreateWorkout from './components/CreateWorkout';
import RoutinesPage from './components/RoutinesPage';
import { ArrowRight, BookOpen } from 'lucide-react';
import { THEMES, INITIAL_DAILY_STATS, getCalendarDays, MOCK_BLOG } from './constants';
import { DailyStats, Workout, Exercise, SocialPost, User, BlogArticle } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('zfit_auth') === 'true';
  });
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('zfit_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentTheme, setCurrentTheme] = useState<'dark' | 'mint'>('dark');
  const [currentPage, setCurrentPage] = useState<'home' | 'feed' | 'stats' | 'profile' | 'executing' | 'creating' | 'admin' | 'blog' | 'routines'>('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const [dailyStats, setDailyStats] = useState<DailyStats>(() => {
    const saved = localStorage.getItem('zfit_daily_stats');
    return saved ? JSON.parse(saved) : INITIAL_DAILY_STATS;
  });

  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(() => {
    const saved = localStorage.getItem('zfit_active_workout');
    return saved ? JSON.parse(saved) : null;
  });

  const [workoutHistory, setWorkoutHistory] = useState<Workout[]>(() => {
    const saved = localStorage.getItem('zfit_workout_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [socialFeed, setSocialFeed] = useState<SocialPost[]>(() => {
    const saved = localStorage.getItem('zfit_social_feed');
    return saved ? JSON.parse(saved) : [];
  });

  const [userRoutines, setUserRoutines] = useState<Workout[]>(() => {
    const saved = localStorage.getItem('zfit_user_routines');
    return saved ? JSON.parse(saved) : [];
  });

  const [blogArticles, setBlogArticles] = useState<BlogArticle[]>(() => {
    const saved = localStorage.getItem('zfit_admin_articles');
    return saved ? JSON.parse(saved) : MOCK_BLOG;
  });
  
  const [calendarDays] = useState(getCalendarDays());

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('zfit_auth', 'true');
      localStorage.setItem('zfit_daily_stats', JSON.stringify(dailyStats));
      localStorage.setItem('zfit_active_workout', JSON.stringify(activeWorkout));
      localStorage.setItem('zfit_workout_history', JSON.stringify(workoutHistory));
      localStorage.setItem('zfit_social_feed', JSON.stringify(socialFeed));
      localStorage.setItem('zfit_user_routines', JSON.stringify(userRoutines));
      if (user) localStorage.setItem('zfit_user', JSON.stringify(user));
    }
  }, [isAuthenticated, dailyStats, activeWorkout, workoutHistory, socialFeed, user, userRoutines]);

  const theme = THEMES[currentTheme];

  const handleLogin = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('zfit_auth');
    setCurrentPage('home');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const handleStartWorkout = () => {
    if (activeWorkout) {
      setCurrentPage('executing');
    } else {
      setIsDrawerOpen(true);
    }
  };

  const handleStartRoutine = (routine: Workout) => {
    const startedWorkout = {
      ...routine,
      id: Date.now().toString(),
      exercises: routine.exercises.map(ex => ({
        ...ex,
        id: `ex-${Math.random()}`,
        sets: ex.sets.map(s => ({ ...s, completed: false }))
      }))
    };
    setActiveWorkout(startedWorkout);
    setCurrentPage('executing');
  };

  const handleCompleteWorkout = () => {
    if (activeWorkout) {
      const now = new Date();
      const completedWorkout = { ...activeWorkout, completedAt: now.toISOString() };
      setWorkoutHistory(prev => [completedWorkout, ...prev]);

      // Calcular calorias fictícias e progresso
      const caloriesEarned = 150 + (activeWorkout.exercises.length * 50);
      
      setDailyStats(prev => ({
        ...prev,
        caloriesBurned: prev.caloriesBurned + caloriesEarned,
        workoutProgress: 100
      }));

      // Criar post no social feed
      if (user) {
        const newPost: SocialPost = {
          id: `post-${Date.now()}`,
          user: user,
          workoutTitle: activeWorkout.title,
          intensity: 85 + Math.floor(Math.random() * 15),
          calories: `${caloriesEarned} kcal`,
          duration: '45 min',
          timestamp: 'Agora',
          likes: 0,
          commentsCount: 0,
          hasLiked: false
        };
        setSocialFeed(prev => [newPost, ...prev]);
      }

      setActiveWorkout(null);
      setCurrentPage('home');
    }
  };

  const handleDeleteRoutine = (id: string) => {
    if (confirm('Deseja excluir esta rotina?')) {
      setUserRoutines(prev => prev.filter(r => r.id !== id));
    }
  };

  const renderHome = () => {
    const latestArticle = blogArticles[0] || MOCK_BLOG[0];
    const isMint = theme.name === 'ZFIT Mint';
    const depthClass = isMint ? 'premium-depth-light' : 'premium-depth-dark';
    
    return (
      <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-4xl mx-auto pb-12">
        <Calendar days={calendarDays} primaryColor={theme.primary} theme={theme} />

        <div className="px-4 md:px-6 mb-6 space-y-4 md:space-y-6">
          {/* Card Principal de Treino */}
          <TrainingCard 
            isMain={true} 
            theme={theme}
            data={{
              title: activeWorkout ? activeWorkout.title : "Nenhum treino ativo",
              value: `${dailyStats.workoutProgress}%`,
              subtitle: activeWorkout ? "Sessão em andamento" : "Toque no Play para começar",
              chartData: [15, 30, 45, 25, dailyStats.workoutProgress || 5, 0, 0]
            }}
            onClick={activeWorkout ? () => setCurrentPage('executing') : handleStartWorkout}
          />

          {/* Destaque do Blog Refinado */}
          <div 
            onClick={() => setCurrentPage('blog')}
            className={`rounded-[40px] p-6 md:p-8 border cursor-pointer group relative overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99] ${depthClass}`}
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <div className="flex justify-between items-center mb-6">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center border" style={{ backgroundColor: theme.cardSecondary, borderColor: theme.border, color: theme.primary }}>
                    <BookOpen size={18} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40" style={{ color: theme.text }}>Blog em Destaque</span>
               </div>
               <div className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border" style={{ color: theme.primary, borderColor: theme.border }}>
                 <ArrowRight size={14} />
               </div>
            </div>
            
            <div className="space-y-6">
               <div className="max-w-md">
                 <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-[1.1] mb-3" style={{ color: theme.text }}>
                   {latestArticle.title}
                 </h3>
                 <p className="text-[10px] md:text-[11px] font-medium leading-relaxed opacity-50 line-clamp-2" style={{ color: theme.text }}>
                   {latestArticle.excerpt}
                 </p>
               </div>
               
               <div className="w-full h-48 md:h-56 rounded-[30px] overflow-hidden border relative group" style={{ borderColor: theme.border }}>
                  <img src={latestArticle.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                     <span className="text-white text-[10px] font-black uppercase tracking-widest">Ler artigo completo</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Grid de Cards de Métricas */}
          <div className="grid grid-cols-2 gap-4">
            <TrainingCard 
              isMain={false} 
              theme={theme}
              onClick={() => setDailyStats(prev => ({...prev, waterIntake: Math.min(prev.waterIntake + 250, 5000)}))}
              data={{
                title: "Hidratação",
                value: `${(dailyStats.waterIntake / 1000).toFixed(1)}L`,
                subtitle: `Meta: ${(dailyStats.waterGoal / 1000).toFixed(1)}L`,
                progress: (dailyStats.waterIntake / dailyStats.waterGoal) * 100
              }}
            />
            
            <div 
              className={`rounded-[30px] p-5 md:p-6 border flex flex-col justify-between ${depthClass}`}
              style={{ backgroundColor: theme.card, color: theme.text, borderColor: theme.border }}
            >
              <div>
                <span className="opacity-40 text-[8px] md:text-[10px] uppercase font-black tracking-widest block mb-2">Esforço</span>
                <h3 className="text-xl md:text-2xl font-black tracking-tighter">{dailyStats.caloriesBurned} kcal</h3>
              </div>
              <div className="flex items-end space-x-1.5 h-6 md:h-8 mt-4">
                {[30, 50, 20, 70, Math.min(dailyStats.caloriesBurned / 20, 40), 10, 5].map((h, i) => (
                  <div key={i} style={{ height: `${h}%`, backgroundColor: i === 4 ? theme.primary : theme.cardSecondary }} className="flex-1 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <WeeklyStats primaryColor={theme.primary} progress={dailyStats.workoutProgress} theme={theme} />
      </div>
    );
  }

  const isFullscreenPage = currentPage === 'executing' || currentPage === 'creating';

  return (
    <div 
      className={`min-h-screen transition-colors duration-700 selection:bg-[#adf94e] selection:text-black`}
      style={{ backgroundColor: theme.bg, color: theme.text }}
    >
      <div className="fixed -top-40 -right-40 w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full blur-[120px] pointer-events-none transition-all duration-1000 opacity-20 z-0" style={{ backgroundColor: theme.primary }} />
      
      <div className="flex min-h-screen">
        {!isFullscreenPage && (
          <Sidebar 
            activePage={currentPage as any} 
            onPageChange={(p) => setCurrentPage(p as any)} 
            onStartWorkout={handleStartWorkout}
            theme={theme}
            onLogout={handleLogout}
            isAdmin={user?.role === 'admin'}
          />
        )}

        <div className={`flex-1 flex flex-col ${!isFullscreenPage ? 'lg:pl-72' : ''}`}>
          {!isFullscreenPage && (
            <Header onToggleTheme={() => setCurrentTheme(prev => prev === 'dark' ? 'mint' : 'dark')} isDark={currentTheme === 'dark'} />
          )}
          
          <main className={`relative z-10 flex-1 ${!isFullscreenPage ? 'w-full pb-32 lg:pb-12' : ''}`}>
            {currentPage === 'executing' && activeWorkout ? <WorkoutExecution workout={activeWorkout} onUpdate={setActiveWorkout} onComplete={handleCompleteWorkout} onBack={() => setCurrentPage('home')} primaryColor={theme.primary} /> :
             currentPage === 'creating' ? <CreateWorkout onBack={() => setCurrentPage('home')} onStart={(exercises, title, saveAsRoutine) => {
               // Fix: explicitly type muscleGroups as string[] using type assertion to avoid unknown[] inference error.
               const newW: Workout = { 
                 id: Date.now().toString(), 
                 title: title || "Personalizado", 
                 muscleGroups: Array.from(new Set(exercises.map(e => e.muscleGroup))) as string[], 
                 exercises 
               };
               if (saveAsRoutine) setUserRoutines(p => [newW, ...p]);
               handleStartRoutine(newW);
             }} /> :
             currentPage === 'feed' ? <Feed theme={theme} posts={socialFeed} onUpdatePosts={setSocialFeed} primaryColor={theme.primary} /> :
             currentPage === 'stats' ? <StatsPage primaryColor={theme.primary} history={workoutHistory} /> :
             currentPage === 'profile' ? <ProfilePage theme={theme} user={user} onUpdateUser={setUser} history={workoutHistory} onLogout={handleLogout} /> :
             currentPage === 'admin' ? <AdminDashboard theme={theme} /> :
             currentPage === 'blog' ? <BlogPage articles={blogArticles} theme={theme} onBack={() => setCurrentPage('home')} /> :
             currentPage === 'routines' ? <RoutinesPage routines={userRoutines} theme={theme} onBack={() => setCurrentPage('home')} onStartRoutine={handleStartRoutine} onDeleteRoutine={handleDeleteRoutine} /> :
             renderHome()}
          </main>
        </div>
      </div>

      {!isFullscreenPage && (
        <div className="lg:hidden">
          <BottomNav 
            activePage={currentPage as any} 
            onPageChange={(p) => setCurrentPage(p as any)} 
            onStartWorkout={handleStartWorkout} 
            primaryColor={theme.primary}
          />
        </div>
      )}
      
      <StartWorkoutDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onStartNew={() => { setCurrentPage('creating'); setIsDrawerOpen(false); }} 
        onManageRoutines={() => { setCurrentPage('routines'); setIsDrawerOpen(false); }}
        onStartRoutine={handleStartRoutine}
        routines={userRoutines}
      />
    </div>
  );
};

export default App;
