import { ReactNode } from 'react';

interface ComingSoonProps {
  title: string;
  description?: string | null;
  children?: ReactNode;
}

export function MicrositeComingSoon({ title, description, children }: ComingSoonProps) {
  return (
    <div className="rounded-xl border border-dashed border-muted-foreground/40 bg-muted/20 p-8">
      <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
      {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
      {children && <div className="mt-4 text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}
