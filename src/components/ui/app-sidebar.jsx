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
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  ChevronDown,
  LayoutDashboard,
  FolderKanban,
  Users2,
  LogOut,
  Building2,
} from 'lucide-react';

export function AppSidebar() {
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
                        Code-Ha-Ja
                      </span>
                      <span className='text-xs text-admin-dark'>
                        User Role
                      </span>
                    </div>
                  </div>
                  <ChevronDown className='ml-auto text-admin-dark' size={16} />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-[--radix-popper-anchor-width] animate-in fade-in-0 zoom-in-95'>
                <DropdownMenuItem className='cursor-pointer'>
                  Users
                </DropdownMenuItem>
                <DropdownMenuItem className='cursor-pointer'>
                  Setting
                </DropdownMenuItem>
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
            {[
              { title: 'Dashboard', icon: LayoutDashboard },
              { title: 'Projects', icon: FolderKanban },
              { title: 'Team', icon: Users2 },
            ].map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className='hover:bg-admin-light transition-colors group'
                >
                  <a
                    href='#'
                    className='flex items-center gap-3 px-3 py-2 rounded-md'
                  >
                    <item.icon
                      size={18}
                      className='group-hover:text-admin-dark transition-colors'
                    />
                    <span className='font-medium'>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className='p-4 border-t border-admin-dark'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className='w-full gap-3 text-admin-dark hover:text-admin-danger hover:bg-admin-light transition-colors'>
              <LogOut size={18} />
              <span className='font-medium'>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
