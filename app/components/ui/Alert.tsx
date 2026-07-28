type Kind = 'error' | 'success' | 'info';

const kindClasses: Record<Kind, string> = {
  error: 'bg-red-50 border-red-100 text-red-700',
  success: 'bg-emerald-50 border-emerald-100 text-emerald-700',
  info: 'bg-blue-50 border-blue-100 text-blue-700',
};

export function Alert({ kind = 'info', children }: { kind?: Kind; children: React.ReactNode }) {
  return (
    <div className={`flex items-start gap-3 border rounded-xl px-4 py-3 text-sm ${kindClasses[kind]}`}>
      <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9v4a1 1 0 102 0V9a1 1 0 10-2 0zm0-4a1 1 0 112 0 1 1 0 01-2 0z"
          clipRule="evenodd"
        />
      </svg>
      <span>{children}</span>
    </div>
  );
}
