import { Link } from 'react-router-dom';

export interface CollectionCardProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  href?: string;
  className?: string;
}

export default function CollectionCard({
  title,
  subtitle,
  imageUrl,
  href = '#',
  className = ''
}: CollectionCardProps) {
  return (
    <Link
      to={href}
      className={`group relative block overflow-hidden h-[433px] bg-neutral-900 select-none ${className}`}
    >
      {/* 1. Background Image with fast, smooth scale transition */}
      <img
        src={imageUrl}
        alt={title}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-300 ease-out will-change-transform group-hover:scale-105"
      />

      {/* 2. Soft bottom gradient overlay for legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

      {/* 3. Text container that smoothly shifts upward on hover */}
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 flex flex-col justify-end transition-transform duration-300 ease-out group-hover:-translate-y-2.5">
        <h3 className="text-xl sm:text-2xl font-medium tracking-tight text-white leading-tight">
          {title}
        </h3>
        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-neutral-300 mt-1">
          {subtitle}
        </p>
 
        {/* 4. Short black line: hidden by default, emerges and expands on hover */}
        <div
          aria-hidden="true"
          className="mt-2 w-0 border-t-1 border-black opacity-0 group-hover:w-11 group-hover:opacity-100 transition-all duration-300 ease-out origin-left"
        />
      </div>
    </Link>
  );
}
