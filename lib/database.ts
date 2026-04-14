import * as SQLite from "expo-sqlite";
import * as Crypto from "expo-crypto";
import { Dream, DreamInterpretation, UserProfile, DreamStats } from "@/types";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      try {
        const database = await SQLite.openDatabaseAsync("dreamdecode.db");
        await initDb(database);
        return database;
      } catch (e) {
        console.error("Database initialization error:", e);
        // Reset promise so it can retry
        dbPromise = null;
        throw e;
      }
    })();
  }
  return dbPromise;
}

async function initDb(database: SQLite.SQLiteDatabase) {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS dreams (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      emotions TEXT DEFAULT '[]',
      tags TEXT DEFAULT '[]',
      interpretation TEXT,
      createdAt TEXT NOT NULL,
      isPremium INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS user_profile (
      id TEXT PRIMARY KEY,
      displayName TEXT DEFAULT 'Dreamer',
      dreamFrequency TEXT DEFAULT '',
      interests TEXT DEFAULT '[]',
      streakDays INTEGER DEFAULT 0,
      totalDreams INTEGER DEFAULT 0,
      isPremium INTEGER DEFAULT 0,
      onboardingCompleted INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      lastDreamDate TEXT
    );
  `);

  // Ensure user profile exists
  const existing = await database.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM user_profile"
  );
  if (!existing || existing.count === 0) {
    const id = Crypto.randomUUID();
    await database.runAsync(
      "INSERT INTO user_profile (id, createdAt) VALUES (?, ?)",
      id,
      new Date().toISOString()
    );
  }
}

// ── Dream CRUD ──

export async function saveDream(dream: Omit<Dream, "id">): Promise<Dream> {
  const database = await getDb();
  const id = Crypto.randomUUID();
  await database.runAsync(
    `INSERT INTO dreams (id, content, emotions, tags, interpretation, createdAt, isPremium)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    id,
    dream.content,
    JSON.stringify(dream.emotions),
    JSON.stringify(dream.tags),
    dream.interpretation ? JSON.stringify(dream.interpretation) : null,
    dream.createdAt,
    dream.isPremium ? 1 : 0
  );

  // Update profile stats
  await updateProfileStats();

  return { ...dream, id };
}

export async function updateDreamInterpretation(
  dreamId: string,
  interpretation: DreamInterpretation
): Promise<void> {
  const database = await getDb();
  await database.runAsync(
    "UPDATE dreams SET interpretation = ? WHERE id = ?",
    JSON.stringify(interpretation),
    dreamId
  );
}

export async function getDreams(limit = 50, offset = 0): Promise<Dream[]> {
  const database = await getDb();
  const rows = await database.getAllAsync<{
    id: string;
    content: string;
    emotions: string;
    tags: string;
    interpretation: string | null;
    createdAt: string;
    isPremium: number;
  }>(
    "SELECT * FROM dreams ORDER BY createdAt DESC LIMIT ? OFFSET ?",
    limit,
    offset
  );

  return rows.map((row) => ({
    id: row.id,
    content: row.content,
    emotions: JSON.parse(row.emotions),
    tags: JSON.parse(row.tags),
    interpretation: row.interpretation ? JSON.parse(row.interpretation) : null,
    createdAt: row.createdAt,
    isPremium: row.isPremium === 1,
  }));
}

export async function getDreamById(id: string): Promise<Dream | null> {
  const database = await getDb();
  const row = await database.getFirstAsync<{
    id: string;
    content: string;
    emotions: string;
    tags: string;
    interpretation: string | null;
    createdAt: string;
    isPremium: number;
  }>("SELECT * FROM dreams WHERE id = ?", id);

  if (!row) return null;

  return {
    id: row.id,
    content: row.content,
    emotions: JSON.parse(row.emotions),
    tags: JSON.parse(row.tags),
    interpretation: row.interpretation ? JSON.parse(row.interpretation) : null,
    createdAt: row.createdAt,
    isPremium: row.isPremium === 1,
  };
}

export async function searchDreams(query: string): Promise<Dream[]> {
  const database = await getDb();
  const rows = await database.getAllAsync<{
    id: string;
    content: string;
    emotions: string;
    tags: string;
    interpretation: string | null;
    createdAt: string;
    isPremium: number;
  }>(
    "SELECT * FROM dreams WHERE content LIKE ? ORDER BY createdAt DESC",
    `%${query}%`
  );

  return rows.map((row) => ({
    id: row.id,
    content: row.content,
    emotions: JSON.parse(row.emotions),
    tags: JSON.parse(row.tags),
    interpretation: row.interpretation ? JSON.parse(row.interpretation) : null,
    createdAt: row.createdAt,
    isPremium: row.isPremium === 1,
  }));
}

export async function deleteDream(id: string): Promise<void> {
  const database = await getDb();
  await database.runAsync("DELETE FROM dreams WHERE id = ?", id);
  await updateProfileStats();
}

// ── User Profile ──

export async function getUserProfile(): Promise<UserProfile> {
  const database = await getDb();
  const row = await database.getFirstAsync<{
    id: string;
    displayName: string;
    dreamFrequency: string;
    interests: string;
    streakDays: number;
    totalDreams: number;
    isPremium: number;
    onboardingCompleted: number;
    createdAt: string;
    lastDreamDate: string | null;
  }>("SELECT * FROM user_profile LIMIT 1");

  if (!row) {
    // Create a default profile instead of crashing
    const id = (await import("expo-crypto")).randomUUID();
    await database.runAsync(
      "INSERT INTO user_profile (id, createdAt) VALUES (?, ?)",
      id,
      new Date().toISOString()
    );
    return {
      id,
      displayName: "Dreamer",
      dreamFrequency: "",
      interests: [],
      streakDays: 0,
      totalDreams: 0,
      isPremium: false,
      onboardingCompleted: false,
      createdAt: new Date().toISOString(),
      lastDreamDate: null,
    };
  }

  return {
    id: row.id,
    displayName: row.displayName,
    dreamFrequency: row.dreamFrequency,
    interests: JSON.parse(row.interests),
    streakDays: row.streakDays,
    totalDreams: row.totalDreams,
    isPremium: row.isPremium === 1,
    onboardingCompleted: row.onboardingCompleted === 1,
    createdAt: row.createdAt,
    lastDreamDate: row.lastDreamDate,
  };
}

export async function updateUserProfile(
  updates: Partial<
    Pick<UserProfile, "displayName" | "dreamFrequency" | "interests" | "onboardingCompleted" | "isPremium">
  >
): Promise<void> {
  const database = await getDb();
  const sets: string[] = [];
  const values: (string | number)[] = [];

  if (updates.displayName !== undefined) {
    sets.push("displayName = ?");
    values.push(updates.displayName);
  }
  if (updates.dreamFrequency !== undefined) {
    sets.push("dreamFrequency = ?");
    values.push(updates.dreamFrequency);
  }
  if (updates.interests !== undefined) {
    sets.push("interests = ?");
    values.push(JSON.stringify(updates.interests));
  }
  if (updates.onboardingCompleted !== undefined) {
    sets.push("onboardingCompleted = ?");
    values.push(updates.onboardingCompleted ? 1 : 0);
  }
  if (updates.isPremium !== undefined) {
    sets.push("isPremium = ?");
    values.push(updates.isPremium ? 1 : 0);
  }

  if (sets.length > 0) {
    await database.runAsync(
      `UPDATE user_profile SET ${sets.join(", ")} WHERE rowid = (SELECT MIN(rowid) FROM user_profile)`,
      ...values
    );
  }
}

async function updateProfileStats(): Promise<void> {
  const database = await getDb();

  // Total dreams
  const countRow = await database.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM dreams"
  );
  const totalDreams = countRow?.count ?? 0;

  // Streak calculation
  const dreams = await database.getAllAsync<{ createdAt: string }>(
    "SELECT createdAt FROM dreams ORDER BY createdAt DESC"
  );

  let streakDays = 0;
  if (dreams.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dreamDates = dreams.map((d) => {
      const date = new Date(d.createdAt);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    });

    const uniqueDates = [...new Set(dreamDates)].sort((a, b) => b - a);
    const oneDayMs = 86400000;

    // Check if most recent dream is today or yesterday
    const diff = today.getTime() - uniqueDates[0];
    if (diff <= oneDayMs) {
      streakDays = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        if (uniqueDates[i - 1] - uniqueDates[i] <= oneDayMs) {
          streakDays++;
        } else {
          break;
        }
      }
    }
  }

  const lastDreamDate = dreams.length > 0 ? dreams[0].createdAt : null;

  await database.runAsync(
    "UPDATE user_profile SET totalDreams = ?, streakDays = ?, lastDreamDate = ? WHERE rowid = (SELECT MIN(rowid) FROM user_profile)",
    totalDreams,
    streakDays,
    lastDreamDate
  );
}

// ── Stats / Insights ──

export async function getDreamStats(): Promise<DreamStats> {
  const database = await getDb();
  const profile = await getUserProfile();

  // Get all dreams for analysis
  const allDreams = await getDreams(500, 0);

  // Emotion counts
  const emotionCounts: Record<string, number> = {};
  allDreams.forEach((dream) => {
    dream.emotions.forEach((e) => {
      emotionCounts[e] = (emotionCounts[e] || 0) + 1;
    });
  });

  // Top symbols from interpretations
  const symbolCounts: Record<string, { name: string; emoji: string; count: number }> = {};
  allDreams.forEach((dream) => {
    if (dream.interpretation?.symbols) {
      dream.interpretation.symbols.forEach((s) => {
        const key = s.name.toLowerCase();
        if (symbolCounts[key]) {
          symbolCounts[key].count++;
        } else {
          symbolCounts[key] = { name: s.name, emoji: s.emoji, count: 1 };
        }
      });
    }
  });

  const topSymbols = Object.values(symbolCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Most active day of week
  const dayCounts: Record<string, number> = {};
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  allDreams.forEach((dream) => {
    const day = dayNames[new Date(dream.createdAt).getDay()];
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });
  const mostActiveDay =
    Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  // Average mood
  const moodEntries = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]);
  const averageMood = moodEntries[0]?.[0] || "neutral";

  // Longest streak (simplified)
  const longestStreak = Math.max(profile.streakDays, 0);

  // Weekly emotions (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyEmotions = allDreams
    .filter((d) => new Date(d.createdAt) >= weekAgo)
    .map((d) => ({
      date: d.createdAt,
      emotion: d.emotions[0] || "neutral",
    }));

  return {
    totalDreams: profile.totalDreams,
    currentStreak: profile.streakDays,
    longestStreak,
    mostActiveDay,
    averageMood,
    topSymbols,
    emotionCounts,
    weeklyEmotions,
  };
}

// ── Daily Limit ──

export async function getInterpretationsToday(): Promise<number> {
  const database = await getDb();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const row = await database.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM dreams WHERE interpretation IS NOT NULL AND createdAt >= ?",
    today.toISOString()
  );

  return row?.count ?? 0;
}
