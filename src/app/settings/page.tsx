"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Loader from "@/components/Loader";
import SettingsView from "@/components/SettingsView";

export default function SettingsPage() {
    const { mounted } = useLanguage();
    const { openModal } = useAuthModal();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                openModal();
                setIsAuthenticated(false);
                return;
            }
            setIsAuthenticated(true);
        };

        if (mounted) {
            checkAuth();
        }

        const supabase = createClient();
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [mounted, openModal]);

    if (!mounted || isAuthenticated === null) {
        return <Loader show />;
    }

    if (!isAuthenticated) {
        return null;
    }

    return <SettingsView />;
}
