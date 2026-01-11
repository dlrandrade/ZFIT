
import React from 'react';
import FeedCard from './FeedCard';
import { SocialPost } from '../types';

interface FeedProps {
  primaryColor: string;
  posts: SocialPost[];
  onUpdatePosts: (posts: SocialPost[]) => void;
  theme: any;
}

const Feed: React.FC<FeedProps> = ({ primaryColor, posts, onUpdatePosts, theme }) => {

  const handleLike = (postId: string) => {
    const updated = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          hasLiked: !post.hasLiked,
          likes: post.hasLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    });
    onUpdatePosts(updated);
  };

  return (
    <div className="px-6 pb-24">
      <div className="flex justify-between items-end mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <h2 className="text-4xl font-black tracking-tighter leading-[0.8] uppercase" style={{ color: theme.text }}>
          COMUNIDADE<br/>FITNESS
        </h2>
        <div className="flex -space-x-3">
           {[1, 2, 3, 4].map(i => (
             <div key={i} className="w-10 h-10 rounded-full border-4 border-[#050505] bg-white/5 overflow-hidden">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="usuário" />
             </div>
           ))}
        </div>
      </div>

      <div className="space-y-6">
        {posts.map((post, index) => (
          <FeedCard 
            key={post.id} 
            post={post} 
            index={index}
            primaryColor={primaryColor} 
            onLike={() => handleLike(post.id)}
            theme={theme}
          />
        ))}
        
        {posts.length === 0 && (
          <div className="py-24 text-center opacity-0 animate-in fade-in duration-1000 delay-300 fill-mode-forwards">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5 opacity-20">
               <div className="w-8 h-8 border-2 border-white rounded-lg" />
            </div>
            <p className="font-black uppercase tracking-widest text-[10px] opacity-20">Nenhuma atividade recente</p>
            <p className="text-[9px] font-black uppercase tracking-tighter opacity-10 mt-1">Finalize um treino para aparecer aqui</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
