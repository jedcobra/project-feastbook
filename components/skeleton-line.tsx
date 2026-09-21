// One greyed placeholder bar — the building block for a loading state that
// wears the real screen's own shape instead of a spinner.
export function SkeletonLine({
  width = '100%',
  height = 11,
  className = '',
}: {
  width?: string;
  height?: number;
  className?: string;
}) {
  return <div className={`animate-pulse rounded-sm bg-rule-soft ${className}`} style={{ width, height }} />;
}
