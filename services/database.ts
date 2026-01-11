
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Workout, SocialPost, DailyStats, BlogArticle, Coupon } from '../types';

const SUPABASE_URL = 'https://jtbxdkoxwwnfnbclemmp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_89f07kq5B_i6ISCsldkJWQ_SPa2UFM_';

class DatabaseService {
  private _supabase: SupabaseClient | null = null;

  private get client(): SupabaseClient {
    if (!this._supabase) {
      this._supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
    }
    return this._supabase;
  }

  async login(email: string): Promise<User> {
    const emailNormalized = email.toLowerCase().trim();
    const { data: user, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('email', emailNormalized)
      .maybeSingle();

    if (error) throw error;
    if (!user) throw new Error('E-mail não encontrado. Crie uma conta primeiro.');

    localStorage.setItem('zfit_user', JSON.stringify(user));
    localStorage.setItem('zfit_auth', 'true');
    return user as User;
  }

  async signUp(name: string, email: string): Promise<User> {
    const emailNormalized = email.toLowerCase().trim();
    
    const { data: existing } = await this.client
      .from('profiles')
      .select('email')
      .eq('email', emailNormalized)
      .maybeSingle();

    if (existing) throw new Error('Este e-mail já está cadastrado.');

    const newUser: User = {
      id: crypto.randomUUID(),
      name: name.trim(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${emailNormalized}`,
      level: 1,
      xp: 0,
      email: emailNormalized,
      role: 'user',
      plan: 'Free'
    };

    const { error: insertError } = await this.client
      .from('profiles')
      .insert(newUser);

    if (insertError) throw insertError;

    localStorage.setItem('zfit_user', JSON.stringify(newUser));
    localStorage.setItem('zfit_auth', 'true');
    return newUser;
  }

  async signOut() {
    localStorage.removeItem('zfit_auth');
    localStorage.removeItem('zfit_user');
  }

  async getCurrentUser(): Promise<User | null> {
    const saved = localStorage.getItem('zfit_user');
    if (!saved) return null;
    try {
      const user = JSON.parse(saved);
      const { data: profile } = await this.client.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (profile) {
        localStorage.setItem('zfit_user', JSON.stringify(profile));
        return profile as User;
      }
      return user;
    } catch {
      return null;
    }
  }

  async saveUser(user: User): Promise<void> {
    localStorage.setItem('zfit_user', JSON.stringify(user));
    await this.client.from('profiles').upsert(user);
  }

  async getWorkoutHistory(): Promise<Workout[]> {
    const user = await this.getCurrentUser();
    if (!user) return [];
    const { data } = await this.client
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false });
    
    return (data || []).map(w => ({
      ...w,
      muscleGroups: w.muscle_groups || [],
      completedAt: w.completed_at
    }));
  }

  async saveWorkout(workout: Workout): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) return;
    await this.client.from('workouts').insert({
      id: workout.id,
      user_id: user.id,
      title: workout.title,
      muscle_groups: workout.muscleGroups,
      exercises: workout.exercises,
      completed_at: workout.completedAt
    });
  }

  async getSocialFeed(): Promise<SocialPost[]> {
    try {
      const { data } = await this.client
        .from('social_posts')
        .select('*, user:profiles(*)')
        .order('created_at', { ascending: false })
        .limit(20);

      return (data || []).map((p: any) => ({
        ...p,
        workoutTitle: p.workout_title,
        timestamp: new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        likes: p.likes || 0,
        commentsCount: p.comments_count || 0,
        hasLiked: false
      }));
    } catch {
      return [];
    }
  }

  async publishPost(post: SocialPost): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) return;
    await this.client.from('social_posts').insert({
      id: post.id,
      user_id: user.id,
      workout_title: post.workoutTitle,
      intensity: post.intensity,
      calories: post.calories,
      duration: post.duration,
      created_at: new Date().toISOString()
    });
  }

  async getDailyStats(): Promise<DailyStats> {
    const user = await this.getCurrentUser();
    const defaultStats: DailyStats = { caloriesBurned: 0, waterIntake: 0, waterGoal: 3000, workoutProgress: 0 };
    if (!user) return defaultStats;

    const today = new Date().toISOString().split('T')[0];
    const { data } = await this.client
      .from('daily_stats')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    if (data) {
      return {
        caloriesBurned: data.calories_burned || 0,
        waterIntake: data.water_intake || 0,
        waterGoal: data.water_goal || 3000,
        workoutProgress: data.workout_progress || 0
      };
    }
    return defaultStats;
  }

  async updateDailyStats(stats: DailyStats): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    
    await this.client.from('daily_stats').upsert({
      user_id: user.id,
      date: today,
      calories_burned: stats.caloriesBurned,
      water_intake: stats.waterIntake,
      water_goal: stats.waterGoal,
      workout_progress: stats.workoutProgress
    });
  }

  async getBlogArticles(): Promise<BlogArticle[]> {
    const { data } = await this.client.from('blog_articles').select('*').order('date', { ascending: false });
    return data || [];
  }

  async getCoupons(): Promise<Coupon[]> {
    const { data } = await this.client.from('coupons').select('*').eq('status', 'active');
    return data || [];
  }
}

export const db = new DatabaseService();
