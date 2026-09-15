export function Label({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`font-display text-caps font-bold uppercase text-ink ${className}`}>
      {children}
    </div>
  );
}
