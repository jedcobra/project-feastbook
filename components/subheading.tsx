// A section's heading within a page — Ingredients, Method, Trending
// recipes, a settings group. Sits between the page title and the body
// text; the small caps <Label> is for form fields.
export function Subheading({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <h2 className={`font-display text-[20px] font-bold leading-tight text-ink ${className}`}>{children}</h2>;
}
