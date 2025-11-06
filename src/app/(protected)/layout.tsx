'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  CandlestickChart,
  Wallet,
  Bot,
  UserCircle,
  PiggyBank,
  Settings,
  LogOut,
  Loader2,
  Activity,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useTranslation } from '@/hooks/use-translation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent
} from '@/components/ui/dropdown-menu';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/login');
  };

  const navItems = [
    {
      href: '/dashboard',
      icon: LayoutDashboard,
      label: t('header.dashboard'),
    },
    { href: '/markets', icon: CandlestickChart, label: t('header.markets') },
    { href: '/trades', icon: Wallet, label: t('header.trades') },
    { href: '/expenses', icon: PiggyBank, label: t('header.expenses') },
    {
      href: '/ai-assistant',
      icon: Bot,
      label: t('header.ai_assistant'),
    },
    {
      href: '/work-history',
      icon: Activity,
      label: t('header.work_history'),
    }
  ];

  if (isUserLoading || !user) {
    return (
       <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label, className: 'bg-primary text-primary-foreground' }}
                >
                  <a href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <LanguageSwitcher />
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-2 rounded-md p-2 text-left text-sm hover:bg-sidebar-accent">
                <Avatar className="size-8">
                  <AvatarImage src={user.photoURL ?? ''} />
                  <AvatarFallback>{user.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
                    <span className="font-semibold text-sidebar-foreground">{user.displayName}</span>
                    <span className="text-xs text-sidebar-foreground/70">{user.email}</span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Theme</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <ThemeSwitcher />
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
           </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
