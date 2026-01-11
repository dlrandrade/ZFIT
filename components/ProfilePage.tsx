import React, { useState, useRef } from 'react';
import { 
  Settings, 
  ChevronRight, 
  ShieldCheck, 
  CreditCard, 
  Bell, 
  HelpCircle, 
  LogOut, 
  Zap, 
  Scale,
  TrendingUp,
  Save,
  Crown,
  Sparkles,
  RotateCcw,
  X,
  Camera,
  Upload,
  Loader2
} from 'lucide-react';
import { Workout, User } from '../types';

interface ProfilePageProps {
  theme: any;
  user: User | null;
  history: Workout[];
  onLogout?: () => void;
  onUpdateUser: (userData: User) => void;
  onOpenPricing?: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ theme, user, history, onLogout, onUpdateUser, onOpenPricing }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [weight, setWeight] = useState(user?.weight?.toString() || '');
  const [height, setHeight] = useState(user?.height?.toString() || '');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isElite = user?.plan === 'Elite';
  const isPro = user?.plan === 'Pro';

  const settingsItems = [
    { icon: <ShieldCheck size={20} />, label: 'Privacidade e Segurança', subtitle: 'Gerencie seus dados e acesso' },
    { icon: <CreditCard size={20} />, label: 'Minha Assinatura', subtitle: user?.plan || 'Plano Gratuito' },
    { icon: <Bell size={20} />, label: 'Notificações', subtitle: 'Configurações de alerta' },
    { icon: <HelpCircle size={20} />, label: 'Suporte', subtitle: 'Centro de ajuda' },
  ];

  const handleSaveProfile = () => {
    if (!user) return;
    const newWeight = parseFloat(weight);
    const newHeight = parseFloat(height);
    
    const newHistory = [...(user.weightHistory || [])];
    if (!isNaN(newWeight) && newWeight !== user.weight) {
      newHistory.push({ date: new Date().toISOString(), weight: newWeight });
    }

    onUpdateUser({
      ...user,
      name: name || user.name,
      weight: !isNaN(newWeight) ? newWeight : user.weight,
      height: !isNaN(newHeight) ? newHeight : user.height,
      weightHistory: newHistory.slice(-10) 
    });
    setIsEditing(false);
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    setIsUploadingPhoto(true);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onUpdateUser({
          ...user,
          avatar: base64
        });
        setIsUploadingPhoto(false);
      };
      reader.onerror = () => {
        alert('Erro ao processar a imagem.');
        setIsUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setIsUploadingPhoto(false);
    }
  };

  const triggerPhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const resetPlan = () => {
    if (!user) return;
    onUpdateUser({ ...user, plan: 'Free' });
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
        <button 
          onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
          className="w-12 h-12 rounded-2xl flex items-center justify-center border transition-all active:scale-95" 
          style={{ backgroundColor: isEditing ? theme.primary : theme.cardSecondary, borderColor: theme.border, color: isEditing ? (theme.name === 'ZFIT Mint' ? '#FFF' : '#000') : theme.text }}
        >
          {isEditing ? <Save size={22} /> : <Settings size={22} />}
        </button>
      </div>

      <input 
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />

      <div className="flex flex-col items-center mb-10 mt-4">
        <div className="relative mb-6">
          <div className="w-32 h-32 rounded-[40px] border-4 overflow-hidden shadow-2xl relative z-10 flex items-center justify-center" style={{ backgroundColor: theme.cardSecondary, borderColor: theme.card }}>
            {isUploadingPhoto ? (
              <Loader2 size={32} className="animate-spin" style={{ color: theme.primary }} />
            ) : (
              <img 
                src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=ZFIT"} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div 
            className={`absolute -inset-4 blur-2xl opacity-10 pointer-events-none ${isElite ? 'opacity-30' : ''}`} 
            style={{ backgroundColor: theme.primary }} 
          />
          
          {isEditing ? (
            <button 
              onClick={triggerPhotoUpload}
              disabled={isUploadingPhoto}
              className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg z-20 border-4 transition-all active:scale-90 hover:scale-105"
              style={{ backgroundColor: '#FFFFFF', borderColor: theme.bg, color: '#000000' }}
              title="Alterar foto de perfil"
            >
              <Camera size={18} />
            </button>
          ) : (
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg z-20 border-4" style={{ backgroundColor: theme.primary, borderColor: theme.bg, color: theme.name === 'ZFIT Mint' ? '#FFF' : '#000' }}>
              {isElite ? <Crown size={18} fill="currentColor" strokeWidth={0} /> : <Zap size={18} fill="currentColor" strokeWidth={0} />}
            </div>
          )}
        </div>
        
        {isEditing ? (
          <div className="w-full max-w-[240px] mb-4 space-y-3">
             <div>
               <span className="text-[8px] font-black uppercase opacity-20 block mb-1 text-center">Nome Público</span>
               <input 
                 type="text" 
                 value={name} 
                 onChange={(e) => setName(e.target.value)}
                 className="bg-white/5 border border-white/10 rounded-xl w-full h-12 px-4 font-black text-center text-lg outline-none focus:border-primary uppercase tracking-tighter"
                 style={{ color: theme.text }}
               />
             </div>
             <button
               onClick={triggerPhotoUpload}
               disabled={isUploadingPhoto}
               className="w-full h-12 rounded-xl border border-dashed border-white/20 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 hover:border-white/40 transition-all"
               style={{ color: theme.text }}
             >
               {isUploadingPhoto ? (
                 <Loader2 size={14} className="animate-spin" />
               ) : (
                 <>
                   <Upload size={14} />
                   Alterar Foto
                 </>
               )}
             </button>
           </div>
        ) : (
          <h2 className="text-3xl font-black tracking-tighter uppercase mb-1" style={{ color: theme.text }}>{user?.name || 'Atleta'}</h2>
        )}

        <div className="flex items-center space-x-2 px-4 py-1.5 rounded-full border" style={{ backgroundColor: theme.cardSecondary, borderColor: theme.border }}>
          <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${isElite ? 'text-[#adf94e]' : ''}`} style={{ color: isElite ? undefined : theme.primary }}>
            {isElite && <Sparkles size={10} />}
            Membro {user?.plan || 'Free'}
          </span>
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: theme.textSecondary }} />
          <span className="text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: theme.text }}>Lv. {currentLevel}</span>
        </div>
      </div>

      {!isElite ? (
        <div 
          onClick={onOpenPricing}
          className="mb-8 p-6 rounded-[40px] border relative overflow-hidden cursor-pointer group active:scale-[0.98] transition-all"
          style={{ backgroundColor: `${theme.primary}10`, borderColor: `${theme.primary}30` }}
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#adf94e] opacity-20 blur-3xl group-hover:opacity-40 transition-opacity" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#adf94e] flex items-center justify-center text-black shadow-[0_10px_20px_rgba(173,249,78,0.3)]">
                <Crown size={24} />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-tighter">{isPro ? 'Upgrade para Elite' : 'Seja Membro Elite'}</h4>
                <p className="text-[9px] font-black uppercase opacity-40 tracking-widest">{isPro ? 'Libere consultoria e benefícios extras' : 'Libere todos os treinos agora'}</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-[#adf94e]" />
          </div>
        </div>
      ) : (
        <div className="mb-8 p-6 rounded-[40px] border border-[#adf94e]/30 bg-[#adf94e]/5 relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#adf94e]/20 border border-[#adf94e]/30 flex items-center justify-center text-[#adf94e]">
               <Sparkles size={24} />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-tighter text-white">Você é Elite</h4>
              <p className="text-[9px] font-black uppercase opacity-40 tracking-widest text-[#adf94e]">Acesso total desbloqueado</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-[#111111] rounded-[35px] p-6 border transition-all duration-500" style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}>
           <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-2">
               <Scale size={18} className="opacity-30" />
               <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Bio-Métricas</span>
             </div>
             {isEditing && (
               <button 
                 onClick={handleSaveProfile}
                 className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5"
                 style={{ color: theme.primary }}
               >
                 <Save size={12} /> Salvar Tudo
               </button>
             )}
             {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5"
                  style={{ color: theme.primary }}
                >
                  <TrendingUp size={12} /> Atualizar
                </button>
             )}
           </div>
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
               <span className="text-[8px] font-black uppercase opacity-20 block">Peso</span>
               {isEditing ? (
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
               {isEditing ? (
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
        {(isElite || isPro) && (
          <button 
            onClick={resetPlan}
            className="w-full h-20 px-6 rounded-[35px] border border-dashed border-white/10 flex items-center justify-between group active:scale-[0.98] transition-all bg-white/[0.02]"
            style={{ color: theme.text }}
          >
            <div className="flex items-center space-x-4">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-white/5 text-white/40">
                <RotateCcw size={20} />
              </div>
              <div className="text-left">
                <h4 className="font-black uppercase text-xs tracking-tighter">Resetar para Plano Free</h4>
                <p className="text-[9px] font-black opacity-30 uppercase tracking-widest mt-0.5">Apenas para fins de teste</p>
              </div>
            </div>
          </button>
        )}
        
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
        <p className="text-[8px] font-black uppercase tracking-[0.5em] opacity-10" style={{ color: theme.text }}>ZFIT PWA • Versão 2.6.1</p>
      </div>
    </div>
  );
};

export default ProfilePage;
