export interface WeightEntry {
  date: string;
  weight: number;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  role?: 'admin' | 'user';
  email?: string;
  joinDate?: string;
  plan?: 'Free' | 'Pro' | 'Elite';
  height?: number;
  weight?: number;
  weightHistory?: WeightEntry[];
  created_at?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  expiresAt: string;
  status: 'active' | 'expired';
}

export interface BlogArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  image: string;
  readTime?: string;
  views?: number;
  likes?: number;
  shares?: number;
}

export interface ExerciseSet {
  weight: string;
  reps: string;
  difficulty: string;
  color: string;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: ExerciseSet[];
}

export interface ExerciseCatalog {
  id: string;
  name: string;
  muscle_group: string;
  secondary_muscles?: string[];
  equipment?: string;
  difficulty?: string;
  instructions?: string;
  video_url?: string;
  image_url?: string;
  created_at?: string;
}

export interface PublicRoutine {
  id: string;
  title: string;
  description?: string;
  muscle_groups: string[];
  difficulty: string;
  duration_minutes: number;
  exercises: Exercise[];
  is_premium: boolean;
  created_by?: string;
  views: number;
  uses: number;
  created_at?: string;
}

export interface Workout {
  id: string;
  title: string;
  muscleGroups: string[];
  exercises: Exercise[];
  completedAt?: string;
  isPublic?: boolean;
  user_id?: string;
}

export interface DailyStats {
  caloriesBurned: number;
  waterIntake: number;
  waterGoal: number;
  workoutProgress: number;
}

export interface Day {
  label: string;
  number: string;
  isActive: boolean;
  isToday: boolean;
  date: string;
}

export interface SocialPost {
  id: string;
  user: User;
  workoutTitle: string;
  intensity: number;
  calories: string;
  duration: string;
  timestamp: string;
  likes: number;
  commentsCount: number;
  hasLiked: boolean;
}

export interface ApiLog {
  id: number;
  user_id: string;
  action: string;
  endpoint?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalWorkouts: number;
  totalExercises: number;
  totalRoutines: number;
  totalArticles: number;
  proSubscribers: number;
  eliteSubscribers: number;
  apiCallsToday: number;
  apiCallsThisMonth: number;
}

export interface LeaderboardEntry {
  user: User;
  totalWorkouts: number;
  totalVolume: number;
  streak: number;
}

export interface ExerciseStats {
  name: string;
  uses: number;
  muscleGroup: string;
}

export interface WorkoutStats {
  title: string;
  completions: number;
  avgDuration: number;
}
