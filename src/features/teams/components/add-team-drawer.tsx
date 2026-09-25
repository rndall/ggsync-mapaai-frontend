import { PlusCircle, X } from 'lucide-react'
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

import AddTeamForm from './add-team-form'

export default function AddTeamDrawer() {
  const [open, setOpen] = useState(false)

  return (
    <Drawer open={open} onOpenChange={setOpen} swipeDirection="right">
      <DrawerTrigger
        render={
          <Button size="lg" className="rounded-none text-[#1C304C]">
            <PlusCircle data-icon="inline-start" /> Add New Team
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
            <DrawerTitle className="font-heading text-xl">Add Team</DrawerTitle>
            <DrawerDescription className="order-first text-base text-primary">
              Teams
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
          <AddTeamForm onSuccess={() => setOpen(false)} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
