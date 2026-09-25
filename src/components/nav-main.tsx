'use client'

import { Link } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
} from '@/components/ui/sidebar'

import { Separator } from './ui/separator'

export function NavMain({
  sections,
}: {
  sections: {
    title?: string
    items: {
      name: string
      url: string
      icon: LucideIcon
    }[]
  }[]
}) {
  return (
    <>
      {sections.map((section, i) => (
        <SidebarGroup key={section.title ?? i} className="gap-4">
          <div className="flex items-center">
            {section.title && (
              <SidebarGroupLabel className="uppercase">
                {section.title}
              </SidebarGroupLabel>
            )}
            <Separator />
          </div>
          <SidebarMenu className="gap-2">
            {section.items.map((item) => (
              <SidebarMenuButton
                className="rounded-sm border border-transparent text-base text-muted data-active:border-primary data-active:bg-transparent data-active:bg-[linear-gradient(90deg,#091017_0%,rgba(9,16,23,0)_100%)]"
                key={item.name}
                tooltip={item.name}
                render={
                  <Link
                    to={item.url}
                    activeProps={{ 'data-active': true }}
                    className="group"
                  >
                    <item.icon className="group-data-active:text-primary" />
                    <span>{item.name}</span>
                  </Link>
                }
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  )
}
