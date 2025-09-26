"use client";

import { useState, useEffect, useCallback } from 'react';
import { exchangeRateService, ExchangeRate, ExchangeRateResponse } from '../lib/exchangeRates';

interface UseExchangeRateReturn {
  rate: number;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  source: string;
  refreshRate: () => Promise<void>;
}

export function useExchangeRate(): UseExchangeRateReturn {
  // Use a fixed, stable rate to prevent fluctuations
  const [rate, setRate] = useState<number>(62.00); // Fixed rate
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());
  const [source, setSource] = useState<string>('fixed');

  // Set initial values immediately
  useEffect(() => {
    setRate(62.00);
    setLastUpdated(new Date());
    setSource('fixed');
  }, []);

  // No auto-refresh to prevent rate fluctuations
  const refreshRate = useCallback(async () => {
    // Keep the same fixed rate
    setRate(62.00);
    setLastUpdated(new Date());
    setSource('fixed');
  }, []);

  return {
    rate,
    loading,
    error,
    lastUpdated,
    source,
    refreshRate
  };
}
