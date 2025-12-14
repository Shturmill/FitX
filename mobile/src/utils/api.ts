import { HealthMetrics } from "./storage";

const API_BASE_URL = "http://localhost:8000";

export interface ApiHealthMetrics {
  steps: number;
  stepsGoal: number;
  heartRate: number;
  sleepHours: number;
  activeMinutes: number;
  message: string;
}

class HealthMetricsAPI {
  /**
   * Get health metrics from backend
   */
  async getHealthMetrics(): Promise<HealthMetrics> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data: ApiHealthMetrics = await response.json();
      return {
        steps: data.steps,
        stepsGoal: data.stepsGoal,
        heartRate: data.heartRate,
        sleepHours: data.sleepHours,
        activeMinutes: data.activeMinutes,
        date: new Date().toISOString().split("T")[0],
      };
    } catch (error) {
      console.error("Error fetching health metrics from API:", error);
      throw error;
    }
  }

  /**
   * Update health metrics on backend
   */
  async updateHealthMetrics(
    metrics: Partial<HealthMetrics>
  ): Promise<HealthMetrics> {
    try {
      const body: Record<string, any> = {};
      if (metrics.steps !== undefined) body.steps = metrics.steps;
      if (metrics.stepsGoal !== undefined) body.stepsGoal = metrics.stepsGoal;
      if (metrics.heartRate !== undefined) body.heartRate = metrics.heartRate;
      if (metrics.sleepHours !== undefined) body.sleepHours = metrics.sleepHours;
      if (metrics.activeMinutes !== undefined)
        body.activeMinutes = metrics.activeMinutes;

      const response = await fetch(`${API_BASE_URL}/health`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: ApiHealthMetrics = await response.json();
      return {
        steps: data.steps,
        stepsGoal: data.stepsGoal,
        heartRate: data.heartRate,
        sleepHours: data.sleepHours,
        activeMinutes: data.activeMinutes,
        date: new Date().toISOString().split("T")[0],
      };
    } catch (error) {
      console.error("Error updating health metrics on API:", error);
      throw error;
    }
  }

  /**
   * Update steps
   */
  async updateSteps(steps: number): Promise<HealthMetrics> {
    try {
      const response = await fetch(`${API_BASE_URL}/health/steps?steps=${steps}`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: ApiHealthMetrics = await response.json();
      return {
        steps: data.steps,
        stepsGoal: data.stepsGoal,
        heartRate: data.heartRate,
        sleepHours: data.sleepHours,
        activeMinutes: data.activeMinutes,
        date: new Date().toISOString().split("T")[0],
      };
    } catch (error) {
      console.error("Error updating steps on API:", error);
      throw error;
    }
  }

  /**
   * Update heart rate
   */
  async updateHeartRate(bpm: number): Promise<HealthMetrics> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/health/heart-rate?bpm=${bpm}`,
        { method: "PUT" }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: ApiHealthMetrics = await response.json();
      return {
        steps: data.steps,
        stepsGoal: data.stepsGoal,
        heartRate: data.heartRate,
        sleepHours: data.sleepHours,
        activeMinutes: data.activeMinutes,
        date: new Date().toISOString().split("T")[0],
      };
    } catch (error) {
      console.error("Error updating heart rate on API:", error);
      throw error;
    }
  }

  /**
   * Update sleep hours
   */
  async updateSleep(hours: number): Promise<HealthMetrics> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/health/sleep?hours=${hours}`,
        { method: "PUT" }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: ApiHealthMetrics = await response.json();
      return {
        steps: data.steps,
        stepsGoal: data.stepsGoal,
        heartRate: data.heartRate,
        sleepHours: data.sleepHours,
        activeMinutes: data.activeMinutes,
        date: new Date().toISOString().split("T")[0],
      };
    } catch (error) {
      console.error("Error updating sleep on API:", error);
      throw error;
    }
  }

  /**
   * Update active minutes
   */
  async updateActiveMinutes(minutes: number): Promise<HealthMetrics> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/health/active-minutes?minutes=${minutes}`,
        { method: "PUT" }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: ApiHealthMetrics = await response.json();
      return {
        steps: data.steps,
        stepsGoal: data.stepsGoal,
        heartRate: data.heartRate,
        sleepHours: data.sleepHours,
        activeMinutes: data.activeMinutes,
        date: new Date().toISOString().split("T")[0],
      };
    } catch (error) {
      console.error("Error updating active minutes on API:", error);
      throw error;
    }
  }

  /**
   * Test connection to API
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
      });
      return response.ok;
    } catch (error) {
      console.warn("API connection test failed:", error);
      return false;
    }
  }
}

export const healthMetricsAPI = new HealthMetricsAPI();
