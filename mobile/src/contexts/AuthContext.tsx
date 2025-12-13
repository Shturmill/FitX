import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { storageUtils, UserSettings, AuthState } from "../utils/storage";

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  userSettings: UserSettings | null;
  login: (settings: UserSettings) => Promise<void>;
  logout: () => Promise<void>;
  updateSettings: (settings: UserSettings) => Promise<void>;
  checkAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      const authState = await storageUtils.getAuthState();
      const settings = await storageUtils.getUserSettings();

      setIsLoggedIn(authState.isLoggedIn);
      setUserSettings(settings);
    } catch (error) {
      console.error("Error checking auth state:", error);
      setIsLoggedIn(false);
      setUserSettings(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (settings: UserSettings) => {
    try {
      const settingsWithOnboarding = {
        ...settings,
        completedOnboarding: true,
      };

      await storageUtils.saveUserSettings(settingsWithOnboarding);
      await storageUtils.saveAuthState({
        isLoggedIn: true,
        userId: Date.now().toString(),
      });

      setUserSettings(settingsWithOnboarding);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await storageUtils.logout();
      setIsLoggedIn(false);
      setUserSettings(null);
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  };

  const updateSettings = async (settings: UserSettings) => {
    try {
      await storageUtils.saveUserSettings(settings);
      setUserSettings(settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isLoading,
        userSettings,
        login,
        logout,
        updateSettings,
        checkAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
