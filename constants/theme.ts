// Theme constants matching our design system
export const Colors = {
  dream: {
    bg: "#0A0E27",
    surface: "#151A3A",
    card: "#1C2145",
    purple: "#7C5CFC",
    gold: "#FFB647",
    green: "#4ADE80",
    red: "#F87171",
    blue: "#3B82F6",
    teal: "#2DD4BF",
    amber: "#F59E0B",
    gray: "#6B7280",
    lightPurple: "#A78BFA",
  },
  text: {
    primary: "#F1F5F9",
    secondary: "#94A3B8",
    muted: "#64748B",
  },
  emotion: {
    calm: "#7C5CFC",
    happy: "#FFB647",
    anxious: "#F87171",
    sad: "#3B82F6",
    scared: "#6B7280",
    excited: "#F59E0B",
    confused: "#A78BFA",
    curious: "#2DD4BF",
    angry: "#EF4444",
    surprised: "#EC4899",
  } as Record<string, string>,
};

export const EMOTIONS = [
  { key: "anxious", emoji: "😰", label: "Anxious", color: Colors.emotion.anxious },
  { key: "scared", emoji: "😨", label: "Scared", color: Colors.emotion.scared },
  { key: "confused", emoji: "😐", label: "Confused", color: Colors.emotion.confused },
  { key: "calm", emoji: "😌", label: "Calm", color: Colors.emotion.calm },
  { key: "happy", emoji: "😊", label: "Happy", color: Colors.emotion.happy },
  { key: "excited", emoji: "😍", label: "Excited", color: Colors.emotion.excited },
  { key: "curious", emoji: "🤔", label: "Curious", color: Colors.emotion.curious },
  { key: "sad", emoji: "😢", label: "Sad", color: Colors.emotion.sad },
  { key: "angry", emoji: "😡", label: "Angry", color: Colors.emotion.angry },
  { key: "surprised", emoji: "😮", label: "Surprised", color: Colors.emotion.surprised },
];

export const DREAM_TAGS = [
  { key: "people", emoji: "👥", label: "People" },
  { key: "places", emoji: "🏠", label: "Places" },
  { key: "animals", emoji: "🐍", label: "Animals" },
  { key: "water", emoji: "🌊", label: "Water" },
  { key: "flying", emoji: "✈️", label: "Flying" },
  { key: "falling", emoji: "⬇️", label: "Falling" },
  { key: "chase", emoji: "🏃", label: "Chase" },
  { key: "death", emoji: "💀", label: "Death" },
  { key: "school", emoji: "🏫", label: "School" },
  { key: "family", emoji: "👨‍👩‍👧", label: "Family" },
  { key: "vehicle", emoji: "🚗", label: "Vehicle" },
  { key: "nature", emoji: "🌳", label: "Nature" },
];

export const DREAM_QUOTES = [
  { text: "Dreams are the royal road to the unconscious.", author: "Sigmund Freud" },
  { text: "The dream is a little hidden door in the innermost secret recesses of the soul.", author: "Carl Jung" },
  { text: "All that we see or seem is but a dream within a dream.", author: "Edgar Allan Poe" },
  { text: "Dreams are illustrations from the book your soul is writing about you.", author: "Marsha Norman" },
  { text: "A dream uninterpreted is like a letter unread.", author: "The Talmud" },
  { text: "Dreams are today's answers to tomorrow's questions.", author: "Edgar Cayce" },
  { text: "In dreams, we enter a world that's entirely our own.", author: "Albus Dumbledore" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
];

export const ONBOARDING_FREQUENCIES = [
  { key: "rarely", emoji: "🌑", label: "Rarely" },
  { key: "weekly", emoji: "🌘", label: "Once a week" },
  { key: "several", emoji: "🌗", label: "A few times a week" },
  { key: "nightly", emoji: "🌕", label: "Almost every night" },
];

export const ONBOARDING_INTERESTS = [
  "Understanding symbols",
  "Emotional patterns",
  "Self-growth",
  "Lucid dreaming",
  "Nightmares",
  "Just curious",
];
