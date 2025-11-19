"use client";

import Script from 'next/script';
import { GA_MEASUREMENT_ID } from '@/lib/google-analytics';
import { useEffect, useState } from 'react';

export default function GoogleAnalytics() {
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    // Only load Google Analytics on production domain
    const hostname = window.location.hostname;
    setIsProduction(
      hostname === 'usesubspace.live' || 
      hostname === 'www.usesubspace.live'
    );
  }, []);

  // Don't load GA scripts on localhost
  if (!isProduction) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}

