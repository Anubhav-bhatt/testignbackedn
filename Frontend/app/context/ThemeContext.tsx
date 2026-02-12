import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    colors: typeof lightColors;
}

export const lightColors = {
    background: "#FFFFFF",
    surface: "#FFFFFF",
    text: "#0F172A",
    textSecondary: "#64748B",
    border: "#E2E8F0",
    primary: "#2563EB",
    accent: "#F1F5F9",
    danger: "#EF4444",
    success: "#10B981",
    warning: "#F59E0B",
    card: "#FFFFFF",
    tint: "#2563EB",
    tabBar: "rgba(255, 255, 255, 0.9)",
};

export const darkColors = {
    background: "#020617",
    surface: "#1E293B",
    text: "#F8FAFC",
    textSecondary: "#94A3B8",
    border: "#334155",
    primary: "#3B82F6",
    accent: "#1E293B",
    danger: "#F87171",
    success: "#34D399",
    warning: "#FBBF24",
    card: "#0F172A",
    tint: "#60A5FA",
    tabBar: "rgba(15, 23, 42, 0.9)",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemScheme = useColorScheme();
    const [theme, setTheme] = useState<Theme>(systemScheme === "dark" ? "dark" : "light");
    const [isLoaded, setIsLoaded] = useState(false);

    // Load saved theme on mount
    useEffect(() => {
        (async () => {
            try {
                const savedTheme = await AsyncStorage.getItem("user-theme");
                if (savedTheme === "dark" || savedTheme === "light") {
                    setTheme(savedTheme);
                }
            } catch (e) {
                console.log("Failed to load theme preference", e);
            } finally {
                setIsLoaded(true);
            }
        })();
    }, []);

    const toggleTheme = () => {
        setTheme((prev) => {
            const newTheme = prev === "light" ? "dark" : "light";
            // Fire and forget save
            AsyncStorage.setItem("user-theme", newTheme).catch(err =>
                console.log("Failed to save theme preference", err)
            );
            return newTheme;
        });
    };

    const colors = theme === "light" ? lightColors : darkColors;

    // Optional: You could return a loading spinner here if isLoaded is false
    // But returning children immediately (with default theme) prevents flicker if default matches system

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
export default ThemeProvider;
