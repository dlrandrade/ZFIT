
import React, { useState } from 'react';
import { ChevronLeft, Clock, User, Share2, ArrowRight } from 'lucide-react';
import { BlogArticle } from '../types';

interface BlogPageProps {
  articles: BlogArticle[];
  theme: any;
  onBack: () => void;
}

const BlogPage: React.FC<BlogPageProps> = ({ articles, theme, onBack }) => {
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null);

  if (selectedArticle) {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500 min-h-screen" style={{ backgroundColor: theme.bg }}>
        <div className="relative h-[400px] w-full">
          <img src={selectedArticle.image} className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent, ${theme.bg})` }} />
          <button 
            onClick={() => setSelectedArticle(null)}
            className="absolute top-8 left-6 w-12 h-12 rounded-2xl flex items-center justify-center border transition-all active:scale-90"
            style={{ backgroundColor: `${theme.bg}80`, backdropBlur: '12px', borderColor: theme.border, color: theme.text }}
          >
            <ChevronLeft size={24} />
          </button>
        </div>

        <div className="px-6 -mt-20 relative z-10 pb-24 max-w-3xl mx-auto">
          <div className="rounded-[45px] p-8 border shadow-2xl" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <div className="flex items-center space-x-3 mb-6">
              <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border transition-colors" style={{ backgroundColor: `${theme.primary}15`, color: theme.primary, borderColor: `${theme.primary}30` }}>
                {selectedArticle.category}
              </span>
              <div className="flex items-center text-[9px] font-black uppercase tracking-widest opacity-30 space-x-3" style={{ color: theme.text }}>
                <span className="flex items-center gap-1"><Clock size={12} /> {selectedArticle.readTime}</span>
                <span className="flex items-center gap-1"><User size={12} /> {selectedArticle.author}</span>
              </div>
            </div>

            <h1 className="text-4xl font-black tracking-tighter uppercase leading-[0.9] mb-8" style={{ color: theme.text }}>{selectedArticle.title}</h1>
            
            <div className="space-y-6 text-sm leading-relaxed font-medium" style={{ color: theme.textSecondary }}>
              <p>{selectedArticle.content}</p>
              <p>O treino de força não é apenas sobre mover pesos. É sobre conexão mente-músculo e disciplina diária. Pesquisas recentes mostram que a cadência do exercício é tão importante quanto o peso utilizado...</p>
              <div className="p-6 rounded-[30px] border italic" style={{ backgroundColor: theme.cardSecondary, borderColor: theme.border, color: theme.text }}>
                "O sucesso não é o destino, é a consistência do processo." - ZFIT Team
              </div>
              <p>Muitos atletas ignoram a fase excêntrica do movimento, focando apenas na força bruta. No entanto, é durante o alongamento sob tensão que as microlesões produtivas mais ocorrem.</p>
            </div>

            <div className="mt-12 pt-8 border-t flex justify-between items-center" style={{ borderColor: theme.border }}>
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}>
                   <Share2 size={18} />
                 </div>
                 <span className="text-[10px] font-black uppercase opacity-40" style={{ color: theme.text }}>Compartilhar Artigo</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-2 block" style={{ color: theme.text }}>Conhecimento é Poder</span>
          <h2 className="text-4xl font-black tracking-tighter leading-[0.8] uppercase" style={{ color: theme.text }}>
            BLOG &<br/>CONTEÚDO
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map(article => (
          <button 
            key={article.id}
            onClick={() => setSelectedArticle(article)}
            className="group flex flex-col rounded-[45px] border overflow-hidden transition-all duration-500 hover:scale-[1.02] active:scale-95 text-left"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <div className="relative h-48 overflow-hidden">
              <img src={article.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border" style={{ backgroundColor: `${theme.bg}B3`, color: theme.text, borderColor: theme.border, backdropBlur: '8px' }}>
                {article.category}
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-xl font-black tracking-tighter uppercase leading-tight mb-4 transition-colors" style={{ color: theme.text }}>{article.title}</h3>
              <p className="text-[11px] font-medium leading-relaxed mb-6 line-clamp-2" style={{ color: theme.textSecondary }}>{article.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-20" style={{ color: theme.text }}>{article.date}</span>
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest" style={{ color: theme.primary }}>
                  LER MAIS <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BlogPage;
