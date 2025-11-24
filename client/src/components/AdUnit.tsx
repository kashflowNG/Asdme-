import { useEffect } from 'react';
import { Helmet } from 'react-helmet';

interface AdUnitProps {
  type: 'banner' | 'social-bar';
}

export function AdUnit({ type }: AdUnitProps) {
  if (type === 'banner') {
    return (
      <>
        <Helmet>
          <script 
            type="text/javascript" 
            src="//www.highperformanceformat.com/9effa3562d5aac5edcf587ad7df01754/invoke.js"
          />
        </Helmet>
        <div className="flex justify-center py-4">
          <div className="w-full max-w-sm mx-auto">
            <ins className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-format="fluid"
              data-ad-layout-key="-6t+ed+2i-1n-4w"
            />
          </div>
        </div>
      </>
    );
  }

  if (type === 'social-bar') {
    return (
      <Helmet>
        <script 
          type="text/javascript" 
          src="//pl28091887.effectivegatecpm.com/cf/47/df/cf47df159320ecb4f3636e497a6d0d1f.js"
        />
      </Helmet>
    );
  }

  return null;
}
