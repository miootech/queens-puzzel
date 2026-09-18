'use client';

import { cn } from '@/lib/utils';

export function BottleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className={cn(className)}
    >
      <path d="M9 2h6v4l1.5 2.5A8 8 0 0 1 18 13v7a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-7a8 8 0 0 1 1.5-4.5L9 6V2z" fill="#22c55e" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="8" y="1" width="8" height="3" rx="1" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1"/>
      <rect x="7" y="13" width="10" height="5" rx="1" fill="#ffffff" opacity="0.9"/>
      <text x="12" y="17" textAnchor="middle" fontSize="4" fill="#16a34a" fontWeight="bold">♻</text>
    </svg>
  );
}
