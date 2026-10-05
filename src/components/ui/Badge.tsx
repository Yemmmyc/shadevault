import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'gold' | 'zinc' | 'emerald';
  className?: string;
}

export default function Badge({ children, variant = 'gold', className = '' }: BadgeProps) {
  const variantStyles = {
    gold: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    zinc: 'bg-zinc-800/60 text-zinc-300 border-zinc-700/50',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded-md border tracking-wider uppercase ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
