import { Field, FieldError, FieldLabel } from '@/components/ui/field';

export function Fields({ items = [], className = '' }) {
  return (
    <div className={`grid grid-cols-1 gap-6 md:grid-cols-2 ${className}`}>
      {items.map((item, index) => (
        <Field
          key={item.key ?? index}
          className={`w-full ${item.className ?? ''}`}
          data-invalid={!!item.error}
        >
          {item.label && <FieldLabel>{item.label}</FieldLabel>}
          {item.child}
          {item.error && <FieldError>{item.error}</FieldError>}
        </Field>
      ))}
    </div>
  );
}
