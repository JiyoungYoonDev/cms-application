'use client';

import { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenuButton,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarGroupLabel,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  FolderKanban,
  Users2,
  LogOut,
  Building2,
  FolderOpen,
  FileEdit,
  Eye,
  Clock,
  AlertCircle,
  UsersRound,
  Crown,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '../common/tiptap/simple/theme-toggle';
import { useAuth } from '@/contexts/auth-context';

const CONTENT_ITEMS = [
  { title: 'Drafts',      href: '/admin/content/drafts',     icon: FileEdit },
  { title: 'In Review',   href: '/admin/content/in-review',  icon: Clock    },
  { title: 'Published',   href: '/admin/content/published',   icon: Eye      },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const [contentOpen, setContentOpen] = useState(false);

  return (
    <Sidebar side='left' className=''>
      <SidebarHeader className='p-4'>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='lg'
                  className='w-full justify-between hover:bg-admin-light transition-all'
                >
                  <div className='flex items-center gap-3'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-admin-primary text-white'>
                      <Building2 size={18} />
                    </div>
                    <div className='flex flex-col items-start leading-tight'>
                      <span className='font-semibold text-admin-dark'>
                        {user?.name ?? user?.email ?? 'CodeHaja'}
                      </span>
                      <span className='text-xs text-admin-dark'>{user?.role ?? ''}</span>
                    </div>
                  </div>
                  <ChevronDown className='ml-auto text-admin-dark' size={16} />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-[--radix-popper-anchor-width] animate-in fade-in-0 zoom-in-95'>
                <DropdownMenuItem className='cursor-pointer'>Users</DropdownMenuItem>
                <DropdownMenuItem className='cursor-pointer'>Setting</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className='px-2'>
        <SidebarGroup>
          <SidebarGroupLabel className='px-3 text-xs font-semibold uppercase tracking-wider text-admin-dark'>
            General
          </SidebarGroupLabel>
          <SidebarMenu className='mt-2 gap-1'>

            {/* Dashboard */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild className='hover:bg-admin-light transition-colors group'>
                <Link href='/admin/dashboard' className='flex items-center gap-3 px-3 py-2 rounded-md'>
                  <LayoutDashboard size={18} className='group-hover:text-admin-dark transition-colors' />
                  <span className='font-medium'>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Project */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild className='hover:bg-admin-light transition-colors group'>
                <Link href='/admin/courses' className='flex items-center gap-3 px-3 py-2 rounded-md'>
                  <FolderKanban size={18} className='group-hover:text-admin-dark transition-colors' />
                  <span className='font-medium'>Project</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* AI Generation */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild className='hover:bg-admin-light transition-colors group'>
                <Link href='/admin/generation' className='flex items-center gap-3 px-3 py-2 rounded-md'>
                  <Sparkles size={18} className='group-hover:text-admin-dark transition-colors' />
                  <span className='font-medium'>AI Generation</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Content Manager (collapsible) */}
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setContentOpen((v) => !v)}
                className='hover:bg-admin-light transition-colors group w-full'
              >
                <div className='flex items-center gap-3 px-3 py-2 rounded-md w-full'>
                  <FolderOpen size={18} className='group-hover:text-admin-dark transition-colors shrink-0' />
                  <span className='font-medium flex-1'>Content Manager</span>
                  <ChevronRight
                    size={14}
                    className={`text-admin-dark transition-transform ${contentOpen ? 'rotate-90' : ''}`}
                  />
                </div>
              </SidebarMenuButton>
              {contentOpen && (
                <SidebarMenuSub>
                  {CONTENT_ITEMS.map((sub) => (
                    <SidebarMenuSubItem key={sub.href}>
                      <SidebarMenuSubButton asChild>
                        <Link href={sub.href} className='flex items-center gap-2'>
                          <sub.icon size={14} />
                          {sub.title}
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              )}
            </SidebarMenuItem>

            {/* Users */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild className='hover:bg-admin-light transition-colors group'>
                <Link href='/admin/users' className='flex items-center gap-3 px-3 py-2 rounded-md'>
                  <UsersRound size={18} className='group-hover:text-admin-dark transition-colors' />
                  <span className='font-medium'>Users</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Subscriptions */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild className='hover:bg-admin-light transition-colors group'>
                <Link href='/admin/subscriptions' className='flex items-center gap-3 px-3 py-2 rounded-md'>
                  <Crown size={18} className='group-hover:text-admin-dark transition-colors' />
                  <span className='font-medium'>Subscriptions</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Issue Tracker */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild className='hover:bg-admin-light transition-colors group'>
                <Link href='/admin/issues' className='flex items-center gap-3 px-3 py-2 rounded-md'>
                  <AlertCircle size={18} className='group-hover:text-admin-dark transition-colors' />
                  <span className='font-medium'>Issue Tracker</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Team */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild className='hover:bg-admin-light transition-colors group'>
                <Link href='/team' className='flex items-center gap-3 px-3 py-2 rounded-md'>
                  <Users2 size={18} className='group-hover:text-admin-dark transition-colors' />
                  <span className='font-medium'>Team</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className='p-4 border-t border-admin-dark'>
        <SidebarMenu>
          <SidebarMenuItem>
            <ThemeToggle />
            <SidebarMenuButton
              onClick={logout}
              className='w-full gap-3 text-admin-dark hover:text-admin-danger hover:bg-admin-light transition-colors cursor-pointer'
            >
              <LogOut size={18} />
              <span className='font-medium'>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
