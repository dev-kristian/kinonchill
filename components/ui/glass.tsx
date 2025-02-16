// components/ui/glass.tsx
import { cn } from '@/lib/utils';

interface GlassProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Glass = ({ className, ...props }: GlassProps) => {
  return (
    <div
      className={cn(
        "rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10",
        className
      )}
      {...props}
    />
  );
};
