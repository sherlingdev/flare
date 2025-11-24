"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface AuthModalContextType {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    isResetPasswordMode: boolean;
    setResetPasswordMode: (value: boolean) => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isResetPasswordMode, setIsResetPasswordMode] = useState(false);

    const openModal = () => setIsOpen(true);
    const closeModal = () => {
        setIsOpen(false);
        setIsResetPasswordMode(false);
    };
    const setResetPasswordMode = (value: boolean) => setIsResetPasswordMode(value);

    return (
        <AuthModalContext.Provider value={{ isOpen, openModal, closeModal, isResetPasswordMode, setResetPasswordMode }}>
            {children}
        </AuthModalContext.Provider>
    );
}

export function useAuthModal() {
    const context = useContext(AuthModalContext);
    if (context === undefined) {
        throw new Error('useAuthModal must be used within an AuthModalProvider');
    }
    return context;
}

