
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
import PricingPage from './components/PricingPage';
import { ArrowRight, BookOpen, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { THEMES, INITIAL_DAILY_STATS, getCalendarDays, MOCK_BLOG } from './constants';
import { DailyStats, Workout, Exercise, SocialPost, User, BlogArticle } from './types';
import { db } from './services/database';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('zfit_auth') === 'true';
    } catch {
      return false;
    }
  });
  
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const [currentTheme, setCurrentTheme] = useState<'dark' | 'mint'>('dark');
  const [currentPage, setCurrentPage] = useState<'home' | 'feed' | 'stats' | 'profile' | 'executing' | 'creating' | 'admin' | 'blog' | 'routines' | 'pricing'>('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const [dailyStats, setDailyStats] = useState<DailyStats>(INITIAL_DAILY_STATS);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<Workout[]>([]);
  const [socialFeed, setSocialFeed] = useState<SocialPost[]>([]);
  const [userRoutines, setUserRoutines] = useState<Workout[]>([]);
  const [blogArticles, setBlogArticles] = useState<BlogArticle[]>(MOCK_BLOG);
  
  const [calendarDays] = useState(getCalendarDays());

  useEffect(() => {
    const initApp = async () => {
      try {
        if (isAuthenticated) {
          const refreshedUser = await db.refreshUser();
          
          if (refreshedUser) {
            let currentUser = refreshedUser;
            
            // Lógica de Ativação via URL (Kiwify Redirect)
            const params = new URLSearchParams(window.location.search);
            const status = params.get('status');
            const planParam = params.get('plan');

            if (status === 'success' && planParam) {
              const targetPlan = planParam.toLowerCase() === 'elite' ? 'Elite' : 'Pro';
              
              // Só atualiza se o plano for diferente/superior
              if (currentUser.plan !== targetPlan) {
                const updatedUser = { ...currentUser, plan: targetPlan as any };
                await db.saveUser(updatedUser);
                currentUser = updatedUser;
                setCelebrate(true);
              }

              setShowPurchaseSuccess(true);
              setTimeout(() => {
                setShowPurchaseSuccess(false);
                setCelebrate(false);
              }, 10000);
              
              window.history.replaceState({}, document.title, window.location.pathname);
              setCurrentPage('profile');
            }

            setUser(currentUser);
          } else {
            setIsAuthenticated(false);
          }
        }
      } catch (e: any) {
        if (isAuthenticated) setIsAuthenticated(false);
      } finally {
        setLoadingAuth(false);
      }
    };
    initApp();
  }, [isAuthenticated]);

  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated && user) {
        try {
          const [history, feed, stats, articles] = await Promise.allSettled([
            db.getWorkoutHistory(),
            db.getSocialFeed(),
            db.getDailyStats(),
            db.getBlogArticles()
          ]);
          
          if (history.status === 'fulfilled') setWorkoutHistory(history.value);
          if (feed.status === 'fulfilled') setSocialFeed(feed.value);
          if (stats.status === 'fulfilled') setDailyStats(stats.value || INITIAL_DAILY_STATS);
          if (articles.status === 'fulfilled' && articles.value.length > 0) setBlogArticles(articles.value);
          
          const savedRoutines = localStorage.getItem('zfit_user_routines');
          if (savedRoutines) setUserRoutines(JSON.parse(savedRoutines));
        } catch (e) {
          console.warn("ZFIT: Algumas fontes de dados falharam.");
        }
      }
    };
    loadData();
  }, [isAuthenticated, user]);

  const theme = THEMES[currentTheme];

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#adf94e]/10 border-t-[#adf94e] rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest opacity-20 animate-pulse">Autenticando...</p>
      </div>
    );
  }

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
      
      await db.saveWorkout(completedWorkout).catch(() => {});
      setWorkoutHistory(prev => [completedWorkout, ...prev]);

      const caloriesEarned = 150 + (activeWorkout.exercises.length * 50);
      const newStats = {
        ...dailyStats,
        caloriesBurned: (dailyStats.caloriesBurned || 0) + caloriesEarned,
        workoutProgress: 100
      };
      
      setDailyStats(newStats);
      db.updateDailyStats(newStats).catch(() => {});

      const updatedUser = { ...user, xp: (user.xp || 0) + 150 };
      setUser(updatedUser);
      db.saveUser(updatedUser).catch(() => {});

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
      db.publishPost(newPost).catch(() => {});
      setSocialFeed(prev => [newPost, ...prev]);

      setActiveWorkout(null);
      setCurrentPage('home');
    }
  };

  const renderHome = () => {
    const latestArticle = blogArticles[0] || MOCK_BLOG[0];
    const isMint = theme.name === 'ZFIT Mint';
    const depthClass = isMint ? 'premium-depth-light' : 'premium-depth-dark';
    
    const progress = dailyStats?.workoutProgress ?? 0;
    const waterIntake = dailyStats?.waterIntake ?? 0;
    const waterGoal = dailyStats?.waterGoal ?? 3000;
    const calories = dailyStats?.caloriesBurned ?? 0;

    return (
      <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-4xl mx-auto pb-12">
        <Calendar days={calendarDays} primaryColor={theme.primary} theme={theme} />
        <div className="px-4 md:px-6 mb-4 md:mb-6 space-y-2 md:space-y-6">
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
            className={`rounded-[25px] md:rounded-[40px] p-4 md:p-8 border cursor-pointer group relative overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99] ${depthClass}`}
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <div className="flex justify-between items-center mb-3 md:mb-6">
               <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center border" style={{ backgroundColor: theme.cardSecondary, borderColor: theme.border, color: theme.primary }}>
                    <BookOpen size={14} md:size={16} />
                  </div>
                  <span className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em] opacity-40" style={{ color: theme.text }}>Blog em Destaque</span>
               </div>
               <div className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border" style={{ color: theme.primary, borderColor: theme.border }}>
                 <ArrowRight size={12} />
               </div>
            </div>
            
            <div className="space-y-3 md:space-y-6">
               <div className="max-w-md">
                 <h3 className="text-base md:text-2xl font-black uppercase tracking-tighter leading-[1.1] mb-1 md:mb-2" style={{ color: theme.text }}>
                   {latestArticle.title}
                 </h3>
                 <p className="text-[8px] md:text-[11px] font-medium leading-relaxed opacity-50 line-clamp-2" style={{ color: theme.text }}>
                   {latestArticle.excerpt}
                 </p>
               </div>
               <div className="w-full h-24 md:h-56 rounded-[15px] md:rounded-[30px] overflow-hidden border relative group" style={{ borderColor: theme.border }}>
                  <img src={latestArticle.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="" />
               </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 md:gap-4">
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
            <div className={`rounded-[22px] md:rounded-[30px] p-4 md:p-6 border flex flex-col justify-between ${depthClass}`} style={{ backgroundColor: theme.card, color: theme.text, borderColor: theme.border }}>
              <div>
                <span className="opacity-40 text-[7px] md:text-[10px] uppercase font-black tracking-widest block mb-1 md:mb-2">Esforço</span>
                <h3 className="text-lg md:text-2xl font-black tracking-tighter">{calories} kcal</h3>
              </div>
            </div>
          </div>
        </div>
        <WeeklyStats primaryColor={theme.primary} progress={progress} theme={theme} />
      </div>
    );
  };

  const isFullscreenPage = currentPage === 'executing' || currentPage === 'creating' || currentPage === 'pricing';

  return (
    <div className={`h-full transition-colors duration-700 selection:bg-[#adf94e] selection:text-black`} style={{ backgroundColor: theme.bg, color: theme.text }}>
      
      {/* Celebration Overlay */}
      {celebrate && (
        <div className="fixed inset-0 z-[300] pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[#adf94e]/10 animate-pulse" />
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="absolute w-2 h-2 rounded-full animate-bounce" 
              style={{ 
                backgroundColor: i % 2 === 0 ? '#adf94e' : '#FFFFFF',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }} 
            />
          ))}
        </div>
      )}

      {/* Success Notification */}
      {showPurchaseSuccess && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-10 duration-500 w-[90%] max-w-md">
          <div className="bg-[#adf94e] text-black p-6 rounded-[35px] shadow-[0_30px_60px_rgba(173,249,78,0.4)] flex items-center gap-5 border-4 border-black/10">
            <div className="w-14 h-14 rounded-2xl bg-black/10 flex items-center justify-center shrink-0">
               <Sparkles size={28} className="animate-spin duration-[3s]" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Upgrade Concluído</p>
              <h4 className="text-sm font-black uppercase tracking-tighter">Status Elite Ativado!</h4>
              <p className="text-[9px] font-bold opacity-60 leading-tight mt-1">Sua jornada de alta performance começa agora.</p>
            </div>
          </div>
        </div>
      )}

      <div className="fixed -top-40 -right-40 w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full blur-[120px] pointer-events-none transition-all duration-1000 opacity-20 z-0" style={{ backgroundColor: theme.primary }} />
      <div className="flex h-full">
        {!isFullscreenPage && <Sidebar activePage={currentPage as any} onPageChange={(p) => setCurrentPage(p as any)} onStartWorkout={handleStartWorkout} theme={theme} onLogout={handleLogout} isAdmin={user?.role === 'admin'} />}
        <div className={`flex-1 flex flex-col ${!isFullscreenPage ? 'lg:pl-72' : ''}`}>
          {!isFullscreenPage && (
            <Header 
              onToggleTheme={() => setCurrentTheme(prev => prev === 'dark' ? 'mint' : 'dark')} 
              isDark={currentTheme === 'dark'} 
              user={user} 
              onLogoClick={() => setCurrentPage('home')}
              onProfileClick={() => setCurrentPage('profile')}
            />
          )}
          <main className={`relative z-10 flex-1 ${!isFullscreenPage ? 'w-full pb-28 lg:pb-12' : ''}`}>
            {currentPage === 'executing' && activeWorkout ? <WorkoutExecution workout={activeWorkout} onUpdate={setActiveWorkout} onComplete={handleCompleteWorkout} onBack={() => setCurrentPage('home')} primaryColor={theme.primary} /> :
             currentPage === 'creating' ? <CreateWorkout onBack={() => setCurrentPage('home')} onStart={(exercises, title, saveAsRoutine) => {
               const newW: Workout = { id: Date.now().toString(), title: title || "Personalizado", muscleGroups: Array.from(new Set(exercises.map(e => e.muscleGroup))) as string[], exercises };
               if (saveAsRoutine) setUserRoutines(p => [newW, ...p]);
               handleStartRoutine(newW);
             }} /> :
             currentPage === 'pricing' ? <PricingPage theme={theme} user={user} onBack={() => setCurrentPage('home')} onSelectPlan={(id) => console.log('Selected plan:', id)} /> :
             currentPage === 'feed' ? <Feed theme={theme} posts={socialFeed} onUpdatePosts={setSocialFeed} primaryColor={theme.primary} /> :
             currentPage === 'stats' ? <StatsPage primaryColor={theme.primary} history={workoutHistory} /> :
             currentPage === 'profile' ? <ProfilePage theme={theme} user={user} onUpdateUser={setUser} history={workoutHistory} onLogout={handleLogout} onOpenPricing={() => setCurrentPage('pricing')} /> :
             currentPage === 'admin' ? <AdminDashboard theme={theme} /> :
             currentPage === 'blog' ? <BlogPage articles={blogArticles} theme={theme} onBack={() => setCurrentPage('home')} /> :
             currentPage === 'routines' ? <RoutinesPage routines={userRoutines} theme={theme} onBack={() => setCurrentPage('home')} onStartRoutine={handleStartRoutine} onDeleteRoutine={(id) => setUserRoutines(p => p.filter(r => r.id !== id))} /> :
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
