import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '$src/trpc/client';
import '$src/shared/app-styles.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <nav>
        <a href="/">Enterprise Starter</a>
        <a href="/users">Users</a>
      </nav>
      <main>{children}</main>
    </QueryClientProvider>
  );
}
