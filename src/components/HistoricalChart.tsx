"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useConverter } from "@/contexts/ConverterContext";
// import { useTheme } from "@/contexts/ThemeContext";
import { translations } from "@/lib/translations";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface HistoricalRate {
    date: string;
    rate: number;
}

interface ChartData {
    date: string;
    rate: number;
    formattedDate: string;
}

// Constants
const ALL_TIME_START_DATE = '2025-11-02';
const EXCLUDED_DATE = '2025-11-01';

// Helper functions
const extractDateOnly = (dateString: string): string => {
    return dateString.split('T')[0];
};

const isValidDateForAllTime = (date: string): boolean => {
    const dateOnly = extractDateOnly(date);
    return dateOnly !== EXCLUDED_DATE && dateOnly >= ALL_TIME_START_DATE;
};

const formatDateForDisplay = (dateString: string, language: string): string => {
    const dateOnly = extractDateOnly(dateString);
    const [year, month, day] = dateOnly.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString(language, {
        month: 'short',
        day: 'numeric'
    });
};

const createRateMap = (rates: HistoricalRate[]): Map<string, number> => {
    const rateMap = new Map<string, number>();
    rates.forEach((rate) => {
        rateMap.set(rate.date, rate.rate);
    });
    return rateMap;
};

export default function HistoricalChart() {
    const { language, mounted } = useLanguage();
    const { fromCurrency, toCurrency } = useConverter();
    // const { theme, mounted: themeMounted } = useTheme();
    const t = translations[mounted ? language : "en"];

    // Chart line color based on theme
    // const lineColor = themeMounted && theme === "dark" ? "#CBD5E1" : "#475569";

    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [percentageChange, setPercentageChange] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<7 | 15 | 'all'>(15);
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const isMountedRef = useRef(true);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsSelectOpen(false);
            }
        };

        if (isSelectOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSelectOpen]);

    useEffect(() => {
        // Cancel previous request if it exists
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new AbortController for this request
        const abortController = new AbortController();
        abortControllerRef.current = abortController;
        const signal = abortController.signal;
        isMountedRef.current = true;

        const fetchHistoricalData = async () => {
            // Check if component is still mounted before setting loading state
            if (!isMountedRef.current) return;

            setIsLoading(true);
            setError(null);

            try {
                // Build API URL parameters based on time range
                const urlParams = timeRange === 'all'
                    ? `fromDate=${ALL_TIME_START_DATE}`
                    : `days=${timeRange}`;

                // Get historical data for both currencies
                const [fromResponse, toResponse] = await Promise.all([
                    fetch(`/api/historical/${fromCurrency}?${urlParams}`, { signal }),
                    fetch(`/api/historical/${toCurrency}?${urlParams}`, { signal })
                ]);

                const fromData = await fromResponse.json();
                const toData = await toResponse.json();

                if (!fromData.success || !toData.success) {
                    throw new Error("Failed to fetch historical data");
                }

                const fromRates = fromData.data.rates as HistoricalRate[];
                const toRates = toData.data.rates as HistoricalRate[];

                // Filter rates to only include dates from November 2, 2025 onwards (strictly exclude Nov 1)
                const filteredFromRates = fromRates.filter((rate) => isValidDateForAllTime(rate.date));
                const filteredToRates = toRates.filter((rate) => isValidDateForAllTime(rate.date));

                // Create maps for efficient rate lookup
                const fromRateMap = createRateMap(filteredFromRates);
                const toRateMap = createRateMap(filteredToRates);

                // Get all unique dates, filtered and sorted
                const allDates = Array.from(
                    new Set([
                        ...filteredFromRates.map((r) => r.date),
                        ...filteredToRates.map((r) => r.date)
                    ])
                )
                    .filter(isValidDateForAllTime)
                    .sort();

                // Calculate exchange rate for each date: toRate / fromRate
                // Both rates are against USD, so to convert from A to B: (B_rate / USD) / (A_rate / USD) = B_rate / A_rate
                const calculatedData: ChartData[] = allDates
                    .map((date) => {
                        const fromRate = fromRateMap.get(date);
                        const toRate = toRateMap.get(date);

                        if (fromRate && toRate && fromRate > 0) {
                            const exchangeRate = toRate / fromRate;
                            const formattedDate = formatDateForDisplay(date, mounted ? language : 'en');

                            return {
                                date,
                                rate: exchangeRate,
                                formattedDate
                            };
                        }
                        return null;
                    })
                    .filter((item): item is ChartData => item !== null)
                    .filter((item) => isValidDateForAllTime(item.date))
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                // Check if request was aborted before updating state
                if (signal.aborted || !isMountedRef.current) {
                    return;
                }

                setChartData(calculatedData);

                // Calculate percentage change (first vs last)
                if (calculatedData.length >= 2) {
                    const firstRate = calculatedData[0].rate;
                    const lastRate = calculatedData[calculatedData.length - 1].rate;
                    const change = ((lastRate - firstRate) / firstRate) * 100;
                    setPercentageChange(change);
                }

                setIsLoading(false);
            } catch (err) {
                // Ignore AbortError - it's expected when canceling previous requests
                if (err instanceof Error && err.name === 'AbortError') {
                    // Don't update state if request was aborted - new request will handle it
                    return;
                }

                // Only update error state if component is still mounted
                if (isMountedRef.current) {
                    setError(err instanceof Error ? err.message : "Failed to load chart data");
                    setIsLoading(false);
                }
            }
        };

        // Only fetch if currencies are set and component is mounted
        if (fromCurrency && toCurrency && mounted) {
            // Small delay to debounce rapid changes
            const timeoutId = setTimeout(() => {
                if (isMountedRef.current && !signal.aborted) {
                    fetchHistoricalData();
                }
            }, 100);

            return () => {
                clearTimeout(timeoutId);
                abortController.abort();
            };
        } else {
            setIsLoading(false);
        }

        // Cleanup: mark as unmounted and abort request
        return () => {
            isMountedRef.current = false;
            abortController.abort();
        };
    }, [fromCurrency, toCurrency, mounted, language, timeRange]); // Include timeRange to refetch when range changes

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-flare-primary">{t.loading}</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    if (chartData.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-flare-primary">No historical data available</div>
            </div>
        );
    }

    const formatTooltipValue = (value: number) => {
        return value.toFixed(2);
    };


    return (
        <div className="w-full relative z-0" style={{ minWidth: 0, width: '100%' }}>
            {/* Chart Header with Time Range Selector and Percentage */}
            <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
                {/* Time Range Selector */}
                <div className="relative" ref={dropdownRef}>
                    <div
                        onClick={() => setIsSelectOpen(!isSelectOpen)}
                        className="bg-gray-50 dark:bg-gray-700 text-flare-primary rounded-xl px-3 py-2 text-sm font-medium border-none outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150 flex items-center justify-between min-w-[100px] gap-2"
                    >
                        <span>
                            {timeRange === 7 ? t.days7 : timeRange === 15 ? t.days15 : t.allTime}
                        </span>
                        <svg className={`w-3 h-3 text-flare-primary transition-transform duration-300 ease-in-out flex-shrink-0 ${isSelectOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                    {isSelectOpen && (
                        <div className="absolute top-full z-50 mt-1 bg-white dark:bg-gray-700 rounded-lg shadow-lg w-full left-0 right-0 min-w-[100px] overflow-hidden">
                            <div
                                onClick={() => {
                                    setTimeRange(7);
                                    setIsSelectOpen(false);
                                }}
                                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors rounded-t-lg ${timeRange === 7 ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                            >
                                {t.days7}
                            </div>
                            <div
                                onClick={() => {
                                    setTimeRange(15);
                                    setIsSelectOpen(false);
                                }}
                                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${timeRange === 15 ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                            >
                                {t.days15}
                            </div>
                            <div
                                onClick={() => {
                                    setTimeRange('all');
                                    setIsSelectOpen(false);
                                }}
                                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors rounded-b-lg ${timeRange === 'all' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                            >
                                {t.allTime}
                            </div>
                        </div>
                    )}
                </div>

                {/* Percentage Change */}
                {percentageChange !== null && (
                    <div className={`flex items-center px-3 py-2 rounded-xl ${percentageChange >= 0 ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
                        <span className={`text-sm font-medium ${percentageChange >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                            {percentageChange >= 0 ? "+ " : "- "}
                            {Math.abs(percentageChange).toFixed(2)}%
                        </span>
                    </div>
                )}
            </div>

            {/* Chart */}
            <div className="w-full" style={{ height: '320px', minHeight: '320px', minWidth: '0' }}>
                <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                        <XAxis
                            dataKey="formattedDate"
                            stroke="#64748b"
                            className="dark:stroke-slate-400"
                            style={{ fontSize: "12px" }}
                        />
                        <YAxis
                            stroke="#64748b"
                            className="dark:stroke-slate-400"
                            style={{ fontSize: "12px" }}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                border: "1px solid #e2e8f0",
                                borderRadius: "8px",
                                padding: "8px 12px"
                            }}
                            formatter={(value: number) => [formatTooltipValue(value), "Rate"]}
                            labelStyle={{ color: "#1e293b", fontWeight: "bold" }}
                        />
                        <Line
                            type="monotone"
                            dataKey="rate"
                            stroke="#6366f1"
                            strokeWidth={2}
                            dot={{ fill: "#6366f1", r: 3 }}
                            activeDot={{ r: 5 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

