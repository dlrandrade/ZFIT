import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  User,
  Workout,
  SocialPost,
  DailyStats,
  BlogArticle,
  Coupon,
  ExerciseCatalog,
  PublicRoutine,
  AdminStats,
  LeaderboardEntry,
  ExerciseStats
} from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://jtbxdkoxwwnfnbclemmp.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_89f07kq5B_i6ISCsldkJWQ_SPa2UFM_';

const REQUEST_TIMEOUT = 10000;

class DatabaseService {
  private _supabase: SupabaseClient | null = null;

  private get client(): SupabaseClient {
    if (!this._supabase) {
      try {
        this._supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
          global: {
            fetch: (url, options) => {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

              return fetch(url, {
                ...options,
                signal: controller.signal,
              }).finally(() => clearTimeout(timeoutId));
            },
          },
        });
      } catch (e) {
        console.error("ZFIT: Falha crítica ao criar cliente Supabase", e);
        throw e;
      }
    }
    return this._supabase;
  }

  private async withFallback<T>(
    operation: () => Promise<T>,
    fallback: T,
    operationName: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      console.warn(`ZFIT: ${operationName} falhou, usando fallback local.`, error);
      return fallback;
    }
  }

  // ==================== AUTH ====================

  async login(email: string): Promise<User> {
    const emailNormalized = email.toLowerCase().trim();

    if (!emailNormalized || !emailNormalized.includes('@')) {
      throw new Error('E-mail inválido.');
    }

    const { data: user, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('email', emailNormalized)
      .maybeSingle();

    if (error) throw error;
    if (!user) throw new Error('E-mail não encontrado. Crie uma conta primeiro.');

    await this.logApiCall(user.id, 'login');
    this.saveUserLocally(user);
    return user as User;
  }

  async signUp(name: string, email: string): Promise<User> {
    const emailNormalized = email.toLowerCase().trim();
    const nameTrimmed = name.trim();

    if (!emailNormalized || !emailNormalized.includes('@')) {
      throw new Error('E-mail inválido.');
    }

    if (!nameTrimmed || nameTrimmed.length < 2) {
      throw new Error('Nome deve ter pelo menos 2 caracteres.');
    }

    const { data: existing } = await this.client
      .from('profiles')
      .select('id')
      .eq('email', emailNormalized)
      .maybeSingle();

    if (existing) {
      throw new Error('Este e-mail já está cadastrado. Tente fazer login.');
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name: nameTrimmed,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(emailNormalized)}`,
      level: 1,
      xp: 0,
      email: emailNormalized,
      role: 'user',
      plan: 'Free'
    };

    const { error } = await this.client.from('profiles').insert(newUser);
    if (error) {
      console.error("ZFIT: Erro ao criar perfil", error);
      throw new Error('Erro ao criar conta. Tente novamente.');
    }

    await this.logApiCall(newUser.id, 'signup');
    this.saveUserLocally(newUser);
    return newUser;
  }

  private saveUserLocally(user: User): void {
    try {
      localStorage.setItem('zfit_user', JSON.stringify(user));
      localStorage.setItem('zfit_auth', 'true');
    } catch (e) {
      console.warn('ZFIT: Não foi possível salvar no localStorage');
    }
  }

  async signOut(): Promise<void> {
    try {
      localStorage.removeItem('zfit_auth');
      localStorage.removeItem('zfit_user');
      localStorage.removeItem('zfit_user_routines');
    } catch (e) {
      console.warn('ZFIT: Erro ao limpar localStorage');
    }
  }

  async refreshUser(): Promise<User | null> {
    const saved = localStorage.getItem('zfit_user');
    if (!saved) return null;

    try {
      const user = JSON.parse(saved) as User;

      try {
        const { data: profile } = await this.client
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profile) {
          this.saveUserLocally(profile);
          return profile as User;
        }
      } catch {
        console.warn('ZFIT: Usando dados offline para usuário');
      }

      return user;
    } catch {
      return null;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const saved = localStorage.getItem('zfit_user');
    if (!saved) return null;
    try {
      return JSON.parse(saved) as User;
    } catch {
      return null;
    }
  }

  async saveUser(user: User): Promise<void> {
    this.saveUserLocally(user);

    this.client.from('profiles').upsert({
      ...user,
      weight_history: user.weightHistory,
      updated_at: new Date().toISOString()
    }).then(({ error }) => {
      if (error) console.warn('ZFIT: Erro ao sincronizar perfil', error);
    });
  }

  // ==================== WORKOUTS ====================

  async getWorkoutHistory(): Promise<Workout[]> {
    return this.withFallback(
      async () => {
        const user = await this.getCurrentUser();
        if (!user) return [];

        const { data, error } = await this.client
          .from('workouts')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        return (data || []).map(w => ({
          ...w,
          muscleGroups: w.muscle_groups || [],
          completedAt: w.completed_at
        }));
      },
      [],
      'getWorkoutHistory'
    );
  }

  async saveWorkout(workout: Workout): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) return;

    try {
      await this.client.from('workouts').insert({
        id: workout.id,
        user_id: user.id,
        title: workout.title,
        muscle_groups: workout.muscleGroups,
        exercises: workout.exercises,
        completed_at: workout.completedAt
      });
      await this.logApiCall(user.id, 'workout_completed', { workout_id: workout.id });
    } catch (error) {
      console.warn('ZFIT: Erro ao salvar workout', error);
    }
  }

  // ==================== SOCIAL ====================

  async getSocialFeed(): Promise<SocialPost[]> {
    return this.withFallback(
      async () => {
        const { data, error } = await this.client
          .from('social_posts')
          .select('*, user:profiles(*)')
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;

        return (data || []).map((p: any) => ({
          ...p,
          workoutTitle: p.workout_title,
          timestamp: this.formatTimestamp(p.created_at),
          likes: p.likes || 0,
          commentsCount: p.comments_count || 0,
          hasLiked: false
        }));
      },
      [],
      'getSocialFeed'
    );
  }

  private formatTimestamp(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('pt-BR');
  }

  async publishPost(post: SocialPost): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) return;

    try {
      await this.client.from('social_posts').insert({
        id: post.id,
        user_id: user.id,
        workout_title: post.workoutTitle,
        intensity: post.intensity,
        calories: post.calories,
        duration: post.duration,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.warn('ZFIT: Erro ao publicar post', error);
    }
  }

  // ==================== DAILY STATS ====================

  async getDailyStats(): Promise<DailyStats> {
    const defaultStats: DailyStats = {
      caloriesBurned: 0,
      waterIntake: 0,
      waterGoal: 3000,
      workoutProgress: 0
    };

    return this.withFallback(
      async () => {
        const user = await this.getCurrentUser();
        if (!user) return defaultStats;

        const today = new Date().toISOString().split('T')[0];
        const { data } = await this.client
          .from('daily_stats')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle();

        return data ? {
          caloriesBurned: data.calories_burned ?? 0,
          waterIntake: data.water_intake ?? 0,
          waterGoal: data.water_goal ?? 3000,
          workoutProgress: data.workout_progress ?? 0
        } : defaultStats;
      },
      defaultStats,
      'getDailyStats'
    );
  }

  async updateDailyStats(stats: DailyStats): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    try {
      await this.client.from('daily_stats').upsert({
        user_id: user.id,
        date: today,
        calories_burned: stats.caloriesBurned,
        water_intake: stats.waterIntake,
        water_goal: stats.waterGoal,
        workout_progress: stats.workoutProgress
      });
    } catch (error) {
      console.warn('ZFIT: Erro ao atualizar stats', error);
    }
  }

  // ==================== BLOG ====================

  async getBlogArticles(): Promise<BlogArticle[]> {
    return this.withFallback(
      async () => {
        const { data } = await this.client
          .from('blog_articles')
          .select('*')
          .order('date', { ascending: false })
          .limit(20);
        return data || [];
      },
      [],
      'getBlogArticles'
    );
  }

  async saveBlogArticle(article: BlogArticle): Promise<void> {
    await this.client.from('blog_articles').upsert({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      author: article.author,
      date: article.date,
      category: article.category,
      image: article.image,
      views: article.views || 0,
      likes: article.likes || 0,
      shares: article.shares || 0,
      updated_at: new Date().toISOString()
    });
  }

  async deleteBlogArticle(id: string): Promise<void> {
    await this.client.from('blog_articles').delete().eq('id', id);
  }

  // ==================== COUPONS ====================

  async getCoupons(): Promise<Coupon[]> {
    return this.withFallback(
      async () => {
        const { data } = await this.client
          .from('coupons')
          .select('*')
          .order('expires_at', { ascending: false });
        return (data || []).map(c => ({
          ...c,
          expiresAt: c.expires_at
        }));
      },
      [],
      'getCoupons'
    );
  }

  async saveCoupon(coupon: Coupon): Promise<void> {
    await this.client.from('coupons').upsert({
      id: coupon.id,
      code: coupon.code,
      discount: coupon.discount,
      type: coupon.type,
      expires_at: coupon.expiresAt,
      status: coupon.status
    });
  }

  async deleteCoupon(id: string): Promise<void> {
    await this.client.from('coupons').delete().eq('id', id);
  }

  // ==================== EXERCISES CATALOG ====================

  async getExercisesCatalog(): Promise<ExerciseCatalog[]> {
    return this.withFallback(
      async () => {
        const { data } = await this.client
          .from('exercises')
          .select('*')
          .order('name', { ascending: true });
        return data || [];
      },
      [],
      'getExercisesCatalog'
    );
  }

  async saveExerciseCatalog(exercise: ExerciseCatalog): Promise<void> {
    await this.client.from('exercises').upsert({
      id: exercise.id,
      name: exercise.name,
      muscle_group: exercise.muscle_group,
      secondary_muscles: exercise.secondary_muscles || [],
      equipment: exercise.equipment,
      difficulty: exercise.difficulty,
      instructions: exercise.instructions,
      video_url: exercise.video_url,
      image_url: exercise.image_url,
      updated_at: new Date().toISOString()
    });
  }

  async deleteExerciseCatalog(id: string): Promise<void> {
    await this.client.from('exercises').delete().eq('id', id);
  }

  // ==================== PUBLIC ROUTINES ====================

  async getPublicRoutines(): Promise<PublicRoutine[]> {
    return this.withFallback(
      async () => {
        const { data } = await this.client
          .from('public_routines')
          .select('*')
          .order('created_at', { ascending: false });
        return data || [];
      },
      [],
      'getPublicRoutines'
    );
  }

  async savePublicRoutine(routine: PublicRoutine): Promise<void> {
    await this.client.from('public_routines').upsert({
      id: routine.id,
      title: routine.title,
      description: routine.description,
      muscle_groups: routine.muscle_groups,
      difficulty: routine.difficulty,
      duration_minutes: routine.duration_minutes,
      exercises: routine.exercises,
      is_premium: routine.is_premium,
      created_by: routine.created_by,
      views: routine.views || 0,
      uses: routine.uses || 0,
      updated_at: new Date().toISOString()
    });
  }

  async deletePublicRoutine(id: string): Promise<void> {
    await this.client.from('public_routines').delete().eq('id', id);
  }

  async incrementRoutineUse(id: string): Promise<void> {
    const { data } = await this.client
      .from('public_routines')
      .select('uses')
      .eq('id', id)
      .single();

    if (data) {
      await this.client
        .from('public_routines')
        .update({ uses: (data.uses || 0) + 1 })
        .eq('id', id);
    }
  }

  // ==================== ADMIN STATS ====================

  async getAllUsers(): Promise<User[]> {
    const { data } = await this.client
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    return data || [];
  }

  async updateUserPlan(userId: string, plan: 'Free' | 'Pro' | 'Elite'): Promise<void> {
    await this.client
      .from('profiles')
      .update({ plan })
      .eq('id', userId);
  }

  async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<void> {
    await this.client
      .from('profiles')
      .update({ role })
      .eq('id', userId);
  }

  async getAllWorkouts(): Promise<any[]> {
    const { data } = await this.client
      .from('workouts')
      .select('*, user:profiles(id, name, email, plan)')
      .order('completed_at', { ascending: false })
      .limit(500);
    return data || [];
  }

  async getAdminStats(): Promise<AdminStats> {
    const [
      usersResult,
      workoutsResult,
      exercisesResult,
      routinesResult,
      articlesResult,
      apiLogsToday,
      apiLogsMonth
    ] = await Promise.all([
      this.client.from('profiles').select('id, plan, updated_at', { count: 'exact' }),
      this.client.from('workouts').select('id', { count: 'exact' }),
      this.client.from('exercises').select('id', { count: 'exact' }),
      this.client.from('public_routines').select('id', { count: 'exact' }),
      this.client.from('blog_articles').select('id', { count: 'exact' }),
      this.client.from('api_logs').select('id', { count: 'exact' }).gte('created_at', new Date().toISOString().split('T')[0]),
      this.client.from('api_logs').select('id', { count: 'exact' }).gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
    ]);

    const users = usersResult.data || [];
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const activeUsers = users.filter(u =>
      u.updated_at && new Date(u.updated_at) > thirtyDaysAgo
    ).length;

    const proSubscribers = users.filter(u => u.plan === 'Pro').length;
    const eliteSubscribers = users.filter(u => u.plan === 'Elite').length;

    return {
      totalUsers: usersResult.count || 0,
      activeUsers,
      totalWorkouts: workoutsResult.count || 0,
      totalExercises: exercisesResult.count || 0,
      totalRoutines: routinesResult.count || 0,
      totalArticles: articlesResult.count || 0,
      proSubscribers,
      eliteSubscribers,
      apiCallsToday: apiLogsToday.count || 0,
      apiCallsThisMonth: apiLogsMonth.count || 0
    };
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const { data: workouts } = await this.client
      .from('workouts')
      .select('user_id, exercises, completed_at');

    if (!workouts) return [];

    const userStats: Record<string, { workouts: number; volume: number }> = {};

    workouts.forEach(w => {
      if (!w.user_id) return;
      if (!userStats[w.user_id]) {
        userStats[w.user_id] = { workouts: 0, volume: 0 };
      }
      userStats[w.user_id].workouts++;

      // Calcular volume
      (w.exercises || []).forEach((ex: any) => {
        (ex.sets || []).forEach((set: any) => {
          const weight = parseInt(set.weight?.replace(/\D/g, '') || '0');
          const reps = parseInt(set.reps || '0');
          userStats[w.user_id].volume += weight * reps;
        });
      });
    });

    const { data: users } = await this.client
      .from('profiles')
      .select('*');

    const leaderboard: LeaderboardEntry[] = Object.entries(userStats)
      .map(([userId, stats]) => {
        const user = users?.find(u => u.id === userId);
        if (!user) return null;
        return {
          user: user as User,
          totalWorkouts: stats.workouts,
          totalVolume: stats.volume,
          streak: 0 // TODO: calcular streak real
        };
      })
      .filter(Boolean)
      .sort((a, b) => b!.totalVolume - a!.totalVolume)
      .slice(0, 10) as LeaderboardEntry[];

    return leaderboard;
  }

  async getExerciseStats(): Promise<ExerciseStats[]> {
    const { data: workouts } = await this.client
      .from('workouts')
      .select('exercises');

    if (!workouts) return [];

    const exerciseCount: Record<string, { count: number; muscleGroup: string }> = {};

    workouts.forEach(w => {
      (w.exercises || []).forEach((ex: any) => {
        if (!exerciseCount[ex.name]) {
          exerciseCount[ex.name] = { count: 0, muscleGroup: ex.muscleGroup || 'Outro' };
        }
        exerciseCount[ex.name].count++;
      });
    });

    return Object.entries(exerciseCount)
      .map(([name, data]) => ({
        name,
        uses: data.count,
        muscleGroup: data.muscleGroup
      }))
      .sort((a, b) => b.uses - a.uses)
      .slice(0, 20);
  }

  async getApiUsageByUser(): Promise<{ userId: string; userName: string; calls: number }[]> {
    const { data: logs } = await this.client
      .from('api_logs')
      .select('user_id')
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

    if (!logs) return [];

    const userCalls: Record<string, number> = {};
    logs.forEach(l => {
      if (!l.user_id) return;
      userCalls[l.user_id] = (userCalls[l.user_id] || 0) + 1;
    });

    const { data: users } = await this.client.from('profiles').select('id, name');

    return Object.entries(userCalls)
      .map(([userId, calls]) => ({
        userId,
        userName: users?.find(u => u.id === userId)?.name || 'Desconhecido',
        calls
      }))
      .sort((a, b) => b.calls - a.calls);
  }

  // ==================== API LOGGING ====================

  private async logApiCall(userId: string, action: string, metadata?: Record<string, any>): Promise<void> {
    try {
      await this.client.from('api_logs').insert({
        user_id: userId,
        action,
        metadata: metadata || {}
      });
    } catch (e) {
      // Silently fail - logging should not break the app
    }
  }
}

export const db = new DatabaseService();
