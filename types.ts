
import React from 'react';

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
  height?: number; // em cm
  weight?: number; // em kg
  weightHistory?: WeightEntry[];
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
  readTime: string;
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

export interface Workout {
  id: string;
  title: string;
  muscleGroups: string[];
  exercises: Exercise[];
  completedAt?: string;
  isPublic?: boolean;
}

export interface DailyStats {
  caloriesBurned: number;
  waterIntake: number; // in ml
  waterGoal: number; // in ml
  workoutProgress: number; // 0 to 100
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
