
import React, { useState, useEffect, useRef } from 'react';
import { Zap, MessageCircle, Heart, Share2, Flame, Clock } from 'lucide-react';
import { SocialPost } from '../types';

interface FeedCardProps {
  post: SocialPost;
  primaryColor: string;
  onLike: () => void;
  theme: any;
  index: number;
}

const FeedCard: React.FC<FeedCardProps> = ({ post, primaryColor, onLike, theme, index }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isTopShareHovered, setIsTopShareHovered] = useState(false);
  const [isBottomShareHovered, setIsBottomShareHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const isMint = theme.name === 'ZFIT Mint';
  const depthClass = isMint ? 'premium-depth-light' : 'premium-depth-dark';

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { 
        threshold: 0.05, 
        rootMargin: '20px' 
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: 'ZFIT | Evolução no Treino',
      text: `🔥 Olha esse treino de ${post.user.name}! 
Sessão: ${post.workoutTitle}
Queima: ${post.calories}
Intensidade: ${post.intensity}%
Treine com elite no ZFIT.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.debug('Compartilhamento cancelado ou falhou', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
        alert('Resumo do treino copiado! Agora você pode colar onde quiser.');
      } catch (err) {
        alert('Não foi possível compartilhar no momento.');
      }
    }
  };

  return (
    <div 
      ref={cardRef}
      className={`rounded-[40px] border mb-6 overflow-hidden transition-all duration-500 ease-out cursor-pointer ${depthClass} 
        ${isVisible ? 'animate-reveal' : 'opacity-0 translate-y-[60px] scale-[0.96] blur-[8px]'} 
        hover:scale-[1.015] hover:opacity-100 opacity-90 hover:shadow-2xl active:scale-[0.99] group`}
      style={{ 
        backgroundColor: theme.card, 
        borderColor: theme.border, 
        color: theme.text,
        animationDelay: `${Math.min(index * 80, 480)}ms` 
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img src={post.user.avatar} className="w-10 h-10 rounded-full border-2 border-white/10 object-cover" alt={post.user.name} />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#adf94e] border-2 border-[#111111] flex items-center justify-center">
               <span className="text-[6px] font-black text-black">LV</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-black tracking-tight uppercase">{post.user.name}</h4>
            <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.2em]">{post.timestamp}</p>
          </div>
        </div>
        
        {/* Botão de Compartilhar Superior - Agora visível em todos os tamanhos */}
        <button 
          onClick={(e) => { e.stopPropagation(); handleShare(); }}
          onMouseEnter={() => setIsTopShareHovered(true)}
          onMouseLeave={() => setIsTopShareHovered(false)}
          className="bg-white/5 w-11 h-11 rounded-2xl border border-white/5 active:scale-90 hover:bg-white/10 transition-all flex items-center justify-center shadow-lg"
          title="Compartilhar Treino"
        >
           <Share2 
            size={18} 
            className={`transition-all duration-300 ${isTopShareHovered ? 'scale-110 opacity-100' : 'opacity-60'}`} 
            style={{ color: isTopShareHovered ? primaryColor : 'inherit' }}
           />
        </button>
      </div>

      {/* Post Content */}
      <div className="px-6 pb-2">
        <div className="rounded-[35px] p-6 mb-4 border relative overflow-hidden bg-white/[0.02] transition-colors group-hover:bg-white/[0.04]" style={{ borderColor: theme.border }}>
          <div className="flex justify-between items-start mb-6">
             <div>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 block mb-1">Resumo da Sessão</span>
                <h3 className="text-2xl font-black tracking-tighter leading-tight uppercase">{post.workoutTitle}</h3>
             </div>
             <div className="w-11 h-11 rounded-2xl flex items-center justify-center border transition-transform group-hover:rotate-12" style={{ backgroundColor: `${primaryColor}10`, borderColor: theme.border }}>
                <Zap size={20} style={{ color: primaryColor }} />
             </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-4">
              <div className="flex items-center space-x-1.5">
                <Flame size={14} style={{ color: primaryColor }} />
                <span className="text-sm font-black tracking-tighter uppercase">{post.calories}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Clock size={14} style={{ color: primaryColor }} />
                <span className="text-sm font-black tracking-tighter uppercase">{post.duration}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-black tracking-tighter leading-none" style={{ color: primaryColor }}>{post.intensity}%</span>
            </div>
          </div>

          <div className="flex items-end space-x-1 h-6 opacity-10">
            {Array.from({ length: 24 }).map((_, i) => (
              <div 
                key={i} 
                style={{ height: `${20 + Math.random() * 80}%`, backgroundColor: primaryColor }} 
                className="flex-1 rounded-full" 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-6 py-5 bg-white/[0.01]">
        <div className="flex items-center space-x-6">
          <button 
            onClick={(e) => { e.stopPropagation(); onLike(); }}
            className="flex items-center space-x-2 group/like transition-all duration-300 relative"
          >
            <div className="relative flex items-center justify-center">
              <Heart 
                key={post.hasLiked ? 'liked' : 'unliked'}
                size={22} 
                className={`transition-all duration-500 ease-out filter ${
                  post.hasLiked 
                    ? 'fill-[#FF2D55] text-[#FF2D55] animate-heart-pulse drop-shadow-[0_0_8px_rgba(255,45,85,0.4)]' 
                    : 'opacity-30 scale-100 hover:opacity-50 text-white fill-none'
                }`} 
              />
              {post.hasLiked && (
                <div className="absolute inset-0 animate-ping opacity-20 rounded-full bg-[#FF2D55] scale-150 pointer-events-none" />
              )}
            </div>
            <span className={`text-xs font-black transition-all duration-300 ${post.hasLiked ? 'text-[#FF2D55] translate-x-1' : 'opacity-30'}`}>
              {post.likes}
            </span>
          </button>
          
          <button 
            onClick={(e) => e.stopPropagation()}
            className="flex items-center space-x-2 opacity-30 group/comment active:scale-110 transition-transform hover:opacity-100"
          >
            <MessageCircle size={20} />
            <span className="text-xs font-black" style={{ color: theme.text }}>{post.commentsCount}</span>
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); handleShare(); }}
            onMouseEnter={() => setIsBottomShareHovered(true)}
            onMouseLeave={() => setIsBottomShareHovered(false)}
            className="flex items-center space-x-2 opacity-30 active:scale-110 transition-transform hover:opacity-100"
          >
            <Share2 
              size={20} 
              className={`transition-all duration-300 ${isBottomShareHovered ? 'scale-125' : ''}`} 
              style={{ color: isBottomShareHovered ? primaryColor : 'inherit' }}
            />
            <span 
              className={`text-xs font-black uppercase tracking-tighter transition-colors duration-300`} 
              style={{ color: isBottomShareHovered ? primaryColor : theme.text, opacity: isBottomShareHovered ? 1 : 1 }}
            >
              Compartilhar
            </span>
          </button>
        </div>
        
        <div className="hidden sm:flex -space-x-2">
           {[1, 2, 3].map(i => (
             <img 
               key={i} 
               src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 20}`} 
               className="w-7 h-7 rounded-full border-2 border-[#111111] bg-gray-900 object-cover" 
               alt="amigo" 
             />
           ))}
        </div>
      </div>
    </div>
  );
};

export default FeedCard;
