import { DreamInterpretation } from "@/types";
import Constants from "expo-constants";

// Groq API configuration — key loaded from EAS Secrets / env vars
const GROQ_API_KEY = Constants.expoConfig?.extra?.groqApiKey || process.env.EXPO_PUBLIC_GROQ_API_KEY || "";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are a compassionate dream analyst blending Jungian psychology, modern neuroscience, and cultural symbolism. Your role is to help users understand their dreams in a way that feels personal, insightful, and actionable.

RULES:
- Always reference specific details from the user's dream description
- Use warm second-person language ("Your dream about...")
- Blend psychology with accessibility (no jargon without explanation)
- Identify 2-4 key symbols and explain each
- Connect dream themes to possible waking life situations
- End with a reflective question that encourages self-awareness
- Never be definitive ("This MEANS...") — always suggest ("This may reflect...")
- Never diagnose medical/mental health conditions
- Keep overview to 2-3 sentences, full interpretation to 200 words
- Always end with a reflection question

RESPOND WITH VALID JSON ONLY (no markdown, no code fences):
{
  "overview": "2-3 sentence summary",
  "symbols": [
    {"name": "Symbol Name", "emoji": "🔮", "meaning": "brief meaning"}
  ],
  "interpretation": "Full multi-paragraph interpretation (200 words)",
  "reflection": "A thought-provoking question",
  "moodDetected": "calm|anxious|happy|sad|confused|scared|excited",
  "themes": ["theme1", "theme2"]
}`;

export async function interpretDream(
  dreamContent: string,
  emotions: string[],
  tags: string[]
): Promise<DreamInterpretation> {
  const userMessage = `Dream description: "${dreamContent}"
${emotions.length > 0 ? `Emotions I felt: ${emotions.join(", ")}` : ""}
${tags.length > 0 ? `Dream elements: ${tags.join(", ")}` : ""}

Please analyze this dream.`;

  try {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.8,
        max_tokens: 1024,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleaned) as DreamInterpretation;

    // Validate required fields
    if (!parsed.overview || !parsed.interpretation || !parsed.symbols) {
      throw new Error("Invalid AI response structure");
    }

    return parsed;
  } catch (error) {
    console.error("Dream interpretation error:", error);
    // Return a graceful fallback
    return {
      overview:
        "Your dream contains rich symbolism worth exploring. The images and feelings you described suggest your subconscious is processing important themes.",
      symbols: [
        {
          name: "Dream Imagery",
          emoji: "🌙",
          meaning: "Your dream's imagery reflects your inner emotional landscape",
        },
      ],
      interpretation:
        "While we couldn't fully analyze your dream at this moment, the very act of recording it is valuable. Dreams often process our daily experiences, unresolved emotions, and deeper desires. The emotions you felt during the dream — whether fear, joy, confusion, or peace — are important clues to what your subconscious is working through. Consider journaling about what in your waking life might connect to the feelings and scenarios in this dream. Patterns often emerge over time, and keeping a dream journal is one of the most powerful tools for self-understanding.",
      reflection:
        "What feeling from this dream stayed with you the longest after waking? What might that feeling be connected to in your daily life?",
      moodDetected: emotions[0] || "curious",
      themes: ["self-reflection", "inner-growth"],
    };
  }
}
