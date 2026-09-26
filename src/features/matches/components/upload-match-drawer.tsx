import { useQuery } from '@tanstack/react-query'
import { CirclePlus, X } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { teamQueries } from '@/features/teams/queries'

import UploadMatchForm from './upload-match-form'

type UploadMatchDrawerProps = {
  teamId?: string
}

export default function UploadMatchDrawer({ teamId }: UploadMatchDrawerProps) {
  const [open, setOpen] = useState(false)
  const teamIdNumber = teamId !== undefined ? Number(teamId) : NaN
  const teamQuery = useQuery({
    ...teamQueries.detail(Number.isFinite(teamIdNumber) ? teamIdNumber : 0),
    enabled: teamId !== undefined && Number.isFinite(teamIdNumber),
    staleTime: 'static',
  })
  const teamName = teamQuery.data?.data.name

  return (
    <Drawer open={open} onOpenChange={setOpen} swipeDirection="right">
      <DrawerTrigger
        render={
          <Button size="lg" className="rounded-none">
            <CirclePlus data-icon="inline-start" /> Upload Match
          </Button>
        }
      />
      <DrawerContent className="w-md rounded-none [--drawer-inset:0px]">
        <DrawerHeader
          className="flex-row items-center justify-between p-4"
          style={{
            background:
              'linear-gradient(90deg, rgba(13, 23, 34, 0.7) 1.56%, rgba(28, 48, 76, 0.7) 74.21%)',
          }}
        >
          <div className="flex flex-col">
            <DrawerTitle className="font-heading text-xl">
              Upload Match
            </DrawerTitle>
            <DrawerDescription className="order-first text-base text-primary">
              {teamId ? (teamName ?? 'Loading…') : 'New Match'}
            </DrawerDescription>
          </div>
          <DrawerClose
            render={
              <Button variant="ghost" className="text-muted" size="icon-lg">
                <X className="stroke-3" />
              </Button>
            }
          />
        </DrawerHeader>
        <div className="p-4">
          <UploadMatchForm
            key={teamId ?? 'free'}
            teamId={teamId}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
