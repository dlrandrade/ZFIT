
import React from 'react';
import { ChevronLeft, Check, Zap, Crown, ShieldCheck, ArrowRight, Star, TestTube2 } from 'lucide-react';
import { User } from '../types';

interface PricingPageProps {
  theme: any;
  user?: User | null;
  onBack: () => void;
  onSelectPlan: (planId: string) => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ theme, user, onBack, onSelectPlan }) => {
  const isMint = theme.name === 'ZFIT Mint';
  
  const getKiwifyLink = (baseUrl: string) => {
    if (!user?.email) return baseUrl;
    const connector = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${connector}email=${encodeURIComponent(user.email)}`;
  };

  const simulateSuccess = (plan: 'pro' | 'elite') => {
    // Simula o redirecionamento que a Kiwify faria
    const currentUrl = window.location.origin + window.location.pathname;
    window.location.href = `${currentUrl}?status=success&plan=${plan}`;
  };

  const plans = [
    {
      id: 'pro',
      name: 'ZFIT PRO',
      price: 'R$ 29,90',
      period: '/mês',
      description: 'Perfeito para quem está começando a levar o treino a sério.',
      features: [
        'Rotinas Personalizadas Ilimitadas',
        'Histórico Completo de Treinos',
        'Análise de Volume por Músculo',
        'Suporte via Comunidade',
      ],
      cta: 'ASSINAR PRO AGORA',
      highlight: false,
      kiwifyLink: 'https://pay.kiwify.com.br/NpGpQ0g' 
    },
    {
      id: 'elite',
      name: 'ZFIT ELITE',
      price: 'R$ 297,00',
      period: '/ano',
      description: 'O nível máximo de performance e acompanhamento estético.',
      features: [
        'Tudo do Plano PRO',
        'Acesso Antecipado a Novos Artigos',
        'Consultoria de Macro-Nutrientes',
        'Badge de Membro Elite no Perfil',
        'Economia de 2 meses',
      ],
      cta: 'VIRAR ATLETA ELITE',
      highlight: true,
      kiwifyLink: 'https://pay.kiwify.com.br/P3uJvej'
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] animate-in fade-in slide-in-from-bottom-6 duration-700 pb-32">
      <header className="p-6 flex items-center justify-between sticky top-0 bg-[#050505]/90 backdrop-blur-xl z-30">
        <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <ChevronLeft size={24} />
        </button>
        <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Upgrade de Performance</span>
        <div className="w-12" />
      </header>

      <div className="px-6 mt-8 max-w-2xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-5xl font-black tracking-tighter uppercase leading-[0.85]">ESCOLHA SEU<br/>NÍVEL DE ELITE</h2>
          <p className="text-[11px] font-medium opacity-50 max-w-[280px] mx-auto leading-relaxed">
            Libere ferramentas avançadas de análise e consistência para acelerar seus resultados.
          </p>
        </div>

        <div className="space-y-6">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative rounded-[45px] p-8 border transition-all duration-500 overflow-hidden ${
                plan.highlight ? 'border-[#adf94e]/30' : 'border-white/5 bg-white/[0.02]'
              }`}
              style={plan.highlight ? { backgroundColor: `${theme.primary}05` } : {}}
            >
              {plan.highlight && (
                <div className="absolute top-6 right-8 bg-[#adf94e] text-black px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1 shadow-[0_0_20px_rgba(173,249,78,0.4)]">
                  <Star size={10} fill="black" /> Melhor Valor
                </div>
              )}

              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  {plan.id === 'elite' ? <Crown size={18} className="text-[#adf94e]" /> : <Zap size={18} className="text-[#adf94e]" />}
                  <h3 className="text-2xl font-black tracking-tighter uppercase">{plan.name}</h3>
                </div>
                <p className="text-[10px] font-medium opacity-40 leading-relaxed mb-6">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black tracking-tighter">{plan.price}</span>
                  <span className="text-xs font-black opacity-30">{plan.period}</span>
                </div>
              </div>

              <div className="space-y-4 mb-10">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#adf94e]/10 flex items-center justify-center border border-[#adf94e]/20">
                      <Check size={10} className="text-[#adf94e]" strokeWidth={4} />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-tight opacity-70">{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => window.open(getKiwifyLink(plan.kiwifyLink), '_blank')}
                className={`w-full h-16 rounded-3xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl ${
                  plan.highlight ? 'bg-[#adf94e] text-black' : 'bg-white/10 text-white'
                }`}
              >
                {plan.cta} <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Sandbox de Testes (Apenas visível em desenvolvimento) */}
        <div className="mt-20 p-8 rounded-[40px] border border-dashed border-white/10 bg-white/[0.02]">
           <div className="flex items-center gap-3 mb-6">
             <TestTube2 size={18} className="text-[#adf94e] opacity-40" />
             <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">Sandbox de Testes</h4>
           </div>
           <p className="text-[9px] font-medium opacity-30 mb-6 uppercase tracking-tight">Use estes botões para testar a ativação dos planos sem realizar um pagamento real na Kiwify.</p>
           <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => simulateSuccess('pro')}
                className="h-12 rounded-2xl border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
              >
                Simular PRO
              </button>
              <button 
                onClick={() => simulateSuccess('elite')}
                className="h-12 rounded-2xl border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
              >
                Simular ELITE
              </button>
           </div>
        </div>

        <div className="mt-8 p-8 rounded-[35px] border border-white/5 bg-white/[0.01] flex items-center gap-5">
           <div className="w-12 h-12 rounded-2xl bg-[#adf94e]/10 flex items-center justify-center text-[#adf94e]">
             <ShieldCheck size={24} />
           </div>
           <div>
             <h4 className="text-[10px] font-black uppercase tracking-widest">Pagamento Seguro via Kiwify</h4>
             <p className="text-[9px] font-medium opacity-30 mt-1 uppercase">Acesso imediato após aprovação • Cancele quando quiser</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
