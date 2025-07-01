import { BASE_URL } from "@/lib/api";

const DEFAULT_HIVE_API_URL = `${BASE_URL}/hive`;
const DEFAULT_HIVE_ASSISTANT_ID = "vertex";
export const hiveConfig = {
  apiUrl: process.env.NEXT_PUBLIC_HIVE_API_URL || DEFAULT_HIVE_API_URL,
  assistantId: process.env.NEXT_PUBLIC_HIVE_ASSISTANT_ID || DEFAULT_HIVE_ASSISTANT_ID,
  apiKey: process.env.NEXT_PUBLIC_HIVE_API_KEY || "",
};