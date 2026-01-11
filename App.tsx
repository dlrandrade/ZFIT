
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
import { db } from './services/database';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('zfit_auth') === 'true';
  });
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [currentTheme, setCurrentTheme] = useState<'dark' | 'mint'>('dark');
  const [currentPage, setCurrentPage] = useState<'home' | 'feed' | 'stats' | 'profile' | 'executing' | 'creating' | 'admin' | 'blog' | 'routines'>('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const [dailyStats, setDailyStats] = useState<DailyStats>(INITIAL_DAILY_STATS);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<Workout[]>([]);
  const [socialFeed, setSocialFeed] = useState<SocialPost[]>([]);
  const [userRoutines, setUserRoutines] = useState<Workout[]>([]);
  const [blogArticles, setBlogArticles] = useState<BlogArticle[]>(MOCK_BLOG);
  
  const [calendarDays] = useState(getCalendarDays());

  // Carregar dados do usuário logado
  useEffect(() => {
    const initApp = async () => {
      if (isAuthenticated) {
        try {
          const currentUser = await db.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } catch (e) {
          console.error("Erro na inicialização:", e);
        }
      }
      setLoadingAuth(false);
    };
    initApp();
  }, [isAuthenticated]);

  // Carregamento de dados após confirmação de login
  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated && user) {
        try {
          const history = await db.getWorkoutHistory();
          const feed = await db.getSocialFeed();
          const stats = await db.getDailyStats();
          const articles = await db.getBlogArticles();
          
          setWorkoutHistory(history);
          setSocialFeed(feed);
          setDailyStats(stats || INITIAL_DAILY_STATS);
          if (articles.length > 0) setBlogArticles(articles);
          
          const savedRoutines = localStorage.getItem('zfit_user_routines');
          if (savedRoutines) setUserRoutines(JSON.parse(savedRoutines));

          const savedActive = localStorage.getItem('zfit_active_workout');
          if (savedActive) setActiveWorkout(JSON.parse(savedActive));
        } catch (e) {
          console.error("Erro ao carregar dados:", e);
        }
      }
    };
    loadData();
  }, [isAuthenticated, user]);

  // Sincronização de efeitos
  useEffect(() => {
    if (isAuthenticated && user) {
      db.updateDailyStats(dailyStats);
      if (activeWorkout) localStorage.setItem('zfit_active_workout', JSON.stringify(activeWorkout));
      else localStorage.removeItem('zfit_active_workout');
      localStorage.setItem('zfit_user_routines', JSON.stringify(userRoutines));
    }
  }, [isAuthenticated, dailyStats, activeWorkout, userRoutines, user]);

  const theme = THEMES[currentTheme];

  const handleLogout = async () => {
    await db.signOut();
    setUser(null);
    setIsAuthenticated(false);
    setCurrentPage('home');
  };

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#adf94e]/20 border-t-[#adf94e] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLoginSuccess} />;
  }

  const handleStartWorkout = () => {
    if (activeWorkout) setCurrentPage('executing');
    else setIsDrawerOpen(true);
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

  const handleCompleteWorkout = async () => {
    if (activeWorkout && user) {
      const now = new Date();
      const completedWorkout = { ...activeWorkout, completedAt: now.toISOString() };
      
      await db.saveWorkout(completedWorkout);
      setWorkoutHistory(prev => [completedWorkout, ...prev]);

      const caloriesEarned = 150 + (activeWorkout.exercises.length * 50);
      const newStats = {
        ...dailyStats,
        caloriesBurned: (dailyStats.caloriesBurned || 0) + caloriesEarned,
        workoutProgress: 100
      };
      
      setDailyStats(newStats);
      await db.updateDailyStats(newStats);

      // Atualizar XP do usuário
      const updatedUser = { ...user, xp: (user.xp || 0) + 150 };
      setUser(updatedUser);
      await db.saveUser(updatedUser);

      const newPost: SocialPost = {
        id: `post-${Date.now()}`,
        user: updatedUser,
        workoutTitle: activeWorkout.title,
        intensity: 85 + Math.floor(Math.random() * 15),
        calories: `${caloriesEarned} kcal`,
        duration: '45 min',
        timestamp: 'Agora',
        likes: 0,
        commentsCount: 0,
        hasLiked: false
      };
      await db.publishPost(newPost);
      setSocialFeed(prev => [newPost, ...prev]);

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
    
    // Fallbacks para evitar NaN e undefined
    const progress = dailyStats?.workoutProgress ?? 0;
    const waterIntake = dailyStats?.waterIntake ?? 0;
    const waterGoal = dailyStats?.waterGoal ?? 3000;
    const calories = dailyStats?.caloriesBurned ?? 0;

    return (
      <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-4xl mx-auto pb-12">
        <Calendar days={calendarDays} primaryColor={theme.primary} theme={theme} />
        <div className="px-4 md:px-6 mb-6 space-y-4 md:space-y-6">
          <TrainingCard 
            isMain={true} 
            theme={theme}
            data={{
              title: activeWorkout ? activeWorkout.title : "Nenhum treino ativo",
              value: `${progress}%`,
              subtitle: activeWorkout ? "Sessão em andamento" : "Toque no Play para começar",
              chartData: [15, 30, 45, 25, progress || 5, 0, 0]
            }}
            onClick={activeWorkout ? () => setCurrentPage('executing') : handleStartWorkout}
          />

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
               </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <TrainingCard 
              isMain={false} 
              theme={theme}
              onClick={() => setDailyStats(prev => ({...prev, waterIntake: Math.min((prev?.waterIntake ?? 0) + 250, 5000)}))}
              data={{
                title: "Hidratação",
                value: `${(waterIntake / 1000).toFixed(1)}L`,
                subtitle: `Meta: ${(waterGoal / 1000).toFixed(1)}L`,
                progress: (waterIntake / waterGoal) * 100
              }}
            />
            <div className={`rounded-[30px] p-5 md:p-6 border flex flex-col justify-between ${depthClass}`} style={{ backgroundColor: theme.card, color: theme.text, borderColor: theme.border }}>
              <div>
                <span className="opacity-40 text-[8px] md:text-[10px] uppercase font-black tracking-widest block mb-2">Esforço</span>
                <h3 className="text-xl md:text-2xl font-black tracking-tighter">{calories} kcal</h3>
              </div>
            </div>
          </div>
        </div>
        <WeeklyStats primaryColor={theme.primary} progress={progress} theme={theme} />
      </div>
    );
  };

  const isFullscreenPage = currentPage === 'executing' || currentPage === 'creating';

  return (
    <div className={`min-h-screen transition-colors duration-700 selection:bg-[#adf94e] selection:text-black`} style={{ backgroundColor: theme.bg, color: theme.text }}>
      <div className="fixed -top-40 -right-40 w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full blur-[120px] pointer-events-none transition-all duration-1000 opacity-20 z-0" style={{ backgroundColor: theme.primary }} />
      <div className="flex min-h-screen">
        {!isFullscreenPage && <Sidebar activePage={currentPage as any} onPageChange={(p) => setCurrentPage(p as any)} onStartWorkout={handleStartWorkout} theme={theme} onLogout={handleLogout} isAdmin={user?.role === 'admin'} />}
        <div className={`flex-1 flex flex-col ${!isFullscreenPage ? 'lg:pl-72' : ''}`}>
          {!isFullscreenPage && <Header onToggleTheme={() => setCurrentTheme(prev => prev === 'dark' ? 'mint' : 'dark')} isDark={currentTheme === 'dark'} />}
          <main className={`relative z-10 flex-1 ${!isFullscreenPage ? 'w-full pb-32 lg:pb-12' : ''}`}>
            {currentPage === 'executing' && activeWorkout ? <WorkoutExecution workout={activeWorkout} onUpdate={setActiveWorkout} onComplete={handleCompleteWorkout} onBack={() => setCurrentPage('home')} primaryColor={theme.primary} /> :
             currentPage === 'creating' ? <CreateWorkout onBack={() => setCurrentPage('home')} onStart={(exercises, title, saveAsRoutine) => {
               const newW: Workout = { id: Date.now().toString(), title: title || "Personalizado", muscleGroups: Array.from(new Set(exercises.map(e => e.muscleGroup))) as string[], exercises };
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
      {!isFullscreenPage && <div className="lg:hidden"><BottomNav activePage={currentPage as any} onPageChange={(p) => setCurrentPage(p as any)} onStartWorkout={handleStartWorkout} primaryColor={theme.primary} /></div>}
      <StartWorkoutDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} onStartNew={() => { setCurrentPage('creating'); setIsDrawerOpen(false); }} onManageRoutines={() => { setCurrentPage('routines'); setIsDrawerOpen(false); }} onStartRoutine={handleStartRoutine} routines={userRoutines} />
    </div>
  );
};

export default App;
