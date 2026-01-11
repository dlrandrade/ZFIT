
import React, { useState, useEffect } from 'react';
import { 
  Users, Dumbbell, TrendingUp, Activity, Search, Edit3, Trash2, 
  ShieldCheck, ArrowUpRight, Database, Calendar, FileText, Plus, 
  Layout, DollarSign, Ticket, Clock, X, Save, Image as ImageIcon,
  Check, Loader2
} from 'lucide-react';
import { Coupon, BlogArticle, Workout, Exercise } from '../types';
import { MOCK_BLOG, EXERCISE_DATABASE, PUBLIC_ROUTINES } from '../constants';

interface AdminDashboardProps {
  theme: any;
}

type ContentSubTab = 'blog' | 'exercises' | 'routines';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ theme }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'saas' | 'content'>('overview');
  const [contentSubTab, setContentSubTab] = useState<ContentSubTab>('blog');
  
  // States with LocalStorage Persistence
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('zfit_admin_coupons');
    return saved ? JSON.parse(saved) : [
      { id: '1', code: 'ZFITBLACK', discount: 20, type: 'percentage', expiresAt: '2023-12-31', status: 'active' },
      { id: '2', code: 'PRIMEIROTREINO', discount: 15, type: 'fixed', expiresAt: '2023-12-01', status: 'expired' }
    ];
  });

  const [articles, setArticles] = useState<BlogArticle[]>(() => {
    const saved = localStorage.getItem('zfit_admin_articles');
    return saved ? JSON.parse(saved) : MOCK_BLOG;
  });

  const [exercises, setExercises] = useState<any[]>(() => {
    const saved = localStorage.getItem('zfit_admin_exercises');
    return saved ? JSON.parse(saved) : EXERCISE_DATABASE;
  });

  const [routines, setRoutines] = useState<Workout[]>(() => {
    const saved = localStorage.getItem('zfit_admin_routines');
    return saved ? JSON.parse(saved) : PUBLIC_ROUTINES;
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'coupon' | 'blog' | 'exercise' | 'routine' | null>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [selectedExerciseNames, setSelectedExerciseNames] = useState<string[]>([]);
  
  // Save Feedback States
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    localStorage.setItem('zfit_admin_coupons', JSON.stringify(coupons));
    localStorage.setItem('zfit_admin_articles', JSON.stringify(articles));
    localStorage.setItem('zfit_admin_exercises', JSON.stringify(exercises));
    localStorage.setItem('zfit_admin_routines', JSON.stringify(routines));
  }, [coupons, articles, exercises, routines]);

  const stats = [
    { label: 'Total Usuários', value: '1,284', change: '+12%', icon: Users },
    { label: 'Assinantes Pro', value: '312', change: '+18%', icon: DollarSign },
    { label: 'MRR Estimado', value: 'R$ 9.2k', change: '+22%', icon: TrendingUp },
    { label: 'Ativos Hoje', value: '452', change: '+5%', icon: Activity },
  ];

  const handleDelete = (id: string, type: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    if (type === 'coupon') setCoupons(coupons.filter(c => c.id !== id));
    if (type === 'blog') setArticles(articles.filter(a => a.id !== id));
    if (type === 'exercise') setExercises(exercises.filter((_, i) => i.toString() !== id));
    if (type === 'routine') setRoutines(routines.filter(r => r.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    // Simulação de processamento para efeito visual
    await new Promise(resolve => setTimeout(resolve, 800));

    if (modalType === 'coupon') {
      const newCoupon: Coupon = {
        id: editItem?.id || Date.now().toString(),
        code: (data.code as string).toUpperCase(),
        discount: parseFloat(data.discount as string),
        type: data.type as 'percentage' | 'fixed',
        expiresAt: data.expiresAt as string,
        status: 'active'
      };
      if (editItem) setCoupons(coupons.map(c => c.id === editItem.id ? newCoupon : c));
      else setCoupons([newCoupon, ...coupons]);
    }

    if (modalType === 'blog') {
      const newArticle: BlogArticle = {
        id: editItem?.id || Date.now().toString(),
        title: data.title as string,
        excerpt: data.excerpt as string,
        content: data.content as string,
        author: data.author as string,
        date: new Date().toLocaleDateString('pt-BR'),
        category: data.category as string,
        image: data.image as string || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800',
        readTime: '5 min'
      };
      if (editItem) setArticles(articles.map(a => a.id === editItem.id ? newArticle : a));
      else setArticles([newArticle, ...articles]);
    }

    if (modalType === 'exercise') {
      const newEx = { name: data.name as string, muscleGroup: data.muscleGroup as string };
      if (editItem) setExercises(exercises.map((ex, i) => i.toString() === editItem.id ? newEx : ex));
      else setExercises([newEx, ...exercises]);
    }

    if (modalType === 'routine') {
      const routineExercises: Exercise[] = selectedExerciseNames.map((name, i) => {
        const dbEx = exercises.find(ex => ex.name === name);
        return {
          id: `admin-ex-${Date.now()}-${i}`,
          name: name,
          muscleGroup: dbEx?.muscleGroup || 'Geral',
          sets: [{ weight: '10kg', reps: '10', difficulty: 'Normal', color: theme.primary, completed: false }]
        };
      });

      const newRoutine: Workout = {
        id: editItem?.id || `pub-${Date.now()}`,
        title: data.title as string,
        muscleGroups: Array.from(new Set(routineExercises.map(e => e.muscleGroup))),
        exercises: routineExercises,
        isPublic: true
      };

      if (editItem) setRoutines(routines.map(r => r.id === editItem.id ? newRoutine : r));
      else setRoutines([newRoutine, ...routines]);
    }

    setIsSaving(false);
    setShowSuccess(true);

    // Tempo para exibir o check de sucesso antes de fechar
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsModalOpen(false);
    setEditItem(null);
    setSelectedExerciseNames([]);
    setShowSuccess(false);
  };

  const isMint = theme.name === 'ZFIT Mint';
  const depthClass = isMint ? 'premium-depth-light' : 'premium-depth-dark';

  const renderModal = () => {
    if (!isModalOpen) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSaving && !showSuccess && setIsModalOpen(false)} />
        <div className={`relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[40px] border p-10 animate-in zoom-in-95 duration-300 hide-scrollbar ${depthClass}`} style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black uppercase tracking-tighter" style={{ color: theme.text }}>
              {editItem ? 'Editar' : 'Criar Novo'} {modalType === 'coupon' ? 'Cupom' : modalType === 'blog' ? 'Artigo' : modalType === 'routine' ? 'Treino Público' : 'Item'}
            </h3>
            <button onClick={() => setIsModalOpen(false)} disabled={isSaving || showSuccess} className="opacity-40 hover:opacity-100 transition-opacity disabled:hidden"><X /></button>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {modalType === 'coupon' && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-40 ml-4">Código do Cupom</label>
                  <input name="code" defaultValue={editItem?.code} required className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 px-6 font-black uppercase" style={{ color: theme.text }} placeholder="EX: ZFIT30" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase opacity-40 ml-4">Desconto</label>
                    <input name="discount" type="number" defaultValue={editItem?.discount} required className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 px-6 font-black" style={{ color: theme.text }} placeholder="30" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase opacity-40 ml-4">Tipo</label>
                    <select name="type" defaultValue={editItem?.type || 'percentage'} className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 px-6 font-black appearance-none" style={{ color: theme.text }}>
                      <option value="percentage">Porcentagem (%)</option>
                      <option value="fixed">Fixo (R$)</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-40 ml-4">Data de Expiração</label>
                  <input name="expiresAt" type="date" defaultValue={editItem?.expiresAt} required className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 px-6 font-black" style={{ color: theme.text }} />
                </div>
              </>
            )}

            {modalType === 'blog' && (
              <>
                <input name="title" defaultValue={editItem?.title} required placeholder="Título do Artigo" className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 px-6 font-black" style={{ color: theme.text }} />
                <input name="category" defaultValue={editItem?.category} required placeholder="Categoria (ex: Treino, Nutrição)" className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 px-6 font-black" style={{ color: theme.text }} />
                <input name="image" defaultValue={editItem?.image} placeholder="URL da Imagem (Unsplash recomendada)" className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 px-6 font-black" style={{ color: theme.text }} />
                <textarea name="excerpt" defaultValue={editItem?.excerpt} required placeholder="Resumo curto..." className="w-full h-24 rounded-2xl bg-white/5 border border-white/10 p-6 font-medium text-sm" style={{ color: theme.text }} />
                <textarea name="content" defaultValue={editItem?.content} required placeholder="Conteúdo completo em texto..." className="w-full h-40 rounded-2xl bg-white/5 border border-white/10 p-6 font-medium text-sm" style={{ color: theme.text }} />
                <input name="author" defaultValue={editItem?.author || 'ZFIT Admin'} required placeholder="Autor" className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 px-6 font-black" style={{ color: theme.text }} />
              </>
            )}

            {modalType === 'exercise' && (
              <>
                <input name="name" defaultValue={editItem?.name} required placeholder="Nome do Exercício" className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 px-6 font-black" style={{ color: theme.text }} />
                <input name="muscleGroup" defaultValue={editItem?.muscleGroup} required placeholder="Grupo Muscular" className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 px-6 font-black" style={{ color: theme.text }} />
              </>
            )}

            {modalType === 'routine' && (
              <div className="space-y-6">
                <input name="title" defaultValue={editItem?.title} required placeholder="Título da Rotina Pública" className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 px-6 font-black uppercase" style={{ color: theme.text }} />
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-40 ml-4">Selecionar Exercícios</label>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 hide-scrollbar">
                    {exercises.map((ex, i) => {
                      const isSelected = selectedExerciseNames.includes(ex.name);
                      return (
                        <button 
                          type="button"
                          key={i}
                          disabled={isSaving || showSuccess}
                          onClick={() => setSelectedExerciseNames(prev => isSelected ? prev.filter(n => n !== ex.name) : [...prev, ex.name])}
                          className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isSelected ? 'bg-white/10 border-white/20' : 'bg-white/5 border-transparent'}`}
                        >
                          <span className="text-[11px] font-black uppercase" style={{ color: theme.text }}>{ex.name}</span>
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-white/10'}`} style={isSelected ? { backgroundColor: theme.primary, borderColor: theme.primary } : {}}>
                            {isSelected && <Check size={14} className="text-black" strokeWidth={4} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isSaving || showSuccess}
              className={`w-full h-16 rounded-3xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl relative overflow-hidden ${showSuccess ? 'bg-[#adf94e]/20 text-[#adf94e]' : ''}`} 
              style={{ backgroundColor: showSuccess ? undefined : theme.primary, color: showSuccess ? undefined : (isMint ? '#FFF' : '#000') }}
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Salvando...
                </div>
              ) : showSuccess ? (
                <div className="flex items-center gap-2 animate-in fade-in duration-500">
                  <Check size={18} strokeWidth={3} />
                  Salvo com Sucesso!
                </div>
              ) : (
                <>
                  <Save size={18} /> Salvar Alterações
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  };

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const IconComponent = stat.icon;
          return (
            <div key={i} className={`rounded-[35px] p-6 border flex flex-col justify-between h-44 transition-all hover:border-white/10 ${depthClass}`} style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}>
                  <IconComponent size={20} />
                </div>
                <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-[#adf94e]/10 text-[#adf94e] text-[8px] font-black uppercase">
                  <ArrowUpRight size={10} />
                  <span>{stat.change}</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-30 block mb-1" style={{ color: theme.text }}>{stat.label}</span>
                <h4 className="text-3xl font-black tracking-tighter uppercase" style={{ color: theme.text }}>{stat.value}</h4>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderSaaSManagement = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={`rounded-[45px] border overflow-hidden ${depthClass}`} style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="p-8 border-b flex justify-between items-center" style={{ borderColor: theme.border }}>
          <div><h3 className="text-2xl font-black uppercase tracking-tighter" style={{ color: theme.text }}>Cupons de Desconto</h3></div>
          <button onClick={() => { setEditItem(null); setModalType('coupon'); setIsModalOpen(true); }} className="h-12 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all" style={{ backgroundColor: theme.primary, color: isMint ? '#FFF' : '#000' }}><Plus size={16} /> Novo Cupom</button>
        </div>
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: theme.text }}><tr className="border-b" style={{ borderColor: theme.border }}><th className="px-8 py-5">Código</th><th className="px-8 py-5">Desconto</th><th className="px-8 py-5">Status</th><th className="px-8 py-5 text-right">Ações</th></tr></thead>
          <tbody className="divide-y divide-white/5" style={{ borderColor: theme.border }}>
            {coupons.map(coupon => (
              <tr key={coupon.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-8 py-6 flex items-center gap-3"><Ticket size={18} style={{ color: theme.primary }} /><span className="text-xs font-black uppercase" style={{ color: theme.text }}>{coupon.code}</span></td>
                <td className="px-8 py-6 font-black text-xs" style={{ color: theme.text }}>{coupon.discount}{coupon.type === 'percentage' ? '%' : ' R$'}</td>
                <td className="px-8 py-6"><span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${coupon.status === 'active' ? 'bg-[#adf94e]/10 text-[#adf94e]' : 'bg-red-500/10 text-red-500'}`}>{coupon.status === 'active' ? 'Ativo' : 'Expirado'}</span></td>
                <td className="px-8 py-6 text-right"><div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => { setEditItem(coupon); setModalType('coupon'); setIsModalOpen(true); }} className="p-2 hover:bg-white/10 rounded-lg" style={{ color: theme.text }}><Edit3 size={16} /></button><button onClick={() => handleDelete(coupon.id, 'coupon')} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg"><Trash2 size={16} /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderContentManagement = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex bg-white/5 p-1.5 rounded-3xl border border-white/5 mb-8" style={{ borderColor: theme.border }}>
        {(['blog', 'exercises', 'routines'] as ContentSubTab[]).map(tab => (
          <button key={tab} onClick={() => setContentSubTab(tab)} className={`flex-1 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${contentSubTab === tab ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'}`} style={contentSubTab === tab ? { backgroundColor: theme.primary, color: isMint ? '#FFF' : '#000' } : {}}>
            {tab === 'blog' ? 'Blog' : tab === 'exercises' ? 'Exercícios' : 'Rotinas'}
          </button>
        ))}
      </div>

      <div className={`rounded-[45px] border overflow-hidden ${depthClass}`} style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <div className="p-8 border-b flex justify-between items-center" style={{ borderColor: theme.border }}>
          <h3 className="text-2xl font-black uppercase tracking-tighter" style={{ color: theme.text }}>{contentSubTab === 'blog' ? 'Gestão de Artigos' : contentSubTab === 'exercises' ? 'Base de Dados' : 'Treinos Públicos'}</h3>
          <button onClick={() => { 
            setEditItem(null); 
            setSelectedExerciseNames([]);
            setModalType(contentSubTab === 'blog' ? 'blog' : contentSubTab === 'exercises' ? 'exercise' : 'routine'); 
            setIsModalOpen(true); 
          }} className="h-12 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2" style={{ backgroundColor: theme.primary, color: isMint ? '#FFF' : '#000' }}><Plus size={16} /> Novo Item</button>
        </div>

        <div className="p-4 space-y-4">
          {contentSubTab === 'blog' && articles.map(article => (
            <div key={article.id} className="flex items-center justify-between p-6 rounded-[30px] bg-white/5 hover:bg-white/10 transition-colors group">
              <div className="flex items-center gap-6">
                <img src={article.image} className="w-16 h-16 rounded-2xl object-cover" />
                <div>
                  <h4 className="text-sm font-black uppercase" style={{ color: theme.text }}>{article.title}</h4>
                  <p className="text-[9px] font-black opacity-30 uppercase">{article.category} • {article.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditItem(article); setModalType('blog'); setIsModalOpen(true); }} className="p-3 bg-white/10 rounded-xl" style={{ color: theme.text }}><Edit3 size={18} /></button>
                <button onClick={() => handleDelete(article.id, 'blog')} className="p-3 bg-red-500/10 text-red-500 rounded-xl"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}

          {contentSubTab === 'exercises' && exercises.map((ex, i) => (
            <div key={i} className="flex items-center justify-between p-6 rounded-[30px] bg-white/5 hover:bg-white/10 transition-colors group">
              <div>
                <h4 className="text-sm font-black uppercase" style={{ color: theme.text }}>{ex.name}</h4>
                <p className="text-[9px] font-black opacity-30 uppercase">{ex.muscleGroup}</p>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditItem({...ex, id: i.toString()}); setModalType('exercise'); setIsModalOpen(true); }} className="p-3 bg-white/10 rounded-xl" style={{ color: theme.text }}><Edit3 size={18} /></button>
                <button onClick={() => handleDelete(i.toString(), 'exercise')} className="p-3 bg-red-500/10 text-red-500 rounded-xl"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
          
          {contentSubTab === 'routines' && routines.map(r => (
            <div key={r.id} className="flex items-center justify-between p-6 rounded-[30px] bg-white/5 hover:bg-white/10 transition-colors group">
              <div>
                <h4 className="text-sm font-black uppercase" style={{ color: theme.text }}>{r.title}</h4>
                <p className="text-[9px] font-black opacity-30 uppercase">{r.muscleGroups.join(' • ')} • {r.exercises.length} Exs</p>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => { 
                    setEditItem(r); 
                    setModalType('routine'); 
                    setSelectedExerciseNames(r.exercises.map(e => e.name));
                    setIsModalOpen(true); 
                  }} 
                  className="p-3 bg-white/10 rounded-xl" style={{ color: theme.text }}
                >
                  <Edit3 size={18} />
                </button>
                <button className="p-3 bg-red-500/10 text-red-500 rounded-xl" onClick={() => handleDelete(r.id, 'routine')}><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="px-6 pb-24 max-w-7xl mx-auto">
      {renderModal()}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck size={24} style={{ color: theme.primary }} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40" style={{ color: theme.text }}>Admin Panel v3.0</span>
          </div>
          <h2 className="text-5xl font-black tracking-tighter leading-[0.8] uppercase" style={{ color: theme.text }}>PLATAFORMA<br/>ADMIN</h2>
        </div>

        <div className="flex bg-white/5 p-1.5 rounded-3xl border border-white/5" style={{ borderColor: theme.border }}>
          {(['overview', 'saas', 'content'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'}`} style={activeTab === tab ? { backgroundColor: theme.primary, color: isMint ? '#FFF' : '#000' } : {}}>
              {tab === 'overview' ? 'Geral' : tab === 'saas' ? 'SaaS / Cupons' : 'Conteúdo'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'saas' && renderSaaSManagement()}
      {activeTab === 'content' && renderContentManagement()}
    </div>
  );
};

export default AdminDashboard;
