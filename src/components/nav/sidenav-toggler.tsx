import useSidePanelToggleStore from '@/store/sidePanelToggle'
import { ChevronRight, Menu } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '../ui/button'
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet'
import SideNav from './nav'

export default function SideNavToggler({ className }: { className?: string }) {
  const { toggle, isOpen } = useSidePanelToggleStore()

  return (
    <div className={className}>
      <Button
        variant="outline"
        size="xs"
        className="hidden p-1 xl:flex justify-center items-center size-6"
        type="button"
        onClick={() => toggle()}
      >
        {isOpen ? <ChevronRight size={16} /> : <Menu size={16} />}
      </Button>
      <Sheet>
        <SheetTrigger
          asChild
          className={cn(
            buttonVariants({ variant: 'outline', size: 'xs' }),
            'flex justify-center items-center h-6 w-6 p-1 xl:hidden cursor-pointer',
          )}
        >
          <Menu size={20} />
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-full p-0 sm:w-[300px]"
        >
          <SideNav isLoadingInSheet={true} />
        </SheetContent>
      </Sheet>
    </div>
  )
}
