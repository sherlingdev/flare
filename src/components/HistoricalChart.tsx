"use client";

import { useState, useEffect } from "react";
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

    useEffect(() => {
        const fetchHistoricalData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Get historical data for both currencies
                const [fromResponse, toResponse] = await Promise.all([
                    fetch(`/api/historical/${fromCurrency}?days=15`),
                    fetch(`/api/historical/${toCurrency}?days=15`)
                ]);

                const fromData = await fromResponse.json();
                const toData = await toResponse.json();

                if (!fromData.success || !toData.success) {
                    throw new Error("Failed to fetch historical data");
                }

                const fromRates = fromData.data.rates as HistoricalRate[];
                const toRates = toData.data.rates as HistoricalRate[];

                // Create a map of dates to rates for easier lookup
                const fromRateMap = new Map<string, number>();
                fromRates.forEach((rate: HistoricalRate) => {
                    fromRateMap.set(rate.date, rate.rate);
                });

                const toRateMap = new Map<string, number>();
                toRates.forEach((rate: HistoricalRate) => {
                    toRateMap.set(rate.date, rate.rate);
                });

                // Get all unique dates, sorted
                const allDates = Array.from(
                    new Set([...fromRates.map((r: HistoricalRate) => r.date), ...toRates.map((r: HistoricalRate) => r.date)])
                ).sort();

                // Calculate exchange rate for each date: toRate / fromRate
                // Both rates are against USD, so to convert from A to B: (B_rate / USD) / (A_rate / USD) = B_rate / A_rate
                const calculatedData: ChartData[] = allDates
                    .map((date) => {
                        const fromRate = fromRateMap.get(date);
                        const toRate = toRateMap.get(date);

                        if (fromRate && toRate && fromRate > 0) {
                            // Calculate exchange rate: toRate / fromRate
                            // This gives us how many units of 'to' currency we get for 1 unit of 'from' currency
                            const exchangeRate = toRate / fromRate;
                            const dateObj = new Date(date);
                            const formattedDate = dateObj.toLocaleDateString(mounted ? language : 'en', {
                                month: 'short',
                                day: 'numeric'
                            });

                            return {
                                date,
                                rate: exchangeRate,
                                formattedDate
                            };
                        }
                        return null;
                    })
                    .filter((item): item is ChartData => item !== null)
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                setChartData(calculatedData);

                // Calculate percentage change (first vs last)
                if (calculatedData.length >= 2) {
                    const firstRate = calculatedData[0].rate;
                    const lastRate = calculatedData[calculatedData.length - 1].rate;
                    const change = ((lastRate - firstRate) / firstRate) * 100;
                    setPercentageChange(change);
                }
            } catch (err) {
                console.error("Error fetching historical data:", err);
                setError(err instanceof Error ? err.message : "Failed to load chart data");
            } finally {
                setIsLoading(false);
            }
        };

        if (fromCurrency && toCurrency) {
            fetchHistoricalData();
        }
    }, [fromCurrency, toCurrency, language, mounted]);

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
            {/* Chart Header with Percentage */}
            <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-flare-primary">
                    {t.performance}
                </h2>
                {percentageChange !== null && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-flare-primary font-semibold">
                            15 {t.days}
                        </span>
                        <span className="text-flare-primary font-semibold">•</span>
                        <span className={`text-base font-semibold ${percentageChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {percentageChange >= 0 ? "+" : ""}
                            {percentageChange.toFixed(2)}%
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

