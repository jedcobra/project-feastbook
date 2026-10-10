'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

// An @handle that opens that person's profile. Inside something that's
// already a link or a tappable row, pass `nested`: it renders a span that
// navigates on its own (an <a> inside an <a> is invalid HTML) and stops the
// tap from also triggering the row around it. Pass `bare` where the handle
// sits inside a sentence ("sam cooked …") — the "@" is only for handles
// standing on their own as a label.
export function HandleLink({
  handle,
  className,
  nested = false,
  bare = false,
  onNavigate,
}: {
  handle: string;
  className?: string;
  nested?: boolean;
  bare?: boolean;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const href = `/${handle}`;
  const label = bare ? handle : `@${handle}`;

  if (!nested) {
    return (
      <Link
        href={href}
        className={className}
        onClick={(e) => {
          e.stopPropagation();
          onNavigate?.();
        }}
      >
        {label}
      </Link>
    );
  }

  const go = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onNavigate?.();
    router.push(href);
  };
  return (
    <span
      role="link"
      tabIndex={0}
      className={`cursor-pointer ${className ?? ''}`}
      onClick={go}
      onKeyDown={(e) => {
        if (e.key === 'Enter') go(e);
      }}
    >
      {label}
    </span>
  );
}
