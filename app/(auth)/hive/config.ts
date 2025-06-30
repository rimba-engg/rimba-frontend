export const hiveConfig = {
  apiUrl: process.env.NEXT_PUBLIC_HIVE_API_URL || "http://localhost:2024",
  assistantId: process.env.NEXT_PUBLIC_HIVE_ASSISTANT_ID || "vertex",
  apiKey: process.env.NEXT_PUBLIC_HIVE_API_KEY || "",
};