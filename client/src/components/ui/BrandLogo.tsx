import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  className?: string;
  variant?: 'full' | 'mark' | 'wordmark';
  size?: 'sm' | 'md' | 'lg';
  asLink?: boolean;
  to?: string;
}

export const PhantomMark: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 28
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {/* Luxury Dark Shield/Squircle */}
      <rect width="64" height="64" rx="15" fill="#141311" />
      <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="14.25" stroke="#2E2C28" strokeWidth="1.5" />

      {/* Architectural P Monogram */}
      <path d="M18 15H25.5V49H18V15Z" fill="currentColor" />
      <path
        d="M25.5 15H36.8C43.2 15 47.8 19.45 47.8 25.5C47.8 31.55 43.2 36 36.8 36H25.5V15ZM25.5 21.6V29.4H36.2C38.9 29.4 40.8 27.7 40.8 25.5C40.8 23.3 38.9 21.6 36.2 21.6H25.5Z"
        fill="currentColor"
      />
      {/* Terracotta Accent */}
      <rect x="18" y="44" width="7.5" height="5" fill="#CF5230" />
    </svg>
  );
};

export default function BrandLogo({
  className = '',
  variant = 'full',
  size = 'md',
  asLink = true,
  to = '/'
}: BrandLogoProps) {
  const sizeMap = {
    sm: { icon: 22, text: 'text-sm tracking-[0.3em]' },
    md: { icon: 28, text: 'text-base sm:text-lg tracking-[0.34em]' },
    lg: { icon: 36, text: 'text-xl sm:text-2xl tracking-[0.38em]' }
  };

  const currentSize = sizeMap[size];

  const content = (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {variant !== 'wordmark' && (
        <PhantomMark size={currentSize.icon} className="text-white" />
      )}
      {variant !== 'mark' && (
        <span
          className={`font-black uppercase text-white transition-opacity ${currentSize.text} whitespace-nowrap`}
        >
          PHANTOM
        </span>
      )}
    </span>
  );

  if (asLink) {
    return (
      <Link
        to={to}
        aria-label="Phantom Home"
        className="inline-flex items-center hover:opacity-90 transition-opacity focus:outline-none"
      >
        {content}
      </Link>
    );
  }

  return content;
}
