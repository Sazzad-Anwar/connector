"use client"

import React from "react"
import useSidepanelToggleStore from "@/store/sidePanelToggle"

import { cn } from "@/lib/utils"

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidepanelToggleStore()
  return (
    <div
      className={cn(
        "w-full ",
        isOpen ? "lg:w-[calc(100vw-250px)] xl:w-[calc(100vw-300px)]" : ""
      )}
    >
      {children}
    </div>
  )
}
