import { Link } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeftRight,
    Bell,
    LayoutDashboard,
    Settings,
    Users,
    Wallet,
    FileText,
    UserCircle2,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { SendMoneyModal } from '@/components/send-money-modal';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutDashboard,
    },
    {
        title: 'Conversion',
        href: '#',
        icon: ArrowLeftRight,
    },
    {
        title: 'Wallet',
        href: '#',
        icon: Wallet,
    },
    {
        title: 'Beneficiaries',
        href: '/receivers',
        icon: Users,
    },
    {
        title: 'Reports',
        href: '#',
        icon: FileText,
    },
    {
        title: 'Team',
        href: '#',
        icon: UserCircle2,
    },
];

const bottomNavItems: NavItem[] = [
    {
        title: 'Notifications',
        href: '#',
        icon: Bell,
    },
    {
        title: 'Settings',
        href: '#',
        icon: Settings,
    },
];

export function AppSidebar() {
    const [sendMoneyOpen, setSendMoneyOpen] = useState(false);

    return (
        <>
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />

                {/* CTA Buttons */}
                <div className="mt-auto px-3 pb-2 flex flex-col gap-2 group-data-[collapsible=icon]:hidden">
                    <button className="w-full rounded-xl bg-[#1B3A2A] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#163020]">
                        Add Money
                    </button>
                    <button
                        onClick={() => setSendMoneyOpen(true)}
                        className="w-full rounded-xl bg-[#F5C518] py-2.5 text-sm font-semibold text-[#1a1a1a] transition-colors hover:bg-[#e8b910]"
                    >
                        Send Money
                    </button>
                </div>
            </SidebarContent>

            <SidebarFooter>
                <SidebarSeparator />
                <NavMain items={bottomNavItems} />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
        <SendMoneyModal isOpen={sendMoneyOpen} onClose={() => setSendMoneyOpen(false)} />
        </>
    );
}
