import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import z from 'zod'

import { getReturnPath } from '@/features/auth/return-path'
import { getAuthToken } from '@/lib/api'

import AuthBg from './-components/auth-bg'

export const Route = createFileRoute('/_auth')({
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  beforeLoad({ search }) {
    if (getAuthToken()) {
      throw redirect({
        href: getReturnPath(search.redirect),
        replace: true,
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="relative min-h-svh w-full bg-[#0D1722]">
      <AuthBg />
      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  )
}
