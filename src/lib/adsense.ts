// Google AdSense Configuration
export const adSenseConfig = {
    // Replace with your actual AdSense Publisher ID
    publisherId: 'ca-pub-7906398366781972',

    // Ad Slots (Replace with your actual ad slot IDs)
    adSlots: {
        topBanner: '6460980142',      // Top banner ad slot
        bottomBanner: '0987654321',   // Bottom banner ad slot
        leftSidebar: '1122334455',   // Left sidebar ad slot
        rightSidebar: '5544332211',  // Right sidebar ad slot
    },

    // Ad Formats
    adFormats: {
        banner: 'horizontal',
        sidebar: 'vertical',
        responsive: 'auto'
    },

    // Ad Styles
    adStyles: {
        banner: {
            display: 'block',
            width: '100%',
            height: '100%'
        },
        sidebar: {
            display: 'block',
            width: '100%',
            height: '100%'
        }
    }
};

// AdSense initialization script
export const initAdSense = () => {
    if (typeof window !== 'undefined') {
        try {
            // Load AdSense script
            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
            script.setAttribute('data-ad-client', adSenseConfig.publisherId);
            document.head.appendChild(script);

            console.log('AdSense script loaded successfully');
        } catch (error) {
            console.error('Error loading AdSense script:', error);
        }
    }
};
