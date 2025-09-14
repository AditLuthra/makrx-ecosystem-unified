'use client';

interface CustomMDXContent {
  title?: string;
  content: string;
  background?: 'default' | 'muted' | 'primary';
  textAlign?: 'left' | 'center' | 'right';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

interface CustomMDXProps {
  id: string;
  content: CustomMDXContent;
  variant?: string;
  micrositeSlug: string;
  theme?: {
    tokens: Record<string, string>;
    assets: Record<string, string>;
  };
}

export default function CustomMDX({ content, variant = 'default', theme }: CustomMDXProps) {
  const getBackgroundClass = () => {
    switch (content.background) {
      case 'muted':
        return 'bg-muted/30';
      case 'primary':
        return 'bg-primary/5';
      default:
        return 'bg-background';
    }
  };

  const getTextAlignClass = () => {
    switch (content.textAlign) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  const getMaxWidthClass = () => {
    switch (content.maxWidth) {
      case 'sm':
        return 'max-w-2xl';
      case 'md':
        return 'max-w-4xl';
      case 'lg':
        return 'max-w-6xl';
      case 'xl':
        return 'max-w-7xl';
      case 'full':
        return 'max-w-none';
      default:
        return 'max-w-4xl';
    }
  };

  return (
    <section className={`py-16 ${getBackgroundClass()}`}>
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${getMaxWidthClass()}`}>
        <div className={getTextAlignClass()}>
          {content.title && (
            <h2 className="text-4xl font-bold text-foreground mb-8">{content.title}</h2>
          )}

          <div
            className={`prose prose-lg max-w-none ${getTextAlignClass()}`}
            style={
              {
                '--tw-prose-body': 'var(--foreground)',
                '--tw-prose-headings': 'var(--foreground)',
                '--tw-prose-links': theme?.tokens?.primary || '#3B82F6',
                '--tw-prose-bold': 'var(--foreground)',
                '--tw-prose-counters': 'var(--muted-foreground)',
                '--tw-prose-bullets': 'var(--muted-foreground)',
                '--tw-prose-hr': 'var(--border)',
                '--tw-prose-quotes': 'var(--muted-foreground)',
                '--tw-prose-quote-borders': 'var(--border)',
                '--tw-prose-captions': 'var(--muted-foreground)',
                '--tw-prose-code': 'var(--foreground)',
                '--tw-prose-pre-code': 'var(--muted-foreground)',
                '--tw-prose-pre-bg': 'var(--muted)',
                '--tw-prose-th-borders': 'var(--border)',
                '--tw-prose-td-borders': 'var(--border)',
              } as React.CSSProperties
            }
            dangerouslySetInnerHTML={{ __html: content.content }}
          />
        </div>
      </div>
    </section>
  );
}
