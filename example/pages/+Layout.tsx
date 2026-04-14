import { QueryClientProvider } from '@tanstack/react-query';
import Link from '$src/components/Link';
import { queryClient } from '$src/trpc/client';
import '$src/shared/app-styles.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <nav className="app-nav">
        <div className="app-nav__brand">
          <Link href="/">Enterprise Starter</Link>
          <span>Internal tools starter</span>
        </div>
        <div className="app-nav__links">
          <Link href="/users">Users</Link>
        </div>
      </nav>
      <main>{children}</main>
    </QueryClientProvider>
  );
}
