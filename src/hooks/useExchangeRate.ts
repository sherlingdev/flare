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
  const [rate, setRate] = useState<number>(62.00); // Fallback rate
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [source, setSource] = useState<string>('fallback');

  // Load cached rate immediately
  useEffect(() => {
    const cachedRate = exchangeRateService.getCachedRate();
    if (cachedRate) {
      setRate(cachedRate.rate);
      setLastUpdated(cachedRate.timestamp);
      setSource(cachedRate.source);
    }
  }, []);

  // Fetch fresh rate
  const refreshRate = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response: ExchangeRateResponse = await exchangeRateService.getUSDtoDOPRate();
      
      if (response.success && response.data) {
        setRate(response.data.rate);
        setLastUpdated(response.data.timestamp);
        setSource(response.data.source);
      } else {
        setError(response.error || 'Failed to fetch exchange rate');
      }
    } catch (err) {
      setError('Network error while fetching exchange rate');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(refreshRate, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshRate]);

  // Initial fetch
  useEffect(() => {
    refreshRate();
  }, [refreshRate]);

  return {
    rate,
    loading,
    error,
    lastUpdated,
    source,
    refreshRate
  };
}
