"use client";

import { useState, useEffect, useCallback } from 'react';
import { getCurrentLocalRates, getLastUpdated } from '../lib/scraper';

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
  const [rate, setRate] = useState<number>(1);
  const [loading] = useState<boolean>(false);
  const [error] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());
  const [source, setSource] = useState<string>('InfoDolar.com.do');

  // Update rates when scraper runs or currencies change
  useEffect(() => {
    const updateRates = () => {
      const currentRates = getCurrentLocalRates();
      const newRate = currentRates[`${fromCurrency}-${toCurrency}`] || 1;
      setRate(newRate);

      const lastUpdatedTime = getLastUpdated();
      setLastUpdated(new Date(lastUpdatedTime));
      setSource('InfoDolar.com.do');
    };

    // Update immediately
    updateRates();

    // Set up interval to check for updates every 30 seconds
    const interval = setInterval(updateRates, 30000);

    return () => clearInterval(interval);
  }, [fromCurrency, toCurrency]);

  // Get rate for any currency pair with high precision
  const getRate = useCallback((from: string, to: string): number => {
    const currentRates = getCurrentLocalRates();
    const directRate = currentRates[`${from}-${to}`];
    if (directRate) return directRate;

    // If no direct rate, try reverse with high precision
    const reverseRate = currentRates[`${to}-${from}`];
    if (reverseRate) {
      // Use high precision calculation to avoid floating point errors
      const precision = 1000000; // 6 decimal places
      return Math.round((1 / reverseRate) * precision) / precision;
    }

    // If neither exists, return 1 (same currency)
    return 1;
  }, []);

  // Manual refresh
  const refreshRate = useCallback(async () => {
    const currentRates = getCurrentLocalRates();
    const newRate = currentRates[`${fromCurrency}-${toCurrency}`] || 1;
    setRate(newRate);

    const lastUpdatedTime = getLastUpdated();
    setLastUpdated(new Date(lastUpdatedTime));
    setSource('InfoDolar.com.do');
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
