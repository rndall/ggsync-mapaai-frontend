import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/matches/$matchId/$teamId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authed/matches/$matchId/$teamId"!</div>
}
