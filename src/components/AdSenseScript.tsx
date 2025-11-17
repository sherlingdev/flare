"use client";

import Script from 'next/script';
import { adSenseConfig } from '../lib/adsense';

export default function AdSenseScript() {
    return (
        <Script
            id="adsbygoogle-script"
            strategy="lazyOnload"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSenseConfig.publisherId}`}
            crossOrigin="anonymous"
        />
    );
}
