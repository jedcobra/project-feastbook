import Link from 'next/link';
import { GearIcon } from '@/components/icons';
import { outlineBoxClasses } from '@/components/outline-box';
import { OwnCookbook } from '@/components/profile/own-cookbook';
import { TopBar } from '@/components/top-bar';

export default function CookbookPage() {
  return (
    <>
      <TopBar
        variant="brand"
        trailing={
          <Link href="/settings" aria-label="Settings" className={outlineBoxClasses(true)}>
            <GearIcon size={14} />
          </Link>
        }
      />
      <OwnCookbook />
    </>
  );
}
