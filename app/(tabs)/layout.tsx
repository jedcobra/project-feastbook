import { TabBar } from '@/components/tab-bar';

// Shared shell for every tab-root screen (Feed, Cookbook, Discover, Add) and
// anything pushed on top of them (Recipe Detail). Cooking Mode lives outside
// this group so it can go full-screen without the tab bar.
export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <TabBar />
    </>
  );
}
