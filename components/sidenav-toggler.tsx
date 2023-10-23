import React from "react"
import useSidepanelToggleStore from "@/store/sidePanelToggle"
import { ChevronRight, Menu } from "lucide-react"

import { cn } from "@/lib/utils"

import SideNav from "./sideNav/page"
import { Button, buttonVariants } from "./ui/button"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"

export default function SidenavToggler() {
  const { toggle, isOpen } = useSidepanelToggleStore()

  return (
    <>
      <Button
        variant="outline"
        size="xs"
        className="hidden p-1 lg:flex"
        type="button"
        onClick={() => toggle()}
      >
        {isOpen ? <ChevronRight size={16} /> : <Menu size={16} />}
      </Button>
      <Sheet>
        <SheetTrigger
          asChild
          className={cn(
            buttonVariants({ variant: "outline", size: "xs" }),
            "flex h-6 w-6 p-1 lg:hidden"
          )}
        >
          <Menu size={20} />
        </SheetTrigger>
        <SheetContent side="left" className="w-full p-0 sm:w-[300px]">
          <SideNav isLoadingInSheet={true} />
        </SheetContent>
      </Sheet>
    </>
  )
}
