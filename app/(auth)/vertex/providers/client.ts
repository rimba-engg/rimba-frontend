import { Client } from "@langchain/langgraph-sdk";
import { api } from "@/lib/api";


export function createClient(apiUrl: string, apiKey: string | undefined) {
  
  const defaultHeaders : Record<string, string> = {
    "Authorization": `Bearer ${api.accessToken}`,
    "X-Id-Token": api.idToken ?? "",
    "X-Customer-Id": api.csId ?? ""
  };
  return new Client({
    apiKey,
    apiUrl,
    defaultHeaders,
  });
}
