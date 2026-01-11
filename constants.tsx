
import { DailyStats, Day, SocialPost, Exercise, BlogArticle, Workout } from './types';

export const THEMES = {
  dark: {
    name: 'ZFIT Classic',
    primary: '#adf94e',
    bg: '#050505',
    sidebar: '#050505',
    card: '#111111',
    cardSecondary: 'rgba(255, 255, 255, 0.05)',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.4)',
    border: 'rgba(255, 255, 255, 0.08)',
    accent: '#1A1A1A',
    glow: 'rgba(173, 249, 78, 0.15)'
  },
  mint: {
    name: 'ZFIT Mint',
    primary: '#004D40',
    bg: '#63D6B1',
    sidebar: '#004D40',
    card: '#ffffff',
    cardSecondary: 'rgba(0, 77, 64, 0.1)',
    text: '#1A1A1A',
    textSecondary: 'rgba(0, 0, 0, 0.5)',
    border: 'rgba(0, 77, 64, 0.15)',
    accent: '#007361',
    glow: 'rgba(255, 255, 255, 0.4)'
  }
};

export const MUSCLE_GROUPS = ['Todos', 'Abs', 'Costas', 'Bíceps', 'Cardio', 'Peito', 'Pernas', 'Ombros', 'Tríceps'];

export const INITIAL_DAILY_STATS: DailyStats = {
  caloriesBurned: 0,
  waterIntake: 0,
  waterGoal: 3000,
  workoutProgress: 0,
};

export const MOCK_BLOG: BlogArticle[] = [
  {
    id: '1',
    title: 'A Ciência da Hipertrofia: Como Crescer Mais Rápido',
    excerpt: 'Entenda os princípios fisiológicos que governam o ganho de massa muscular e como otimizar seu treino.',
    content: 'O crescimento muscular, ou hipertrofia, é uma adaptação complexa que ocorre quando as fibras musculares são submetidas a estresse mecânico e metabólico significativo...',
    author: 'Dr. Lucas Fit',
    date: '12 Out 2023',
    category: 'Treino',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800',
    readTime: '5 min'
  },
  {
    id: '2',
    title: 'Nutrição Pré-Treino: O Que Realmente Importa',
    excerpt: 'Descubra quais alimentos garantem o melhor desempenho energético para sua rotina de exercícios.',
    content: 'A janela de nutrição em torno do seu treino é vital para o sucesso a longo prazo...',
    author: 'Nutri Bia',
    date: '10 Out 2023',
    category: 'Nutrição',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800',
    readTime: '3 min'
  }
];

export const PUBLIC_ROUTINES: Workout[] = [
  {
    id: 'pub-1',
    title: 'Full Body Elite',
    muscleGroups: ['Peito', 'Costas', 'Pernas'],
    exercises: [],
    isPublic: true
  },
  {
    id: 'pub-2',
    title: 'HIIT Queima Máxima',
    muscleGroups: ['Cardio', 'Abs'],
    exercises: [],
    isPublic: true
  }
];

export const EXERCISE_DATABASE = [
  { name: 'Supino Reto', muscleGroup: 'Peito' },
  { name: 'Supino Inclinado', muscleGroup: 'Peito' },
  { name: 'Crucifixo Máquina', muscleGroup: 'Peito' },
  { name: 'Puxada Aberta', muscleGroup: 'Costas' },
  { name: 'Remada Curvada', muscleGroup: 'Costas' },
  { name: 'Agachamento Livre', muscleGroup: 'Pernas' },
  { name: 'Leg Press', muscleGroup: 'Pernas' },
  { name: 'Rosca Direta', muscleGroup: 'Bíceps' },
  { name: 'Tríceps Corda', muscleGroup: 'Tríceps' },
  { name: 'Desenvolvimento', muscleGroup: 'Ombros' },
  { name: 'Elevação Lateral', muscleGroup: 'Ombros' },
];

export const getCalendarDays = (): Day[] => {
  const days: Day[] = [];
  const date = new Date();
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());

  const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  for (let i = 0; i < 7; i++) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);
    days.push({
      label: labels[i],
      number: current.getDate().toString().padStart(2, '0'),
      isActive: current.toDateString() === date.toDateString(),
      isToday: current.toDateString() === date.toDateString(),
      date: current.toISOString().split('T')[0]
    });
  }
  return days;
};
