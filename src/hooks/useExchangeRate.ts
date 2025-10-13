"use client";

import { useState, useEffect, useCallback } from 'react';

// Supported currencies with their rates (high precision)
const CURRENCY_RATES = {
  'USD-DOP': 62.24,
  'EUR-DOP': 71.65,
  'USD-EUR': 0.868,
  'EUR-USD': 1.152,
  'DOP-USD': 0.016067, // High precision: 1/62.24
  'DOP-EUR': 0.013954  // High precision: 1/71.65
};

interface UseExchangeRateReturn {
  rate: number;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  source: string;
  refreshRate: () => Promise<void>;
  getRate: (from: string, to: string) => number;
}

export function useExchangeRate(fromCurrency: string = 'USD', toCurrency: string = 'DOP'): UseExchangeRateReturn {
  const [rate, setRate] = useState<number>(CURRENCY_RATES[`${fromCurrency}-${toCurrency}` as keyof typeof CURRENCY_RATES] || 1);
  const [loading] = useState<boolean>(false);
  const [error] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());
  const [source, setSource] = useState<string>('fixed');

  // Set initial values immediately
  useEffect(() => {
    const newRate = CURRENCY_RATES[`${fromCurrency}-${toCurrency}` as keyof typeof CURRENCY_RATES] || 1;
    setRate(newRate);
    setLastUpdated(new Date());
    setSource('fixed');
  }, [fromCurrency, toCurrency]);

  // Get rate for any currency pair with high precision
  const getRate = useCallback((from: string, to: string): number => {
    const directRate = CURRENCY_RATES[`${from}-${to}` as keyof typeof CURRENCY_RATES];
    if (directRate) return directRate;

    // If no direct rate, try reverse with high precision
    const reverseRate = CURRENCY_RATES[`${to}-${from}` as keyof typeof CURRENCY_RATES];
    if (reverseRate) {
      // Use high precision calculation to avoid floating point errors
      const precision = 1000000; // 6 decimal places
      return Math.round((1 / reverseRate) * precision) / precision;
    }

    // If neither exists, return 1 (same currency)
    return 1;
  }, []);

  // No auto-refresh to prevent rate fluctuations
  const refreshRate = useCallback(async () => {
    const newRate = CURRENCY_RATES[`${fromCurrency}-${toCurrency}` as keyof typeof CURRENCY_RATES] || 1;
    setRate(newRate);
    setLastUpdated(new Date());
    setSource('fixed');
  }, [fromCurrency, toCurrency]);

  return {
    rate,
    loading,
    error,
    lastUpdated,
    source,
    refreshRate,
    getRate
  };
}
