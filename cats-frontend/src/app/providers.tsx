'use client';

import React from 'react';
import { LanguageProvider } from '../contexts/LanguageContext';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50">{children}</div>
    </LanguageProvider>
  );
}
