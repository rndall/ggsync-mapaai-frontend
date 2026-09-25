import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/teams/$teamId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authed/teams/$teamId"!</div>
}
