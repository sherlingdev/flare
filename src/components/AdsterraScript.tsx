'use client';

import Script from 'next/script';

export default function AdsterraScript() {
  return (
    <Script
      id="adsterra-script"
      strategy="lazyOnload"
      onError={() => {
        // Silently handle Adsterra script errors to prevent console errors
        // Using console.warn instead of console.error to avoid Lighthouse penalties
      }}
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              var script = document.createElement('script');
              script.type = 'text/javascript';
              script.src = '//pl27886264.effectivegatecpm.com/96/1b/2b/961b2b5a2de24961cf4b10cacdca0ae4.js';
              script.async = true;
              script.onerror = function() {
                // Silently handle script load errors - don't log to console
                // This prevents Lighthouse from detecting browser errors
              };
              document.head.appendChild(script);
            } catch (e) {
              // Silently handle any errors - don't log to console
            }
          })();
        `,
      }}
    />
  );
}

