import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef } from 'react';

interface FieldWrapperProps {
  label?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

function FieldWrapper({ label, hint, error, children }: FieldWrapperProps) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      {children}
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

const fieldClasses =
  'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white ' +
  'focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ' +
  'placeholder-gray-400 transition disabled:opacity-50 disabled:bg-gray-50';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, className = '', ...rest },
  ref,
) {
  return (
    <FieldWrapper label={label} hint={hint} error={error}>
      <input ref={ref} className={`${fieldClasses} ${className}`} {...rest} />
    </FieldWrapper>
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, className = '', rows = 3, ...rest },
  ref,
) {
  return (
    <FieldWrapper label={label} hint={hint} error={error}>
      <textarea ref={ref} rows={rows} className={`${fieldClasses} resize-none ${className}`} {...rest} />
    </FieldWrapper>
  );
});

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, className = '', children, ...rest },
  ref,
) {
  return (
    <FieldWrapper label={label} hint={hint} error={error}>
      <select ref={ref} className={`${fieldClasses} cursor-pointer ${className}`} {...rest}>
        {children}
      </select>
    </FieldWrapper>
  );
});
