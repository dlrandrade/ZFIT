
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
      { threshold: 0.05 }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: 'ZFIT Elite',
      text: `🔥 Olha o treino de ${post.user.name}: ${post.workoutTitle}!`,
      url: window.location.href,
    };
    if (navigator.share) await navigator.share(shareData);
  };

  return (
    <div 
      ref={cardRef}
      className={`rounded-[40px] border mb-6 overflow-hidden transition-all duration-500 ease-out ${depthClass} 
        ${isVisible ? 'animate-reveal' : 'opacity-0 translate-y-8'}`}
      style={{ 
        backgroundColor: theme.card, 
        borderColor: theme.border, 
        color: theme.text,
        animationDelay: `${index * 50}ms` 
      }}
    >
      {/* User Header */}
      <div className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-3">
          <img src={post.user.avatar} className="w-10 h-10 rounded-full border border-white/10" alt="" />
          <div>
            <h4 className="text-sm font-black uppercase tracking-tight">{post.user.name}</h4>
            <p className="text-[9px] font-black opacity-30 uppercase tracking-widest">{post.timestamp}</p>
          </div>
        </div>
        <button onClick={handleShare} className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity">
          <Share2 size={16} />
        </button>
      </div>

      {/* Stats Summary */}
      <div className="px-6 pb-2">
        <div className="rounded-[30px] p-6 mb-4 border bg-white/[0.02] flex justify-between items-center" style={{ borderColor: theme.border }}>
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest opacity-30 block mb-1">Workout</span>
            <h3 className="text-xl font-black uppercase tracking-tighter leading-tight">{post.workoutTitle}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ backgroundColor: `${primaryColor}15`, borderColor: theme.border }}>
            <Zap size={18} style={{ color: primaryColor }} />
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="flex items-center space-x-6 px-8 py-5 bg-white/[0.01]">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
          className="flex items-center space-x-2 group transition-all"
        >
          <div className="relative">
            <Heart 
              size={22} 
              className={`transition-all duration-500 ease-out ${
                post.hasLiked 
                  ? 'fill-[#FF2D55] text-[#FF2D55] animate-heart-pulse' 
                  : 'text-white/30 hover:text-white'
              }`} 
            />
            {post.hasLiked && (
              <div className="absolute inset-0 bg-[#FF2D55] blur-xl opacity-20 rounded-full animate-pulse" />
            )}
          </div>
          <span className={`text-xs font-black transition-colors ${post.hasLiked ? 'text-[#FF2D55]' : 'text-white/30'}`}>
            {post.likes}
          </span>
        </button>
        
        <button className="flex items-center space-x-2 text-white/30 hover:text-white transition-all">
          <MessageCircle size={20} />
          <span className="text-xs font-black">{post.commentsCount}</span>
        </button>

        <div className="flex-1" />

        <div className="flex items-center space-x-4 opacity-40">
           <div className="flex items-center space-x-1">
             <Flame size={12} style={{ color: primaryColor }} />
             <span className="text-[10px] font-black">{post.calories}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FeedCard;
