import { Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export default function Loading({
  message = 'Loading collection...',
  fullScreen = true
}: LoadingProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center bg-[#121110] text-white p-6 select-none ${
        fullScreen ? 'fixed inset-0 z-50 min-h-screen w-screen' : 'min-h-[50vh] w-full'
      }`}
    >
      {/* Brand Monogram */}
      <div className="flex flex-col items-center space-y-5 max-w-sm text-center">
        <div className="relative flex items-center justify-center">
          {/* Subtle pulse ring */}
          <div className="absolute w-12 h-12 rounded-full border border-orange-500/20 animate-ping opacity-60" />
          <div className="w-10 h-10 rounded-full border border-neutral-800 bg-neutral-950 flex items-center justify-center shadow-lg">
            <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] tracking-[0.35em] text-neutral-400 font-semibold uppercase block">
            PHANTOM
          </span>
          <p className="text-xs tracking-wider text-neutral-300 font-normal">
            {message}
          </p>
        </div>

        {/* Minimalist progress line */}
        <div className="w-36 h-[1px] bg-neutral-800 overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 bg-orange-500/80 w-1/3 animate-[pulse_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}
