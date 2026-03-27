import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const headerVariants = {
  page: {
    wrapper:
      'flex flex-col gap-4 border-b pb-6 md:flex-row md:items-center md:justify-between',
    title: 'text-2xl font-semibold',
    description: 'text-sm text-muted-foreground',
  },
  section: {
    wrapper:
      'flex flex-col gap-3 md:flex-row md:items-start md:justify-between',
    title: 'text-lg font-semibold',
    description: 'text-sm text-muted-foreground',
  },
};

export function Header({
  title,
  description,
  actions,
  variant = 'page',
  className = '',
}) {
  const styles = headerVariants[variant];

  return (
    <header className={cn(styles.wrapper, className)}>
      <div className='space-y-1'>
        <h2 className={styles.title}>{title}</h2>
        {description ? (
          <p className={styles.description}>{description}</p>
        ) : null}
      </div>

      {actions ? <div className='flex flex-wrap gap-2'>{actions}</div> : null}
    </header>
  );
}

export function HeaderAction({ size = 'sm', children, ...props }) {
  return (
    <Button size={size} {...props}>
      {children}
    </Button>
  );
}
