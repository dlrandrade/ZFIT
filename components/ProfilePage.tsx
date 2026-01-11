
import React, { useState } from 'react';
import { 
  Settings, 
  ChevronRight, 
  ShieldCheck, 
  CreditCard, 
  Bell, 
  HelpCircle, 
  LogOut, 
  Award, 
  Zap, 
  Scale,
  Ruler,
  TrendingUp,
  Save
} from 'lucide-react';
import { Workout, User } from '../types';

interface ProfilePageProps {
  theme: any;
  user: User | null;
  history: Workout[];
  onLogout?: () => void;
  onUpdateUser: (userData: User) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ theme, user, history, onLogout, onUpdateUser }) => {
  const [isEditingMetrics, setIsEditingMetrics] = useState(false);
  const [weight, setWeight] = useState(user?.weight?.toString() || '');
  const [height, setHeight] = useState(user?.height?.toString() || '');

  const settingsItems = [
    { icon: <ShieldCheck size={20} />, label: 'Privacidade e Segurança', subtitle: 'Gerencie seus dados e acesso' },
    { icon: <CreditCard size={20} />, label: 'Assinatura ZFIT Pro', subtitle: user?.plan || 'Plano Gratuito' },
    { icon: <Bell size={20} />, label: 'Notificações', subtitle: 'Configurações de alerta' },
    { icon: <HelpCircle size={20} />, label: 'Suporte', subtitle: 'Centro de ajuda' },
  ];

  const handleSaveMetrics = () => {
    if (!user) return;
    const newWeight = parseFloat(weight);
    const newHeight = parseFloat(height);
    
    const newHistory = [...(user.weightHistory || [])];
    if (!isNaN(newWeight)) {
      newHistory.push({ date: new Date().toISOString(), weight: newWeight });
    }

    onUpdateUser({
      ...user,
      weight: !isNaN(newWeight) ? newWeight : user.weight,
      height: !isNaN(newHeight) ? newHeight : user.height,
      weightHistory: newHistory.slice(-10) // Mantém os últimos 10 registros
    });
    setIsEditingMetrics(false);
  };

  const totalWorkouts = history.length;
  const currentLevel = Math.floor(totalWorkouts / 5) + 1;
  const weightData = user?.weightHistory || [];

  return (
    <div className="px-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10 flex justify-between items-center">
        <h2 className="text-4xl font-black tracking-tighter leading-[0.8] uppercase" style={{ color: theme.text }}>
          PERFIL DO<br/>USUÁRIO
        </h2>
        <button className="w-12 h-12 rounded-2xl flex items-center justify-center border" style={{ backgroundColor: theme.cardSecondary, borderColor: theme.border, color: theme.text }}>
          <Settings size={22} />
        </button>
      </div>

      <div className="flex flex-col items-center mb-10 mt-4">
        <div className="relative mb-6">
          <div className="w-32 h-32 rounded-[40px] border-4 overflow-hidden shadow-2xl relative z-10 flex items-center justify-center" style={{ backgroundColor: theme.cardSecondary, borderColor: theme.card }}>
            <img 
              src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=ZFIT"} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          <div 
            className="absolute -inset-4 blur-2xl opacity-10 pointer-events-none" 
            style={{ backgroundColor: theme.primary }} 
          />
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg z-20 border-4" style={{ backgroundColor: theme.primary, borderColor: theme.bg, color: theme.name === 'ZFIT Mint' ? '#FFF' : '#000' }}>
            <Zap size={18} fill="currentColor" strokeWidth={0} />
          </div>
        </div>
        
        <h2 className="text-3xl font-black tracking-tighter uppercase mb-1" style={{ color: theme.text }}>{user?.name || 'Atleta'}</h2>
        <div className="flex items-center space-x-2 px-4 py-1.5 rounded-full border" style={{ backgroundColor: theme.cardSecondary, borderColor: theme.border }}>
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: theme.primary }}>Membro {user?.plan || 'Free'}</span>
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: theme.textSecondary }} />
          <span className="text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: theme.text }}>Lv. {currentLevel}</span>
        </div>
      </div>

      {/* Bio-Metrics Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-[#111111] rounded-[35px] p-6 border transition-all duration-500" style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}>
           <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-2">
               <Scale size={18} className="opacity-30" />
               <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Bio-Métricas</span>
             </div>
             <button 
               onClick={() => isEditingMetrics ? handleSaveMetrics() : setIsEditingMetrics(true)}
               className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5"
               style={{ color: theme.primary }}
             >
               {isEditingMetrics ? <><Save size={12} /> Salvar</> : <><TrendingUp size={12} /> Atualizar</>}
             </button>
           </div>
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
               <span className="text-[8px] font-black uppercase opacity-20 block">Peso</span>
               {isEditingMetrics ? (
                 <input 
                   type="number" 
                   value={weight} 
                   onChange={(e) => setWeight(e.target.value)}
                   className="bg-white/5 border border-white/10 rounded-xl w-full h-10 px-3 font-black text-sm outline-none focus:border-primary"
                   style={{ color: theme.text }}
                 />
               ) : (
                 <h4 className="text-2xl font-black tracking-tighter">{user?.weight || '--'} <span className="text-xs opacity-20">kg</span></h4>
               )}
             </div>
             <div className="space-y-1">
               <span className="text-[8px] font-black uppercase opacity-20 block">Altura</span>
               {isEditingMetrics ? (
                 <input 
                   type="number" 
                   value={height} 
                   onChange={(e) => setHeight(e.target.value)}
                   className="bg-white/5 border border-white/10 rounded-xl w-full h-10 px-3 font-black text-sm outline-none focus:border-primary"
                   style={{ color: theme.text }}
                 />
               ) : (
                 <h4 className="text-2xl font-black tracking-tighter">{user?.height || '--'} <span className="text-xs opacity-20">cm</span></h4>
               )}
             </div>
           </div>
        </div>

        <div className="bg-[#111111] rounded-[35px] p-6 border" style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}>
          <span className="text-[10px] font-black uppercase tracking-widest opacity-30 block mb-4">Progresso de Peso</span>
          <div className="flex items-end justify-between h-20 gap-1.5 px-1">
            {weightData.length > 0 ? (
              weightData.map((entry, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                   <div 
                     className="w-full rounded-full transition-all duration-700 bg-primary opacity-20 group-hover:opacity-100"
                     style={{ height: `${(entry.weight / 150) * 100}%`, backgroundColor: theme.primary }}
                   />
                </div>
              ))
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-10 italic text-[10px] font-black uppercase">
                Aguardando dados...
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-10">
        <div className="rounded-[30px] p-5 border flex flex-col items-center text-center" style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}>
          <span className="text-xl font-black tracking-tighter uppercase">{totalWorkouts}</span>
          <span className="text-[8px] font-black uppercase tracking-widest opacity-30 mt-1 leading-tight">Treinos</span>
        </div>
        <div className="rounded-[30px] p-5 border flex flex-col items-center text-center" style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}>
          <span className="text-xl font-black tracking-tighter uppercase">{user?.xp || 0}</span>
          <span className="text-[8px] font-black uppercase tracking-widest opacity-30 mt-1 leading-tight">XP</span>
        </div>
        <div className="rounded-[30px] p-5 border flex flex-col items-center text-center" style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}>
          <span className="text-xl font-black tracking-tighter uppercase">{Math.floor((user?.xp || 0) / 100)}</span>
          <span className="text-[8px] font-black uppercase tracking-widest opacity-30 mt-1 leading-tight">Medalhas</span>
        </div>
      </div>

      <div className="space-y-3 mb-12">
        {settingsItems.map((item, i) => (
          <button 
            key={i} 
            className="w-full h-20 px-6 rounded-[35px] border flex items-center justify-between group active:scale-[0.98] transition-all"
            style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
          >
            <div className="flex items-center space-x-4">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center transition-colors" style={{ backgroundColor: theme.cardSecondary, color: theme.textSecondary }}>
                {item.icon}
              </div>
              <div className="text-left">
                <h4 className="font-black uppercase text-xs tracking-tighter">{item.label}</h4>
                <p className="text-[9px] font-black opacity-30 uppercase tracking-widest mt-0.5">{item.subtitle}</p>
              </div>
            </div>
            <ChevronRight size={18} className="opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </button>
        ))}
        
        {onLogout && (
          <button 
            onClick={onLogout}
            className="w-full h-20 px-6 bg-red-500/5 rounded-[35px] border border-red-500/10 flex items-center justify-between group active:scale-[0.98] transition-all mt-8"
          >
            <div className="flex items-center space-x-4 text-red-500">
              <div className="w-11 h-11 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <LogOut size={20} />
              </div>
              <div className="text-left">
                <h4 className="font-black uppercase text-xs tracking-tighter">Sair da Conta</h4>
                <p className="text-[9px] font-black opacity-40 uppercase tracking-widest mt-0.5">Até o próximo treino!</p>
              </div>
            </div>
          </button>
        )}
      </div>

      <div className="text-center pb-8">
        <p className="text-[8px] font-black uppercase tracking-[0.5em] opacity-10" style={{ color: theme.text }}>ZFIT PWA • Versão 2.6.0</p>
      </div>
    </div>
  );
};

export default ProfilePage;
