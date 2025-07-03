import { BASE_URL } from "@/lib/api";

const DEFAULT_VERTEX_API_URL = `${BASE_URL}/vertex`;
const DEFAULT_VERTEX_ASSISTANT_ID = "vertex";
export const vertexAgentConfig = {
  apiUrl: process.env.NEXT_PUBLIC_VERTEX_API_URL || DEFAULT_VERTEX_API_URL,
  assistantId: process.env.NEXT_PUBLIC_VERTEX_ASSISTANT_ID || DEFAULT_VERTEX_ASSISTANT_ID,
  apiKey: process.env.NEXT_PUBLIC_VERTEX_API_KEY || "",
};