"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    /** Set light or dark explicitly (e.g. settings picker). */
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    mounted: boolean;
    isDark: boolean;
    isLight: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // Always start with "dark" to match server rendering
    const [theme, setThemeState] = useState<Theme>("dark");
    const [mounted, setMounted] = useState(false);

    // Load theme from localStorage after mount
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "light" || savedTheme === "dark") {
            setThemeState(savedTheme);
        }
        setMounted(true);
    }, []);

    // Apply theme to DOM when theme changes
    useEffect(() => {
        if (mounted) {
            const root = window.document.documentElement;

            if (theme === "dark") {
                root.classList.add("dark");
            } else {
                root.classList.remove("dark");
            }
        }
    }, [theme, mounted]);

    // Save to localStorage when theme changes
    useEffect(() => {
        if (mounted) {
            localStorage.setItem("theme", theme);
        }
    }, [theme, mounted]);

    const setTheme = useCallback((next: Theme) => {
        setThemeState(next);
    }, []);

    const toggleTheme = useCallback(() => {
        setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
    }, []);

    const value = {
        theme,
        setTheme,
        toggleTheme,
        mounted,
        isDark: theme === "dark",
        isLight: theme === "light"
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
