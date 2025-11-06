import { IndianRupee } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <IndianRupee className="size-5" />
      </div>
      <span className="font-headline text-lg font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
        BharatVest
      </span>
    </div>
  );
}
