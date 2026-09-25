import { createFileRoute } from '@tanstack/react-router'

import RegisterForm from './-components/register-form'

export const Route = createFileRoute('/_auth/register')({
  component: RouteComponent,
})

function RouteComponent() {
  const { redirect } = Route.useSearch()

  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="relative w-full max-w-113">
        <RegisterForm redirect={redirect} />
      </div>
    </div>
  )
}
