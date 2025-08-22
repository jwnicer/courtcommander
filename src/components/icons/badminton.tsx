import * as React from 'react';

export const ShuttlecockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15.18 2 8.93 8.25" />
    <path d="M12.53 3.47 5.28 10.72" />
    <path d="M10.72 5.28 3.47 12.53" />
    <path d="M9.75 6.25 2 14" />
    <path d="M14 22 8.5 16.5" />
    <path d="m20.5 17.5-5-5" />
    <path d="m17.5 20.5-5-5" />
    <path d="M21.5 14.5 9 2" />
  </svg>
);

export const RacketIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <ellipse cx="9" cy="9" rx="5" ry="7" />
    <line x1="14" y1="14" x2="21" y2="21" />
    <line x1="11" y1="12" x2="14" y2="15" />
  </svg>
);

export const CourtIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="3" width="20" height="18" rx="2" />
    <line x1="12" y1="3" x2="12" y2="21" />
    <line x1="2" y1="9" x2="22" y2="9" />
    <line x1="2" y1="15" x2="22" y2="15" />
  </svg>
);

export const ScoreboardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="3" width="20" height="18" rx="2" />
    <line x1="12" y1="8" x2="12" y2="21" />
    <rect x="6.5" y="12" width="3" height="4" fill="currentColor" stroke="none" />
    <rect x="14.5" y="12" width="3" height="4" fill="currentColor" stroke="none" />
  </svg>
);
