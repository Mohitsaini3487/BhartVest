import type { ReactNode } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface PageHeaderProps {
  title: string;
  children?: ReactNode;
}

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-4 border-b bg-card/50 px-4 py-2 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="flex md:hidden" />
        <h1 className="font-headline text-lg font-semibold sm:text-xl">{title}</h1>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
