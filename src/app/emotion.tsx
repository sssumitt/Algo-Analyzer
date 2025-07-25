'use client';

import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { useServerInsertedHTML } from 'next/navigation';
import React from 'react';

export function EmotionRegistry({ children }: { children: React.ReactNode }) {
  const [cache] = React.useState(() => {
    const c = createCache({ key: 'css', prepend: true });
    c.compat = true;
    return c;
  });

  useServerInsertedHTML(() => {
    const keys = Object.keys(cache.inserted);
    if (keys.length === 0) return null;
    return (
      <style
        data-emotion={`${cache.key} ${keys.join(' ')}`}
        dangerouslySetInnerHTML={{
          __html: keys.map(k => cache.inserted[k]).join(' ')
        }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
