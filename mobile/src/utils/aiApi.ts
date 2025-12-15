import { AskAIResponse, UserContext } from "../types/ai";

const API_BASE_URL = "http://localhost:8000";
const TIMEOUT_MS = 25000;

// Helper to remove undefined values from objects (prevents JSON serialization issues)
function cleanObject<T extends object>(obj: T): T {
  const cleaned = {} as T;
  for (const key in obj) {
    const value = obj[key];
    if (value !== undefined && value !== null) {
      if (typeof value === "object" && !Array.isArray(value)) {
        cleaned[key] = cleanObject(value as object) as T[typeof key];
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}

class AIApi {
  async askAI(
    question: string,
    userContext?: UserContext,
    conversationHistory?: { role: "user" | "assistant"; content: string }[]
  ): Promise<AskAIResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      // Build request body, only including defined values
      const requestBody: Record<string, unknown> = {
        question,
      };

      if (userContext) {
        requestBody.userContext = cleanObject(userContext);
      }

      if (conversationHistory && conversationHistory.length > 0) {
        requestBody.conversationHistory = conversationHistory.slice(-10);
      }

      console.log("AI Request:", JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${API_BASE_URL}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI API Error:", response.status, errorText);
        let errorDetail = `Server error: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorDetail = errorData.detail || errorDetail;
        } catch {
          // Use default error message
        }
        throw new Error(errorDetail);
      }

      const data = await response.json();
      return { answer: data.answer };
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        throw new Error("Request timed out. Please try again.");
      }

      if (error.message?.includes("Network request failed")) {
        throw new Error(
          "Unable to connect to server. Please check your connection."
        );
      }

      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const aiApi = new AIApi();
