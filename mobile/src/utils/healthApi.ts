/**
 * Health API module for syncing with backend on port 8000
 * Handles fetching and updating health metrics from the fitness backend
 */

const API_BASE_URL = "http://localhost:8000";
const TIMEOUT_MS = 10000;

export interface HealthMetricsResponse {
  steps: number;
  stepsGoal: number;
  heartRate: number;
  sleepHours: number;
  activeMinutes: number;
  message?: string;
}

export interface HealthMetricsUpdate {
  steps?: number;
  stepsGoal?: number;
  heartRate?: number;
  sleepHours?: number;
  activeMinutes?: number;
}

class HealthApi {
  /**
   * Fetch current health metrics from backend
   */
  async getHealthMetrics(): Promise<HealthMetricsResponse | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      console.log("[HealthApi] Fetching health metrics from", `${API_BASE_URL}/health`);

      const response = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error("[HealthApi] Error fetching metrics:", response.status);
        return null;
      }

      const data = await response.json();
      console.log("[HealthApi] Received metrics:", data);
      return data as HealthMetricsResponse;
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error("[HealthApi] Fetch error:", error.message);

      if (error.name === "AbortError") {
        console.warn("[HealthApi] Request timeout");
      }

      return null;
    }
  }

  /**
   * Update health metrics on backend
   */
  async updateHealthMetrics(
    updates: HealthMetricsUpdate
  ): Promise<HealthMetricsResponse | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      console.log("[HealthApi] Updating health metrics with:", updates);

      const response = await fetch(`${API_BASE_URL}/health`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error("[HealthApi] Error updating metrics:", response.status);
        return null;
      }

      const data = await response.json();
      console.log("[HealthApi] Update successful:", data);
      return data as HealthMetricsResponse;
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error("[HealthApi] Update error:", error.message);
      return null;
    }
  }

  /**
   * Update only step count
   */
  async updateSteps(steps: number): Promise<HealthMetricsResponse | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      console.log("[HealthApi] Updating steps to:", steps);

      const response = await fetch(
        `${API_BASE_URL}/health/steps?steps=${Math.max(0, steps)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      console.log("[HealthApi] Steps updated:", data);
      return data as HealthMetricsResponse;
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error("[HealthApi] Steps update error:", error.message);
      return null;
    }
  }

  /**
   * Update only heart rate
   */
  async updateHeartRate(bpm: number): Promise<HealthMetricsResponse | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      console.log("[HealthApi] Updating heart rate to:", bpm);

      const response = await fetch(
        `${API_BASE_URL}/health/heart-rate?bpm=${Math.max(0, Math.min(300, bpm))}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data as HealthMetricsResponse;
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error("[HealthApi] Heart rate update error:", error.message);
      return null;
    }
  }

  /**
   * Update only sleep hours
   */
  async updateSleep(hours: number): Promise<HealthMetricsResponse | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      console.log("[HealthApi] Updating sleep to:", hours);

      const response = await fetch(
        `${API_BASE_URL}/health/sleep?hours=${Math.max(0, Math.min(24, hours))}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data as HealthMetricsResponse;
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error("[HealthApi] Sleep update error:", error.message);
      return null;
    }
  }

  /**
   * Update only active minutes
   */
  async updateActiveMinutes(
    minutes: number
  ): Promise<HealthMetricsResponse | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      console.log("[HealthApi] Updating active minutes to:", minutes);

      const response = await fetch(
        `${API_BASE_URL}/health/active-minutes?minutes=${Math.max(0, minutes)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data as HealthMetricsResponse;
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error("[HealthApi] Active minutes update error:", error.message);
      return null;
    }
  }

  /**
   * Test connection to health API
   */
  async testConnection(): Promise<boolean> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      console.log("[HealthApi] Testing connection to", `${API_BASE_URL}/health`);

      const response = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const isConnected = response.ok;
      console.log("[HealthApi] Connection test:", isConnected ? "OK" : "FAILED");
      return isConnected;
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.warn("[HealthApi] Connection test failed:", error.message);
      return false;
    }
  }
}

export const healthApi = new HealthApi();
