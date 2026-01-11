import React, { useState, useEffect } from 'react';
import {
  Users,
  Dumbbell,
  FileText,
  BarChart3,
  TrendingUp,
  Crown,
  Zap,
  Activity,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  ChevronRight,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Heart,
  Share2,
  Calendar,
  Clock,
  Target,
  Award,
  Loader2,
  BookOpen,
  Ticket,
  Settings,
  LayoutDashboard,
  ListChecks,
  PieChart
} from 'lucide-react';
import { db } from '../services/database';
import {
  User,
  BlogArticle,
  ExerciseCatalog,
  PublicRoutine,
  AdminStats,
  LeaderboardEntry,
  ExerciseStats,
  Coupon,
  Exercise,
  ExerciseSet
} from '../types';

interface AdminDashboardProps {
  theme: any;
  onClose: () => void;
}

type TabType = 'overview' | 'users' | 'routines' | 'exercises' | 'blog' | 'coupons' | 'analytics';

const MUSCLE_GROUPS = ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Pernas', 'Glúteos', 'Abdômen', 'Cardio'];
const DIFFICULTIES = ['Iniciante', 'Intermediário', 'Avançado', 'Expert'];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ theme, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [routines, setRoutines] = useState<PublicRoutine[]>([]);
  const [exercises, setExercises] = useState<ExerciseCatalog[]>([]);
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [exerciseStats, setExerciseStats] = useState<ExerciseStats[]>([]);
  const [apiUsage, setApiUsage] = useState<{ userId: string; userName: string; calls: number }[]>([]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'routine' | 'exercise' | 'article' | 'coupon' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        statsData,
        usersData,
        routinesData,
        exercisesData,
        articlesData,
        couponsData,
        leaderboardData,
        exerciseStatsData,
        apiUsageData
      ] = await Promise.all([
        db.getAdminStats(),
        db.getAllUsers(),
        db.getPublicRoutines(),
        db.getExercisesCatalog(),
        db.getBlogArticles(),
        db.getCoupons(),
        db.getLeaderboard(),
        db.getExerciseStats(),
        db.getApiUsageByUser()
      ]);

      setStats(statsData);
      setUsers(usersData);
      setRoutines(routinesData);
      setExercises(exercisesData);
      setArticles(articlesData);
      setCoupons(couponsData);
      setLeaderboard(leaderboardData);
      setExerciseStats(exerciseStatsData);
      setApiUsage(apiUsageData);
    } catch (error) {
      console.error('Erro ao carregar dados admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: 'routine' | 'exercise' | 'article' | 'coupon', item?: any) => {
    setModalType(type);
    setEditingItem(item || null);

    if (item) {
      setFormData({ ...item });
    } else {
      // Default values for new items
      switch (type) {
        case 'routine':
          setFormData({
            id: `routine-${Date.now()}`,
            title: '',
            description: '',
            muscle_groups: [],
            difficulty: 'Intermediário',
            duration_minutes: 60,
            exercises: [],
            is_premium: false,
            views: 0,
            uses: 0
          });
          break;
        case 'exercise':
          setFormData({
            id: `ex-${Date.now()}`,
            name: '',
            muscle_group: 'Peito',
            secondary_muscles: [],
            equipment: '',
            difficulty: 'Intermediário',
            instructions: ''
          });
          break;
        case 'article':
          setFormData({
            id: `art-${Date.now()}`,
            title: '',
            excerpt: '',
            content: '',
            author: 'ZFIT Team',
            date: new Date().toISOString().split('T')[0],
            category: 'Treino',
            image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
            views: 0,
            likes: 0,
            shares: 0
          });
          break;
        case 'coupon':
          setFormData({
            id: `coupon-${Date.now()}`,
            code: '',
            discount: 10,
            type: 'percentage',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'active'
          });
          break;
      }
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
    setEditingItem(null);
    setFormData({});
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      switch (modalType) {
        case 'routine':
          await db.savePublicRoutine(formData);
          setRoutines(await db.getPublicRoutines());
          break;
        case 'exercise':
          await db.saveExerciseCatalog(formData);
          setExercises(await db.getExercisesCatalog());
          break;
        case 'article':
          await db.saveBlogArticle(formData);
          setArticles(await db.getBlogArticles());
          break;
        case 'coupon':
          await db.saveCoupon(formData);
          setCoupons(await db.getCoupons());
          break;
      }
      closeModal();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;

    try {
      switch (type) {
        case 'routine':
          await db.deletePublicRoutine(id);
          setRoutines(routines.filter(r => r.id !== id));
          break;
        case 'exercise':
          await db.deleteExerciseCatalog(id);
          setExercises(exercises.filter(e => e.id !== id));
          break;
        case 'article':
          await db.deleteBlogArticle(id);
          setArticles(articles.filter(a => a.id !== id));
          break;
        case 'coupon':
          await db.deleteCoupon(id);
          setCoupons(coupons.filter(c => c.id !== id));
          break;
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  };

  const handleUpdateUserPlan = async (userId: string, plan: 'Free' | 'Pro' | 'Elite') => {
    await db.updateUserPlan(userId, plan);
    setUsers(users.map(u => u.id === userId ? { ...u, plan } : u));
  };

  const handleUpdateUserRole = async (userId: string, role: 'user' | 'admin') => {
    await db.updateUserRole(userId, role);
    setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
  };

  const addExerciseToRoutine = () => {
    const newExercise: Exercise = {
      id: `ex-${Date.now()}-${Math.random()}`,
      name: '',
      muscleGroup: 'Peito',
      sets: [{ weight: '20kg', reps: '12', difficulty: 'Normal', color: '#adf94e', completed: false }]
    };
    setFormData({
      ...formData,
      exercises: [...(formData.exercises || []), newExercise]
    });
  };

  const updateExerciseInRoutine = (index: number, field: string, value: any) => {
    const updatedExercises = [...formData.exercises];
    updatedExercises[index] = { ...updatedExercises[index], [field]: value };
    setFormData({ ...formData, exercises: updatedExercises });
  };

  const removeExerciseFromRoutine = (index: number) => {
    const updatedExercises = formData.exercises.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, exercises: updatedExercises });
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Visão Geral', icon: <LayoutDashboard size={18} /> },
    { id: 'users', label: 'Usuários', icon: <Users size={18} /> },
    { id: 'routines', label: 'Rotinas', icon: <ListChecks size={18} /> },
    { id: 'exercises', label: 'Exercícios', icon: <Dumbbell size={18} /> },
    { id: 'blog', label: 'Blog', icon: <BookOpen size={18} /> },
    { id: 'coupons', label: 'Cupons', icon: <Ticket size={18} /> },
    { id: 'analytics', label: 'Analytics', icon: <PieChart size={18} /> }
  ];

  const StatCard = ({ title, value, subtitle, icon, color }: { title: string; value: string | number; subtitle?: string; icon: React.ReactNode; color: string }) => (
    <div className="rounded-[30px] p-6 border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${color}20`, color }}>
          {icon}
        </div>
      </div>
      <h3 className="text-3xl font-black tracking-tighter" style={{ color: theme.text }}>{value}</h3>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1" style={{ color: theme.text }}>{title}</p>
      {subtitle && <p className="text-[9px] opacity-30 mt-1" style={{ color: theme.text }}>{subtitle}</p>}
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Usuários" value={stats?.totalUsers || 0} icon={<Users size={24} />} color="#adf94e" />
        <StatCard title="Usuários Ativos" value={stats?.activeUsers || 0} subtitle="Últimos 30 dias" icon={<Activity size={24} />} color="#4CAF50" />
        <StatCard title="Assinantes Pro" value={stats?.proSubscribers || 0} icon={<Zap size={24} />} color="#2196F3" />
        <StatCard title="Assinantes Elite" value={stats?.eliteSubscribers || 0} icon={<Crown size={24} />} color="#FFD700" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Treinos" value={stats?.totalWorkouts || 0} icon={<Dumbbell size={24} />} color="#FF5722" />
        <StatCard title="Exercícios" value={stats?.totalExercises || 0} icon={<Target size={24} />} color="#9C27B0" />
        <StatCard title="Rotinas Públicas" value={stats?.totalRoutines || 0} icon={<ListChecks size={24} />} color="#00BCD4" />
        <StatCard title="Artigos Blog" value={stats?.totalArticles || 0} icon={<FileText size={24} />} color="#E91E63" />
      </div>

      {/* Leaderboard */}
      <div className="rounded-[30px] p-6 border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <h3 className="text-lg font-black uppercase tracking-tighter mb-6" style={{ color: theme.text }}>
          🏆 Top Atletas (Volume Total)
        </h3>
        <div className="space-y-3">
          {leaderboard.slice(0, 5).map((entry, i) => (
            <div key={entry.user.id} className="flex items-center justify-between p-4 rounded-2xl" style={{ backgroundColor: theme.cardSecondary }}>
              <div className="flex items-center gap-4">
                <span className={`text-2xl font-black ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-orange-400' : 'opacity-40'}`}>
                  #{i + 1}
                </span>
                <img src={entry.user.avatar} alt="" className="w-10 h-10 rounded-xl" />
                <div>
                  <p className="font-black text-sm" style={{ color: theme.text }}>{entry.user.name}</p>
                  <p className="text-[10px] opacity-40" style={{ color: theme.text }}>{entry.totalWorkouts} treinos</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black" style={{ color: theme.primary }}>{(entry.totalVolume / 1000).toFixed(1)} ton</p>
              </div>
            </div>
          ))}
          {leaderboard.length === 0 && (
            <p className="text-center opacity-40 py-8" style={{ color: theme.text }}>Nenhum dado disponível ainda</p>
          )}
        </div>
      </div>

      {/* Top Exercises */}
      <div className="rounded-[30px] p-6 border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <h3 className="text-lg font-black uppercase tracking-tighter mb-6" style={{ color: theme.text }}>
          💪 Exercícios Mais Usados
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {exerciseStats.slice(0, 8).map((ex, i) => (
            <div key={ex.name} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: theme.cardSecondary }}>
              <div className="flex items-center gap-3">
                <span className="text-lg font-black opacity-20">#{i + 1}</span>
                <div>
                  <p className="font-bold text-sm" style={{ color: theme.text }}>{ex.name}</p>
                  <p className="text-[10px] opacity-40" style={{ color: theme.text }}>{ex.muscleGroup}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black" style={{ backgroundColor: `${theme.primary}20`, color: theme.primary }}>
                {ex.uses}x
              </span>
            </div>
          ))}
          {exerciseStats.length === 0 && (
            <p className="text-center opacity-40 py-8 col-span-2" style={{ color: theme.text }}>Nenhum dado disponível</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => {
    const filteredUsers = users.filter(u =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-4">
        {/* Search */}
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" style={{ color: theme.text }} />
            <input
              type="text"
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-xl border outline-none"
              style={{ backgroundColor: theme.cardSecondary, borderColor: theme.border, color: theme.text }}
            />
          </div>
          <button
            onClick={loadData}
            className="h-12 px-4 rounded-xl flex items-center gap-2"
            style={{ backgroundColor: theme.cardSecondary, color: theme.text }}
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Users Table */}
        <div className="rounded-[30px] border overflow-hidden" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: theme.cardSecondary }}>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: theme.text }}>Usuário</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: theme.text }}>Email</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: theme.text }}>Plano</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: theme.text }}>Role</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: theme.text }}>Level</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: theme.text }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-t" style={{ borderColor: theme.border }}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} alt="" className="w-8 h-8 rounded-lg" />
                        <span className="font-bold text-sm" style={{ color: theme.text }}>{user.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm opacity-60" style={{ color: theme.text }}>{user.email}</span>
                    </td>
                    <td className="p-4">
                      <select
                        value={user.plan || 'Free'}
                        onChange={(e) => handleUpdateUserPlan(user.id, e.target.value as any)}
                        className="px-3 py-1 rounded-lg text-xs font-bold border"
                        style={{ backgroundColor: theme.cardSecondary, borderColor: theme.border, color: theme.text }}
                      >
                        <option value="Free">Free</option>
                        <option value="Pro">Pro</option>
                        <option value="Elite">Elite</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <select
                        value={user.role || 'user'}
                        onChange={(e) => handleUpdateUserRole(user.id, e.target.value as any)}
                        className="px-3 py-1 rounded-lg text-xs font-bold border"
                        style={{ backgroundColor: theme.cardSecondary, borderColor: theme.border, color: theme.text }}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <span className="font-bold" style={{ color: theme.primary }}>Lv. {user.level || 1}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs opacity-40" style={{ color: theme.text }}>{user.xp || 0} XP</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderRoutines = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-black" style={{ color: theme.text }}>Rotinas Públicas</h3>
        <button
          onClick={() => openModal('routine')}
          className="h-12 px-6 rounded-xl flex items-center gap-2 font-bold"
          style={{ backgroundColor: theme.primary, color: '#000' }}
        >
          <Plus size={18} /> Nova Rotina
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {routines.map(routine => (
          <div key={routine.id} className="rounded-[25px] p-5 border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {routine.is_premium && <Crown size={14} className="text-yellow-400" />}
                  <h4 className="font-black" style={{ color: theme.text }}>{routine.title}</h4>
                </div>
                <p className="text-xs opacity-40" style={{ color: theme.text }}>{routine.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openModal('routine', routine)} className="p-2 rounded-lg" style={{ backgroundColor: theme.cardSecondary }}>
                  <Edit3 size={16} style={{ color: theme.text }} />
                </button>
                <button onClick={() => handleDelete('routine', routine.id)} className="p-2 rounded-lg bg-red-500/10">
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {routine.muscle_groups?.map(mg => (
                <span key={mg} className="px-2 py-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: `${theme.primary}20`, color: theme.primary }}>
                  {mg}
                </span>
              ))}
            </div>
            <div className="flex justify-between text-xs opacity-40" style={{ color: theme.text }}>
              <span>{routine.exercises?.length || 0} exercícios</span>
              <span>{routine.duration_minutes} min</span>
              <span>{routine.uses || 0} usos</span>
            </div>
          </div>
        ))}
        {routines.length === 0 && (
          <p className="text-center opacity-40 py-8 col-span-2" style={{ color: theme.text }}>Nenhuma rotina cadastrada</p>
        )}
      </div>
    </div>
  );

  const renderExercises = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-black" style={{ color: theme.text }}>Catálogo de Exercícios</h3>
        <button
          onClick={() => openModal('exercise')}
          className="h-12 px-6 rounded-xl flex items-center gap-2 font-bold"
          style={{ backgroundColor: theme.primary, color: '#000' }}
        >
          <Plus size={18} /> Novo Exercício
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exercises.map(exercise => (
          <div key={exercise.id} className="rounded-[20px] p-4 border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-black text-sm" style={{ color: theme.text }}>{exercise.name}</h4>
              <div className="flex gap-1">
                <button onClick={() => openModal('exercise', exercise)} className="p-1.5 rounded-lg" style={{ backgroundColor: theme.cardSecondary }}>
                  <Edit3 size={14} style={{ color: theme.text }} />
                </button>
                <button onClick={() => handleDelete('exercise', exercise.id)} className="p-1.5 rounded-lg bg-red-500/10">
                  <Trash2 size={14} className="text-red-500" />
                </button>
              </div>
            </div>
            <span className="px-2 py-1 rounded-full text-[10px] font-bold inline-block" style={{ backgroundColor: `${theme.primary}20`, color: theme.primary }}>
              {exercise.muscle_group}
            </span>
            {exercise.equipment && (
              <p className="text-[10px] opacity-40 mt-2" style={{ color: theme.text }}>Equipamento: {exercise.equipment}</p>
            )}
          </div>
        ))}
        {exercises.length === 0 && (
          <p className="text-center opacity-40 py-8 col-span-3" style={{ color: theme.text }}>Nenhum exercício cadastrado</p>
        )}
      </div>
    </div>
  );

  const renderBlog = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-black" style={{ color: theme.text }}>Artigos do Blog</h3>
        <button
          onClick={() => openModal('article')}
          className="h-12 px-6 rounded-xl flex items-center gap-2 font-bold"
          style={{ backgroundColor: theme.primary, color: '#000' }}
        >
          <Plus size={18} /> Novo Artigo
        </button>
      </div>

      <div className="space-y-4">
        {articles.map(article => (
          <div key={article.id} className="rounded-[25px] p-5 border flex gap-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <img src={article.image} alt="" className="w-24 h-24 rounded-xl object-cover" />
            <div className="flex-1">
              <h4 className="font-black mb-1" style={{ color: theme.text }}>{article.title}</h4>
              <p className="text-xs opacity-40 line-clamp-2 mb-2" style={{ color: theme.text }}>{article.excerpt}</p>
              <div className="flex items-center gap-4 text-[10px] opacity-40" style={{ color: theme.text }}>
                <span className="flex items-center gap-1"><Eye size={12} /> {article.views || 0}</span>
                <span className="flex items-center gap-1"><Heart size={12} /> {article.likes || 0}</span>
                <span className="flex items-center gap-1"><Share2 size={12} /> {article.shares || 0}</span>
                <span>{article.category}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => openModal('article', article)} className="p-2 rounded-lg" style={{ backgroundColor: theme.cardSecondary }}>
                <Edit3 size={16} style={{ color: theme.text }} />
              </button>
              <button onClick={() => handleDelete('article', article.id)} className="p-2 rounded-lg bg-red-500/10">
                <Trash2 size={16} className="text-red-500" />
              </button>
            </div>
          </div>
        ))}
        {articles.length === 0 && (
          <p className="text-center opacity-40 py-8" style={{ color: theme.text }}>Nenhum artigo cadastrado</p>
        )}
      </div>
    </div>
  );

  const renderCoupons = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-black" style={{ color: theme.text }}>Cupons de Desconto</h3>
        <button
          onClick={() => openModal('coupon')}
          className="h-12 px-6 rounded-xl flex items-center gap-2 font-bold"
          style={{ backgroundColor: theme.primary, color: '#000' }}
        >
          <Plus size={18} /> Novo Cupom
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {coupons.map(coupon => (
          <div key={coupon.id} className="rounded-[20px] p-4 border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <div className="flex justify-between items-start mb-3">
              <code className="text-lg font-black" style={{ color: theme.primary }}>{coupon.code}</code>
              <div className="flex gap-1">
                <button onClick={() => openModal('coupon', coupon)} className="p-1.5 rounded-lg" style={{ backgroundColor: theme.cardSecondary }}>
                  <Edit3 size={14} style={{ color: theme.text }} />
                </button>
                <button onClick={() => handleDelete('coupon', coupon.id)} className="p-1.5 rounded-lg bg-red-500/10">
                  <Trash2 size={14} className="text-red-500" />
                </button>
              </div>
            </div>
            <div className="space-y-1 text-sm" style={{ color: theme.text }}>
              <p className="font-bold">{coupon.discount}{coupon.type === 'percentage' ? '%' : ' R$'} de desconto</p>
              <p className="text-xs opacity-40">Expira: {new Date(coupon.expiresAt).toLocaleDateString('pt-BR')}</p>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${coupon.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                {coupon.status === 'active' ? 'Ativo' : 'Expirado'}
              </span>
            </div>
          </div>
        ))}
        {coupons.length === 0 && (
          <p className="text-center opacity-40 py-8 col-span-3" style={{ color: theme.text }}>Nenhum cupom cadastrado</p>
        )}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* API Usage */}
      <div className="rounded-[30px] p-6 border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <h3 className="text-lg font-black uppercase tracking-tighter mb-4" style={{ color: theme.text }}>
          📊 Uso de API por Usuário (Mês Atual)
        </h3>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatCard title="Chamadas Hoje" value={stats?.apiCallsToday || 0} icon={<Activity size={24} />} color="#4CAF50" />
          <StatCard title="Chamadas Mês" value={stats?.apiCallsThisMonth || 0} icon={<BarChart3 size={24} />} color="#2196F3" />
        </div>
        <div className="space-y-2">
          {apiUsage.slice(0, 10).map((item, i) => (
            <div key={item.userId} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: theme.cardSecondary }}>
              <div className="flex items-center gap-3">
                <span className="text-lg font-black opacity-20">#{i + 1}</span>
                <span className="font-bold" style={{ color: theme.text }}>{item.userName}</span>
              </div>
              <span className="font-black" style={{ color: theme.primary }}>{item.calls} calls</span>
            </div>
          ))}
          {apiUsage.length === 0 && (
            <p className="text-center opacity-40 py-4" style={{ color: theme.text }}>Nenhum dado de uso disponível</p>
          )}
        </div>
      </div>

      {/* Subscription Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-[30px] p-6 border text-center" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#4CAF5020' }}>
            <Users size={32} className="text-green-500" />
          </div>
          <h4 className="text-4xl font-black" style={{ color: theme.text }}>{users.filter(u => u.plan === 'Free').length}</h4>
          <p className="text-sm opacity-40 font-bold" style={{ color: theme.text }}>Plano Free</p>
        </div>
        <div className="rounded-[30px] p-6 border text-center" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#2196F320' }}>
            <Zap size={32} className="text-blue-500" />
          </div>
          <h4 className="text-4xl font-black" style={{ color: theme.text }}>{stats?.proSubscribers || 0}</h4>
          <p className="text-sm opacity-40 font-bold" style={{ color: theme.text }}>Plano Pro</p>
        </div>
        <div className="rounded-[30px] p-6 border text-center" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#FFD70020' }}>
            <Crown size={32} className="text-yellow-500" />
          </div>
          <h4 className="text-4xl font-black" style={{ color: theme.text }}>{stats?.eliteSubscribers || 0}</h4>
          <p className="text-sm opacity-40 font-bold" style={{ color: theme.text }}>Plano Elite</p>
        </div>
      </div>
    </div>
  );

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[30px] p-6 border" style={{ backgroundColor: theme.bg, borderColor: theme.border }}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black uppercase" style={{ color: theme.text }}>
              {editingItem ? 'Editar' : 'Criar'} {modalType === 'routine' ? 'Rotina' : modalType === 'exercise' ? 'Exercício' : modalType === 'article' ? 'Artigo' : 'Cupom'}
            </h3>
            <button onClick={closeModal} className="p-2 rounded-xl" style={{ backgroundColor: theme.cardSecondary }}>
              <X size={20} style={{ color: theme.text }} />
            </button>
          </div>

          <div className="space-y-4">
            {/* ROUTINE FORM */}
            {modalType === 'routine' && (
              <>
                <div>
                  <label className="text-xs font-bold opacity-40 block mb-1" style={{ color: theme.text }}>Título</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border outline-none"
                    style={{ backgroundColor: theme.cardSecondary, borderColor: theme.border, color: theme.text }}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold opacity-40 block mb-1" style={{ color: theme.text }}>Descrição</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full h-24 px-4 py-3 rounded-xl border outline-none resize-none"
                    style={{ backgroundColor: theme.cardSecondary, borderColor: theme.border, color: theme.text }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold opacity-40 block mb-1" style={{ color: theme.text }}>Dificuldade</label>
                    <select
                      value={formData.difficulty || 'Intermediário'}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl border outline-none"
                      style={{ backgroundColor: theme.cardSecondary, borderColor: theme.border, color: theme.text }}
                    >
                      {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold opacity-40 block mb-1" style={{ color: theme.text }}>Duração (min)</label>
                    <input
                      type="number"
                      value={formData.duration_minutes || 60}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                      className="w-full h-12 px-4 rounded-xl border outline-none"
                      style={{ backgroundColor: theme.cardSecondary, borderColor: theme.border, color: theme.text }}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold opacity-40 block mb-2" style={{ color: theme.text }}>Grupos Musculares</label>
                  <div className="flex flex-wrap gap-2">
                    {MUSCLE_GROUPS.map(mg => (
                      <button
                        key={mg}
                        type="button"
                        onClick={() => {
                          const groups = formData.muscle_groups || [];
                          if (groups.includes(mg)) {
                            setFormData({ ...formData, muscle_groups: groups.filter((g: string) => g !== mg) });
                          } else {
                            setFormData({ ...formData, muscle_groups: [...groups, mg] });
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${(formData.muscle_groups || []).includes(mg) ? 'text-black' : 'opacity-40'
                          }`}
                        style={{
                          backgroundColor: (formData.muscle_groups || []).includes(mg) ? theme.primary : theme.cardSecondary,
                          color: (formData.muscle_groups || []).includes(mg) ? '#000' : theme.text
                        }}
                      >
                        {mg}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.is_premium || false}
                    onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <label className="font-bold" style={{ color: theme.text }}>Rotina Premium (apenas Pro/Elite)</label>
                </div>

                {/* Exercises in Routine */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold opacity-40" style={{ color: theme.text }}>Exercícios da Rotina</label>
                    <button
                      type="button"
                      onClick={addExerciseToRoutine}
                      className="text-xs flex items-center gap-1 font-bold"
                      style={{ color: theme.primary }}
                    >
                      <Plus size={14} /> Adicionar Exercício
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(formData.exercises || []).map((ex: Exercise, i: number) => (
                      <div key={ex.id} className="p-3 rounded-xl flex items-center gap-3" style={{ backgroundColor: theme.cardSecondary }}>
                        <input
                          type="text"
                          value={ex.name}
                          onChange={(e) => updateExerciseInRoutine(i, 'name', e.target.value)}
                          placeholder="Nome do exercício"
                          className="flex-1 h-10 px-3 rounded-lg border outline-none text-sm"
                          style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}
                        />
                        <select
                          value={ex.muscleGroup}
                          onChange={(e) => updateExerciseInRoutine(i, 'muscleGroup', e.target.value)}
                          className="h-10 px-3 rounded-lg border outline-none text-sm"
                          style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}
                        >
                          {MUSCLE_GROUPS.map(mg => <option key={mg} value={mg}>{mg}</option>)}
                        </select>
                        <button onClick={() => removeExerciseFromRoutine(i)} className="p-2 rounded-lg bg-red-500/10">
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* EXERCISE FORM */}
            {modalType === 'exercise' && (
              <>
                <div>
                  <label className="text-xs font-bold opacity-40 block mb-1" style={{ color: theme.text }}>Nome do Exercício</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border outline-none"
                    style={{ backgroundColor: theme.cardSecondary, borderColor: theme.border, color: theme.text }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold opacity-40 block mb-1" style={{ color: theme.text }}>Grupo Muscular</label>
                    <select
                      value={formData.muscle_group || 'Peito'}
                      onChange={(e) => setFormData({ ...formData, muscle_group: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl border outline-none"
                      style={{ backgroundColor: theme.cardSecondary, borderColor: theme.border, color: theme.text }}
                    >
                      {MUSCLE_GROUPS.map(mg => <option key={mg} value={mg}>{mg}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold opacity-40 block mb-1" style={{ color: theme.text }}>Dificuldade</label>
                    <select
                      value={formData.difficulty || 'Intermediário'}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl border outline-none"
                      style={{ backgroundColor: theme.cardSecondary, borderColor: theme.border, color: theme.text }}
                    >
                      {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold opacity-40 block mb-1" style={{ color: theme.text }}>Equipamento</label>
                  <input
                    type="text"
                    value={formData.equipment || ''}
                    onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                    placeholder="Ex: Barra, Halteres, Máquina..."
                    className="w-full h-12 px-4 rounded-xl border outline-none"
                    style={{ backgroundColor: theme.cardSecondary, borderColor: theme.border, color: theme.text }}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold opacity-40 block mb-1" style={{ color: theme.text }}>Instruções</label>
                  <textarea
                    value={formData.instructions || ''}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="Como executar o exercício..."
                    className="w-full h-32 px-4 py-3 rounded-xl border outline-none resize-none"
                    style={{ backgroundColor: theme.cardSecondary, borderColor: theme.border, color: theme.text }}
                  />
                </div>
              </>
            )}

            {/* ARTICLE FORM */}
            {modalType === 'article' && (
              <>
                <div>
                  <label className="text-xs font-bold opacity-40 block mb-1" style={{ color: theme.text }}>Título</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border outline-none"
                    style={{ backgroundColor: theme.cardSecondary, borderColor: theme.border, color: theme.text }}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold opacity-40 block mb-1" style={{ color: theme.text }}>Resumo</label>
                  <textarea
                    value={formData.excerpt || ''}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full h-20 px-4 py-3 rounded-xl border outline-none resize-none"
                    style={{ backgroundColor: theme.cardSecondary, borderColor: theme.border, color: theme.text }}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold opacity-40 block mb-1" style={{ color: theme.text }}>Conteúdo</label>
                  <textarea
                    value={formData.content || ''}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full h-40 px-4 py-3 rounded-xl border outline-none resize-none"
                    style={{ backgroundColor: theme.cardSecondary, borderColor: theme.border, color: theme.text }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold opacity-40 block mb-1" style={{ color: theme.text }}>Autor</label>
                    <input
                      type="text"
                      value={formData.author || ''}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl border outline-none"
                      style={{ backgroundColor: theme.cardSecondary, borderColor: theme.border, color: theme.text }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold opacity-40 block mb-1" style={{ color: theme.text }}>Categoria</label>
                    <input
                      type="text"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl border outline-none"
                      style={{ backgroundColor: theme.cardSecondary, borderColor: theme.border, color: theme.text }}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold opacity-40 block mb-1" style={{ color: theme.text }}>URL da Imagem</label>
                  <input
                    type="text"
                    value={formData.image || ''}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border outline-none"
                    style={{ backgroundColor: theme.cardSecondary, borderColor: theme.border, color: theme.text }}
                  />
                </div>
              </>
            )}

            {/* COUPON FORM */}
            {modalType === 'coupon' && (
              <>
                <div>
                  <label className="text-xs font-bold opacity-40 block mb-1" style={{ color: theme.text }}>Código do Cupom</label>
                  <input
                    type="text"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full h-12 px-4 rounded-xl border outline-none font-mono uppercase"
                    style={{ backgroundColor: theme.cardSecondary, borderColor: theme.border, color: theme.text }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold opacity-40 block mb-1" style={{ color: theme.text }}>Desconto</label>
                    <input
                      type="number"
                      value={formData.discount || 10}
                      onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) })}
                      className="w-full h-12 px-4 rounded-xl border outline-none"
                      style={{ backgroundColor: theme.cardSecondary, borderColor: theme.border, color: theme.text }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold opacity-40 block mb-1" style={{ color: theme.text }}>Tipo</label>
                    <select
                      value={formData.type || 'percentage'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl border outline-none"
                      style={{ backgroundColor: theme.cardSecondary, borderColor: theme.border, color: theme.text }}
                    >
                      <option value="percentage">Porcentagem (%)</option>
                      <option value="fixed">Valor Fixo (R$)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold opacity-40 block mb-1" style={{ color: theme.text }}>Expira em</label>
                    <input
                      type="date"
                      value={formData.expiresAt || ''}
                      onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl border outline-none"
                      style={{ backgroundColor: theme.cardSecondary, borderColor: theme.border, color: theme.text }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold opacity-40 block mb-1" style={{ color: theme.text }}>Status</label>
                    <select
                      value={formData.status || 'active'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl border outline-none"
                      style={{ backgroundColor: theme.cardSecondary, borderColor: theme.border, color: theme.text }}
                    >
                      <option value="active">Ativo</option>
                      <option value="expired">Expirado</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button onClick={closeModal} className="h-12 px-6 rounded-xl font-bold" style={{ backgroundColor: theme.cardSecondary, color: theme.text }}>
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-12 px-6 rounded-xl font-bold flex items-center gap-2"
              style={{ backgroundColor: theme.primary, color: '#000' }}
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Salvar
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <div className="text-center">
          <Loader2 size={48} className="animate-spin mx-auto mb-4" style={{ color: theme.primary }} />
          <p className="font-bold opacity-40" style={{ color: theme.text }}>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex" style={{ backgroundColor: theme.bg }}>
      {/* Sidebar */}
      <div className="w-64 border-r flex flex-col" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="p-6 border-b" style={{ borderColor: theme.border }}>
          <h1 className="text-xl font-black uppercase tracking-tighter" style={{ color: theme.text }}>
            ⚙️ Admin
          </h1>
          <p className="text-xs opacity-40 mt-1" style={{ color: theme.text }}>Painel de Controle</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id ? 'text-black' : 'opacity-60 hover:opacity-100'
                }`}
              style={{
                backgroundColor: activeTab === tab.id ? theme.primary : 'transparent',
                color: activeTab === tab.id ? '#000' : theme.text
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: theme.border }}>
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm"
            style={{ backgroundColor: theme.cardSecondary, color: theme.text }}
          >
            <X size={18} />
            Fechar Admin
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black uppercase tracking-tighter" style={{ color: theme.text }}>
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-2 rounded-xl"
              style={{ backgroundColor: theme.cardSecondary, color: theme.text }}
            >
              <RefreshCw size={18} />
              Atualizar
            </button>
          </div>

          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'routines' && renderRoutines()}
          {activeTab === 'exercises' && renderExercises()}
          {activeTab === 'blog' && renderBlog()}
          {activeTab === 'coupons' && renderCoupons()}
          {activeTab === 'analytics' && renderAnalytics()}
        </div>
      </div>

      {renderModal()}
    </div>
  );
};

export default AdminDashboard;
