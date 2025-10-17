"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../lib/translations';
import { getLastUpdated } from '../lib/scraper';

export default function LastUpdated() {
    const { language, mounted } = useLanguage();
    const t = translations[mounted ? language : "en"];

    const [formattedTimestamp, setFormattedTimestamp] = useState<string>('');
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        // Only set timestamp after hydration to prevent mismatch
        setIsHydrated(true);
        const lastUpdatedTime = getLastUpdated();
        setFormattedTimestamp(lastUpdatedTime);
    }, [mounted]);

    const formatMixedDate = (timestamp: string) => {
        const date = new Date(timestamp);

        // Get the full date and time format
        const fullDate = date.toLocaleDateString(mounted ? language : 'en', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const fullTime = date.toLocaleTimeString(mounted ? language : 'en', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        // Return clean format without text and parentheses
        if (mounted && language === 'es') {
            // Spanish: same format as English with dots (month day, year)
            const englishFormatDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }).replace('Oct', 'Oct.').replace('Jan', 'Jan.').replace('Feb', 'Feb.').replace('Mar', 'Mar.').replace('Apr', 'Apr.').replace('May', 'May').replace('Jun', 'Jun.').replace('Jul', 'Jul.').replace('Aug', 'Aug.').replace('Sep', 'Sep.').replace('Nov', 'Nov.').replace('Dec', 'Dec.');
            return `${fullTime} • ${englishFormatDate}`;
        } else {
            // English: abbreviated month for consistency
            const abbreviatedDate = fullDate.replace('January', 'Jan.').replace('February', 'Feb.').replace('March', 'Mar.').replace('April', 'Apr.').replace('May', 'May').replace('June', 'Jun.').replace('July', 'Jul.').replace('August', 'Aug.').replace('September', 'Sep.').replace('October', 'Oct.').replace('November', 'Nov.').replace('December', 'Dec.');
            return `${fullTime} • ${abbreviatedDate}`;
        }
    };

    // Prevent hydration mismatch by not rendering until after hydration
    if (!isHydrated) {
        return (
            <div className="flex justify-center">
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200 text-center">
                    {t.loading}
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center">
            <div className="text-sm font-medium text-slate-800 dark:text-slate-200 text-center">
                {formattedTimestamp ? formatMixedDate(formattedTimestamp) : t.loading}
            </div>
        </div>
    );
}
