"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useConverter } from "@/contexts/ConverterContext";
// import { useTheme } from "@/contexts/ThemeContext";
import { translations } from "@/lib/translations";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
const MAX_CUSTOM_RANGE_DAYS = 365;

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

const getDaysBetween = (from: string, to: string): number => {
    const fromTime = new Date(from).getTime();
    const toTime = new Date(to).getTime();
    return Math.round((toTime - fromTime) / (24 * 60 * 60 * 1000));
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
    const [timeRange, setTimeRange] = useState<7 | 15 | 30 | 60 | 90 | 'all' | 'custom'>(15);
    const [customFromDate, setCustomFromDate] = useState<string>('');
    const [customToDate, setCustomToDate] = useState<string>('');
    const [appliedCustomFromDate, setAppliedCustomFromDate] = useState<string>('');
    const [appliedCustomToDate, setAppliedCustomToDate] = useState<string>('');
    const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [isChartTypeOpen, setIsChartTypeOpen] = useState(false);
    const [isApplyingCustom, setIsApplyingCustom] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const isMountedRef = useRef(true);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const chartTypeDropdownRef = useRef<HTMLDivElement>(null);
    const customFromInputRef = useRef<HTMLInputElement>(null);
    const customToInputRef = useRef<HTMLInputElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsSelectOpen(false);
            }
            if (chartTypeDropdownRef.current && !chartTypeDropdownRef.current.contains(event.target as Node)) {
                setIsChartTypeOpen(false);
            }
        };

        if (isSelectOpen || isChartTypeOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSelectOpen, isChartTypeOpen]);

    // Close dropdown after Apply finishes loading (same pattern as other buttons in app)
    useEffect(() => {
        if (isApplyingCustom && !isLoading) {
            setIsSelectOpen(false);
            setIsApplyingCustom(false);
        }
    }, [isApplyingCustom, isLoading]);

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
                let urlParams: string;
                if (timeRange === 'all') {
                    urlParams = `fromDate=${ALL_TIME_START_DATE}`;
                } else if (timeRange === 'custom' && appliedCustomFromDate && appliedCustomToDate) {
                    urlParams = `fromDate=${appliedCustomFromDate}&toDate=${appliedCustomToDate}`;
                } else if (timeRange !== 'custom') {
                    urlParams = `days=${timeRange}`;
                } else {
                    setIsLoading(false);
                    return;
                }

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
    }, [fromCurrency, toCurrency, mounted, language, timeRange, appliedCustomFromDate, appliedCustomToDate]);

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
                <div className="text-flare-primary">{t.noHistoricalData}</div>
            </div>
        );
    }

    const formatTooltipValue = (value: number) => {
        return value.toFixed(2);
    };

    const tickProps = (props: { x?: number; y?: number; payload?: { value?: string } }) => {
        const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
        const { x = 0, y = 0, payload } = props;
        return (
            <text x={x} y={y} fill={isDark ? '#cbd5e1' : '#475569'} fontSize="12px" fontWeight={500} textAnchor="middle">
                {payload?.value}
            </text>
        );
    };
    const tickPropsY = (props: { x?: number; y?: number; payload?: { value?: number } }) => {
        const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
        const { x = 0, y = 0, payload } = props;
        return (
            <text x={x} y={y} fill={isDark ? '#cbd5e1' : '#475569'} fontSize="12px" fontWeight={500} textAnchor="end">
                {payload?.value}
            </text>
        );
    };
    type TooltipPayload = readonly { value?: number }[];
    const tooltipContent = (props: { active?: boolean; payload?: TooltipPayload; label?: string | number }) => {
        const { active, payload, label } = props;
        if (active && payload && payload.length && payload[0].value != null) {
            const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
            const value = payload[0].value;
            return (
                <div className={`rounded-xl p-3 shadow-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                    <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>{label}</p>
                    <p className={`text-sm font-medium ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Rate: {formatTooltipValue(value)}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full relative z-0" style={{ minWidth: 0, width: '100%' }}>
            {/* Chart Header with Time Range Selector and Percentage */}
            <div className="mb-10 pb-4 px-4 py-4 -mx-4 -mt-4 bg-[#F9FAFB] dark:bg-[#374151] backdrop-blur-sm rounded-xl flex items-center justify-between gap-2 sm:gap-4 flex-nowrap relative z-10 min-w-0">
                {/* Time range + Chart type */}
                <div className="flex items-center gap-2 sm:gap-3 flex-nowrap min-w-0">
                    {/* Time Range Selector - shrink-0 so dropdown is not clipped; no overflow on header so dropdown shows */}
                    <div className="relative z-20 w-fit shrink-0" ref={dropdownRef}>
                    <div
                        onClick={() => setIsSelectOpen(!isSelectOpen)}
                        className="bg-[#F9FAFB] dark:bg-[#374151] text-flare-primary rounded-xl px-3 sm:px-4 py-2.5 text-sm font-medium outline-none cursor-pointer hover:bg-[#F3F4F6] dark:hover:bg-[#4B5563] transition-all duration-200 flex items-center justify-between min-w-[7rem] sm:min-w-[120px] gap-1.5 sm:gap-2 border border-gray-200/60 dark:border-slate-600/50 shrink-0"
                    >
                        <span>
                            {timeRange === 7 ? t.days7 : timeRange === 15 ? t.days15 : timeRange === 30 ? t.days30 : timeRange === 60 ? t.days60 : timeRange === 90 ? t.days90 : timeRange === 'all' ? t.allTime : (() => {
                                if (timeRange !== 'custom') return t.customRange;
                                const from = appliedCustomFromDate && appliedCustomToDate ? appliedCustomFromDate : customFromDate;
                                const to = appliedCustomFromDate && appliedCustomToDate ? appliedCustomToDate : customToDate;
                                return from && to ? `${formatDateForDisplay(from, mounted ? language : 'en')} – ${formatDateForDisplay(to, mounted ? language : 'en')}` : t.customRange;
                            })()}
                        </span>
                        <svg className={`w-4 h-4 text-flare-primary transition-transform duration-300 ease-in-out flex-shrink-0 ${isSelectOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                    {isSelectOpen && (
                        <div className="absolute top-full left-0 right-0 z-[9999] mt-2 flex flex-col sm:flex-row items-stretch sm:items-start gap-0 w-full max-w-[min(100%,calc(100vw-2rem))]">
                            {/* Main menu: same width as trigger (select arriba) */}
                            <div className="w-full min-w-0 bg-[#F9FAFB] dark:bg-[#374151] rounded-xl shadow-xl overflow-visible shrink-0">
                                <div
                                    onClick={() => { setTimeRange('all'); setIsSelectOpen(false); }}
                                    className={`px-4 py-2.5 text-sm font-normal cursor-pointer hover:bg-[#F3F4F6] dark:hover:bg-[#4B5563] transition-colors ${timeRange === 'all' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium' : 'text-flare-primary'}`}
                                >
                                    {t.allTime}
                                </div>
                                <div
                                    onClick={() => { setTimeRange(7); setIsSelectOpen(false); }}
                                    className={`px-4 py-2.5 text-sm font-normal cursor-pointer hover:bg-[#F3F4F6] dark:hover:bg-[#4B5563] transition-colors ${timeRange === 7 ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium' : 'text-flare-primary'}`}
                                >
                                    {t.days7}
                                </div>
                                <div
                                    onClick={() => { setTimeRange(15); setIsSelectOpen(false); }}
                                    className={`px-4 py-2.5 text-sm font-normal cursor-pointer hover:bg-[#F3F4F6] dark:hover:bg-[#4B5563] transition-colors ${timeRange === 15 ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium' : 'text-flare-primary'}`}
                                >
                                    {t.days15}
                                </div>
                                <div
                                    onClick={() => { setTimeRange(30); setIsSelectOpen(false); }}
                                    className={`px-4 py-2.5 text-sm font-normal cursor-pointer hover:bg-[#F3F4F6] dark:hover:bg-[#4B5563] transition-colors ${timeRange === 30 ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium' : 'text-flare-primary'}`}
                                >
                                    {t.days30}
                                </div>
                                <div
                                    onClick={() => { setTimeRange(60); setIsSelectOpen(false); }}
                                    className={`px-4 py-2.5 text-sm font-normal cursor-pointer hover:bg-[#F3F4F6] dark:hover:bg-[#4B5563] transition-colors ${timeRange === 60 ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium' : 'text-flare-primary'}`}
                                >
                                    {t.days60}
                                </div>
                                <div
                                    onClick={() => { setTimeRange(90); setIsSelectOpen(false); }}
                                    className={`px-4 py-2.5 text-sm font-normal cursor-pointer hover:bg-[#F3F4F6] dark:hover:bg-[#4B5563] transition-colors ${timeRange === 90 ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium' : 'text-flare-primary'}`}
                                >
                                    {t.days90}
                                </div>
                                <div className="relative border-t border-gray-200/60 dark:border-slate-600/50">
                                    <div
                                        onClick={() => {
                                            setTimeRange('custom');
                                            if (!customFromDate || !customToDate) {
                                                const to = new Date();
                                                const from = new Date();
                                                from.setDate(from.getDate() - 30);
                                                const fromStr = from.toISOString().split('T')[0];
                                                const toStr = to.toISOString().split('T')[0];
                                                setCustomFromDate(fromStr >= ALL_TIME_START_DATE ? fromStr : ALL_TIME_START_DATE);
                                                setCustomToDate(toStr);
                                            }
                                        }}
                                        className={`px-4 py-2.5 text-sm font-normal cursor-pointer hover:bg-[#F3F4F6] dark:hover:bg-[#4B5563] transition-colors whitespace-nowrap rounded-b-xl ${timeRange === 'custom' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium' : 'text-flare-primary'}`}
                                    >
                                        {t.customRange}
                                    </div>
                                    {/* Submenu: on mobile below row, on sm+ to the right */}
                                    {timeRange === 'custom' && (
                                        <div className="absolute left-0 top-full mt-1 w-full min-w-[300px] max-w-[calc(100vw-1.5rem)] sm:top-0 sm:left-full sm:mt-0 sm:ml-1 sm:w-auto sm:min-w-[200px] sm:max-w-none rounded-xl shadow-xl bg-[#F9FAFB] dark:bg-[#374151] border border-gray-200/60 dark:border-slate-600/50 overflow-hidden z-10" onClick={(e) => e.stopPropagation()}>
                                            <div className="p-4 sm:p-3 flex flex-col gap-4 sm:gap-3">
                                                <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4 sm:gap-2">
                                                    <div className="w-full sm:flex-1 sm:min-w-0">
                                                        <label className="block text-sm font-medium text-flare-primary mb-2 sm:mb-1">{t.customRangeFrom}</label>
                                                        <div className="relative w-full min-w-0 min-h-[2.75rem] overflow-hidden rounded-lg">
                                                            <input
                                                                ref={customFromInputRef}
                                                                type="date"
                                                                value={customFromDate}
                                                                min={ALL_TIME_START_DATE}
                                                                max={customToDate || undefined}
                                                                onChange={(e) => setCustomFromDate(e.target.value)}
                                                                style={{ fontSize: '14px' }}
                                                                className="w-full min-w-[200px] h-full min-h-[2.75rem] rounded-lg pl-3 pr-10 py-2.5 text-sm font-normal bg-[#F3F4F6] dark:bg-[#4B5563] border border-gray-200/60 dark:border-slate-600/50 text-flare-primary cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-6 [&::-webkit-calendar-picker-indicator]:h-full box-border"
                                                            />
                                                            <button type="button" tabIndex={-1} aria-label="Open calendar" onClick={() => customFromInputRef.current?.showPicker?.() ?? customFromInputRef.current?.click()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-flare-primary cursor-pointer pointer-events-auto flex items-center justify-center">
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="w-full sm:flex-1 sm:min-w-0">
                                                        <label className="block text-sm font-medium text-flare-primary mb-2 sm:mb-1">{t.customRangeTo}</label>
                                                        <div className="relative w-full min-w-0 min-h-[2.75rem] overflow-hidden rounded-lg">
                                                            <input
                                                                ref={customToInputRef}
                                                                type="date"
                                                                value={customToDate}
                                                                min={customFromDate || ALL_TIME_START_DATE}
                                                                max={new Date().toISOString().split('T')[0]}
                                                                onChange={(e) => setCustomToDate(e.target.value)}
                                                                style={{ fontSize: '14px' }}
                                                                className="w-full min-w-[200px] h-full min-h-[2.75rem] rounded-lg pl-3 pr-10 py-2.5 text-sm font-normal bg-[#F3F4F6] dark:bg-[#4B5563] border border-gray-200/60 dark:border-slate-600/50 text-flare-primary cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-6 [&::-webkit-calendar-picker-indicator]:h-full box-border"
                                                            />
                                                            <button type="button" tabIndex={-1} aria-label="Open calendar" onClick={() => customToInputRef.current?.showPicker?.() ?? customToInputRef.current?.click()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-flare-primary cursor-pointer pointer-events-auto flex items-center justify-center">
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    disabled={!customFromDate || !customToDate || customFromDate > customToDate || (!!customFromDate && !!customToDate && getDaysBetween(customFromDate, customToDate) > MAX_CUSTOM_RANGE_DAYS) || isLoading}
                                                    onClick={() => {
                                                        setAppliedCustomFromDate(customFromDate);
                                                        setAppliedCustomToDate(customToDate);
                                                        setIsApplyingCustom(true);
                                                    }}
                                                    className="w-full rounded-lg px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
                                                >
                                                    {isLoading ? t.loading : t.apply}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    </div>
                    {/* Chart Type Selector */}
                    <div className="relative z-20 shrink-0" ref={chartTypeDropdownRef}>
                        <div
                            onClick={() => setIsChartTypeOpen(!isChartTypeOpen)}
                            className="bg-[#F9FAFB] dark:bg-[#374151] text-flare-primary rounded-xl px-3 sm:px-4 py-2.5 text-sm font-medium outline-none cursor-pointer hover:bg-[#F3F4F6] dark:hover:bg-[#4B5563] transition-all duration-200 flex items-center justify-between min-w-[3.5rem] sm:min-w-[100px] gap-1.5 sm:gap-2 border border-gray-200/60 dark:border-slate-600/50 shrink-0"
                        >
                            <span>
                                {chartType === 'line' ? t.chartTypeLine : chartType === 'area' ? t.chartTypeArea : t.chartTypeBar}
                            </span>
                            <svg className={`w-4 h-4 text-flare-primary transition-transform duration-300 ease-in-out flex-shrink-0 ${isChartTypeOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                        {isChartTypeOpen && (
                            <div className="absolute top-full z-[9999] mt-2 bg-[#F9FAFB] dark:bg-[#374151] rounded-xl shadow-xl w-full left-0 right-0 min-w-[100px] overflow-hidden">
                                <div
                                    onClick={() => { setChartType('line'); setIsChartTypeOpen(false); }}
                                    className={`px-4 py-2.5 text-sm font-normal cursor-pointer hover:bg-[#F3F4F6] dark:hover:bg-[#4B5563] transition-colors ${chartType === 'line' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium' : 'text-flare-primary'}`}
                                >
                                    {t.chartTypeLine}
                                </div>
                                <div
                                    onClick={() => { setChartType('area'); setIsChartTypeOpen(false); }}
                                    className={`px-4 py-2.5 text-sm font-normal cursor-pointer hover:bg-[#F3F4F6] dark:hover:bg-[#4B5563] transition-colors ${chartType === 'area' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium' : 'text-flare-primary'}`}
                                >
                                    {t.chartTypeArea}
                                </div>
                                <div
                                    onClick={() => { setChartType('bar'); setIsChartTypeOpen(false); }}
                                    className={`px-4 py-2.5 text-sm font-normal cursor-pointer hover:bg-[#F3F4F6] dark:hover:bg-[#4B5563] transition-colors rounded-b-xl ${chartType === 'bar' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium' : 'text-flare-primary'}`}
                                >
                                    {t.chartTypeBar}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Percentage Change */}
                {percentageChange !== null && (
                    <div className={`flex items-center px-3 sm:px-4 py-2.5 rounded-xl border backdrop-blur-sm cursor-pointer shrink-0 ${percentageChange >= 0 ? "bg-green-100/60 dark:bg-green-900/25 border-green-300/50 dark:border-green-700/50" : "bg-red-100/60 dark:bg-red-900/25 border-red-300/50 dark:border-red-700/50"} shadow-sm hover:shadow-md transition-shadow duration-200`}>
                        <span className={`text-sm font-bold ${percentageChange >= 0 ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                            {percentageChange >= 0 ? "+ " : "- "}
                            {Math.abs(percentageChange).toFixed(2)}%
                        </span>
                    </div>
                )}
            </div>

            {/* Chart */}
            <div className="w-full relative z-0" style={{ height: '380px', minHeight: '380px', minWidth: '0' }}>
                <ResponsiveContainer width="100%" height={380}>
                    {chartType === 'line' && (
                        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" opacity={0.5} />
                            <XAxis dataKey="formattedDate" stroke="#475569" className="dark:stroke-slate-400" style={{ fontSize: "12px", fontWeight: 500 }} tick={tickProps} tickMargin={8} />
                            <YAxis stroke="#475569" className="dark:stroke-slate-400" style={{ fontSize: "12px", fontWeight: 500 }} domain={['auto', 'auto']} tick={tickPropsY} tickMargin={8} />
                            <Tooltip content={tooltipContent} />
                            <Line type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: "#6366f1", r: 3.5, strokeWidth: 2, stroke: "#ffffff" }} activeDot={{ r: 6, stroke: "#6366f1", strokeWidth: 2, fill: "#ffffff" }} />
                        </LineChart>
                    )}
                    {chartType === 'area' && (
                        <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" opacity={0.5} />
                            <XAxis dataKey="formattedDate" stroke="#475569" className="dark:stroke-slate-400" style={{ fontSize: "12px", fontWeight: 500 }} tick={tickProps} tickMargin={8} />
                            <YAxis stroke="#475569" className="dark:stroke-slate-400" style={{ fontSize: "12px", fontWeight: 500 }} domain={['auto', 'auto']} tick={tickPropsY} tickMargin={8} />
                            <Tooltip content={tooltipContent} />
                            <Area type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={2.5} fill="#6366f1" fillOpacity={0.25} dot={{ fill: "#6366f1", r: 3.5, strokeWidth: 2, stroke: "#ffffff" }} activeDot={{ r: 6, stroke: "#6366f1", strokeWidth: 2, fill: "#ffffff" }} />
                        </AreaChart>
                    )}
                    {chartType === 'bar' && (
                        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }} barCategoryGap="12%" barGap={8}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" opacity={0.5} />
                            <XAxis dataKey="formattedDate" stroke="#475569" className="dark:stroke-slate-400" style={{ fontSize: "12px", fontWeight: 500 }} tick={tickProps} tickMargin={8} />
                            <YAxis stroke="#475569" className="dark:stroke-slate-400" style={{ fontSize: "12px", fontWeight: 500 }} domain={['auto', 'auto']} tick={tickPropsY} tickMargin={8} />
                            <Tooltip content={tooltipContent} cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }} />
                            <Bar
                                dataKey="rate"
                                fill="#6366f1"
                                radius={[6, 6, 0, 0]}
                                maxBarSize={48}
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth={1}
                                activeBar={{ fill: "#818cf8", stroke: "#c7d2fe", strokeWidth: 1.5 }}
                            />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
}

