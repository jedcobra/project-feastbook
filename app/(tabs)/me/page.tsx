import Link from 'next/link';
import { MenuIcon } from '@/components/icons';
import { outlineBoxClasses } from '@/components/outline-box';
import { OwnCookbook } from '@/components/profile/own-cookbook';
import { TopBar } from '@/components/top-bar';

export default function CookbookPage() {
  return (
    <>
      <TopBar
        trailing={
          <Link href="/settings" aria-label="Settings" className={outlineBoxClasses(true)}>
            <MenuIcon size={14} />
          </Link>
        }
      />
      <OwnCookbook />
    </>
  );
}
