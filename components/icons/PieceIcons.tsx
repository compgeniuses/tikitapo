import React from 'react';

export const IconX: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`w-full h-full ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export const IconO: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`w-full h-full ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"></circle>
  </svg>
);

export const IconObstacle: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`w-full h-full ${className}`} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
  </svg>
);

export const IconPause: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`w-full h-full ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16"></rect>
    <rect x="14" y="4" width="4" height="16"></rect>
  </svg>
);

export const IconSuggest: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`w-full h-full ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1H9z" />
    <path d="M12 15a4 4 0 0 0 4-4V6a4 4 0 0 0-8 0v5a4 4 0 0 0 4 4z" />
  </svg>
);

export const IconStop: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`w-full h-full ${className}`} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0">
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);