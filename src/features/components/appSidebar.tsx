'use client'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  BadgeRussianRuble,
  ChartLine,
  ChartNoAxesCombined,
  ChevronDown,
  ClipboardList,
  CreditCard,
  FileCheckCorner,
  Handbag,
  LucideIcon,
  Plus,
  SidebarIcon,
} from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type SubMenu = {
  href: string
  label: string
  icon: LucideIcon
}

function AppSidebar() {
  const {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  } = useSidebar()

  const [openHoverId, setOpenHoverId] = useState<number>(0)
  const pathname = usePathname()

  const mainItems = [
    {
      id: 1,
      href: '/payments',
      label: 'Платежи',
      icon: ChartLine,
      group: false,
    },
    {
      id: 2,
      href: '/accounts',
      label: 'Счета',
      icon: CreditCard,
      group: false,
    },
    {
      id: 3,
      href: '/analytics',
      label: 'Аналитика',
      icon: ChartNoAxesCombined,
      group: false,
    },
    {
      id: 4,
      label: 'Продажи',
      icon: BadgeRussianRuble,
      group: true,
      chevron: ChevronDown,
      isActive:
        pathname?.startsWith('/sales') || pathname.startsWith('/contracts'),
      subItems: [
        {
          href: '/sales',
          label: 'Продажи',
          icon: ClipboardList,
        },
        {
          href: '/contracts',
          label: 'Договора',
          icon: FileCheckCorner,
        },
      ],
    },
    {
      id: 5,
      label: 'Товары и услуги',
      icon: Handbag,
      group: true,
      chevron: ChevronDown,
      isActive:
        pathname?.startsWith('/nomenclature') ||
        pathname?.startsWith('/prices'),
      subItems: [
        {
          href: '/prices',
          label: 'Цены',
          icon: ClipboardList,
        },
        {
          href: '/nomenclature',
          label: 'Номенклатура',
          icon: FileCheckCorner,
        },
      ],
    },
  ]

  const isActive = (path: string) => pathname === path

  const subMenu = (subItem: SubMenu) => {
    return (
      <SidebarMenuSubItem key={subItem.href}>
        <SidebarMenuSubButton asChild isActive={isActive(subItem.href)}>
          <Link href={subItem.href}>
            <subItem.icon className="!h-4.5 !w-4.5" />
            <span className="text-[17px]">{subItem.label}</span>
          </Link>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    )
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarMenu className="gap-2 px-3.5 py-4">
          {mainItems.map((item) =>
            item.group ? (
              <SidebarMenuItem key={item.id}>
                <Collapsible defaultOpen className="group/collapsible">
                  <HoverCard
                    open={openHoverId === item.id && !open}
                    onOpenChange={(hoverOpen) => {
                      if (!open) setOpenHoverId(hoverOpen ? item.id : 0)
                    }}
                    openDelay={100}
                    closeDelay={100}
                  >
                    <HoverCardTrigger asChild>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className="cursor-pointer 
                          data-[active=true]:hover:bg-sidebar-accent
                          data-[active=true]:bg-transparent
                          data-[active=true]:[&>svg]:text-sidebar-primary
                          data-[active=true]:text-sidebar-primary"
                          isActive={item.isActive}
                        >
                          <item.icon
                            className={`${open ? '!h-4.5 !w-4.5' : '!h-5.5 !w-5.5'} 
                            transition-all duration-500`}
                          />
                          <span className="text-[17px]">{item.label}</span>
                          {item.chevron && (
                            <item.chevron
                              className="ml-auto 
                      transition-transform group-data-[state=open]/collapsible:rotate-180"
                            />
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                    </HoverCardTrigger>

                    <HoverCardContent
                      side="right"
                      align="start"
                      className="ml-1.5 w-auto"
                    >
                      <SidebarMenu>
                        {item.subItems?.map((subItem) => subMenu(subItem))}
                      </SidebarMenu>
                    </HoverCardContent>
                  </HoverCard>

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.subItems?.map((subItem) => subMenu(subItem))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            ) : (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  asChild
                  className="cursor-pointer 
                      data-[active=true]:hover:bg-sidebar-accent
                      data-[active=true]:bg-transparent
                      data-[active=true]:[&>svg]:text-sidebar-primary
                      data-[active=true]:text-sidebar-primary"
                  tooltip={item.label}
                  isActive={isActive(item.href!)}
                >
                  <Link href={item.href!}>
                    <item.icon
                      className={`${open ? '!h-4.5 !w-4.5' : '!h-5.5 !w-5.5'} 
                      transition-all duration-500`}
                    />
                    <span className="text-[17px]">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ),
          )}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}

export default AppSidebar
