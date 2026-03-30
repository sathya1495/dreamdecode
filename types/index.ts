export interface DreamSymbol {
  name: string;
  emoji: string;
  meaning: string;
}

export interface DreamInterpretation {
  overview: string;
  symbols: DreamSymbol[];
  interpretation: string;
  reflection: string;
  moodDetected: string;
  themes: string[];
}

export interface Dream {
  id: string;
  content: string;
  emotions: string[];
  tags: string[];
  interpretation: DreamInterpretation | null;
  createdAt: string;
  isPremium: boolean;
}

export interface UserProfile {
  id: string;
  displayName: string;
  dreamFrequency: string;
  interests: string[];
  streakDays: number;
  totalDreams: number;
  isPremium: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
  lastDreamDate: string | null;
}

export interface DreamStats {
  totalDreams: number;
  currentStreak: number;
  longestStreak: number;
  mostActiveDay: string;
  averageMood: string;
  topSymbols: { name: string; emoji: string; count: number }[];
  emotionCounts: Record<string, number>;
  weeklyEmotions: { date: string; emotion: string }[];
}
