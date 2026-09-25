import { createFileRoute } from '@tanstack/react-router'

import LoginForm from './-components/login-form'

export const Route = createFileRoute('/_auth/login')({
  component: RouteComponent,
})

function RouteComponent() {
  const { redirect } = Route.useSearch()

  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="relative w-full max-w-113">
        <LoginForm redirect={redirect} />
      </div>
    </div>
  )
}
