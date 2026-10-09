import { OnboardingGate } from '@/components/auth/onboarding-gate';
import { TabBar } from '@/components/tab-bar';

// Shared shell for every tab-root screen (Feed, Cookbook, Discover, Add) and
// anything pushed on top of them (Recipe Detail). Cooking Mode lives outside
// this group so it can go full-screen without the tab bar, and so does
// Onboarding, which the gate below redirects into when needed.
export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OnboardingGate />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <TabBar />
    </>
  );
}
