import { Client } from "@langchain/langgraph-sdk";
import { api } from "@/lib/api";


export function createClient(apiUrl: string, apiKey: string | undefined) {
  
  // console.log("client created with apiUrl", apiUrl, "and apiKey", apiKey);
  const defaultHeaders : Record<string, string> = {
    "Authorization": `Bearer ${api.accessToken}`,
    "X-Id-Token": api.idToken ?? "",
    "X-Customer-Id": api.csId ?? ""
  };
  return new Client({
    apiKey,
    apiUrl,
    defaultHeaders,
    // onRequest: async (url, init) => {
    //   console.log("onRequest", url, init);
    //   var defaultHeaders = {
    //     "Authorization": `Bearer ${api.accessToken}`,
    //     "X-Id-Token": api.idToken ?? "",
    //     "X-Customer-Id": api.csId ?? ""
    //   };
  
    //   return {
    //     ...init,
    //     headers: {
    //       // preserve any existing headers
    //       ...(init.headers as Record<string, string>),
    //       ...defaultHeaders,
    //     },
    //   };
    // },
  });
}
