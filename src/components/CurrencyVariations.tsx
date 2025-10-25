"use client";

import { useState } from 'react';
import { rateConfig } from '../lib/scraper';
import SwapButton from './SwapButton';
import CurrencyCard from './CurrencyCard';

export default function CurrencyVariations() {

    const [isSwapped, setIsSwapped] = useState(false);

    // Calculate variations from base rates
    const usdRate = rateConfig.localRates['USD-DOP'];
    const eurRate = rateConfig.localRates['EUR-DOP'];

    const usdToDop = usdRate.toFixed(2);
    const eurToDop = eurRate.toFixed(2);
    const dopToUsd = (1 / usdRate).toFixed(4);
    const dopToEur = (1 / eurRate).toFixed(4);

    const handleSwap = () => {
        setIsSwapped(!isSwapped);
    };

    return (
        <CurrencyCard className="mb-6">
            {/* Exchange Form - Mobile Vertical Stack, Desktop Horizontal */}
            <div className="currency-input-group flex flex-col lg:flex-row items-center justify-center space-y-4 lg:space-y-0 lg:space-x-8 relative">
                {/* From Currency Section */}
                <div className="w-full lg:flex-1 lg:max-w-xs order-1 lg:order-1">
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-xl px-6 sm:px-8 py-4 sm:py-5">
                        <div className="text-sm font-medium text-flare-primary">
                            {isSwapped ? 'DOP → USD' : 'USD → DOP'}
                        </div>
                        <div className="text-sm font-medium text-flare-primary">
                            {isSwapped ? `$${dopToUsd}` : `RD$${usdToDop}`}
                        </div>
                    </div>
                </div>

                {/* Swap Button - Centered on Mobile, Between inputs on Desktop */}
                <div className="flex-shrink-0 order-2 lg:order-2 flex justify-center lg:justify-center">
                    <SwapButton
                        onClick={handleSwap}
                        size="md"
                        variant="default"
                    />
                </div>

                {/* To Currency Section */}
                <div className="w-full lg:flex-1 lg:max-w-xs order-3 lg:order-3">
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-xl px-6 sm:px-8 py-4 sm:py-5">
                        <div className="text-sm font-medium text-flare-primary">
                            {isSwapped ? 'DOP → EUR' : 'EUR → DOP'}
                        </div>
                        <div className="text-sm font-medium text-flare-primary">
                            {isSwapped ? `€${dopToEur}` : `RD$${eurToDop}`}
                        </div>
                    </div>
                </div>
            </div>
        </CurrencyCard>
    );
}
