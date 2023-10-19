import * as React from "react"
import Link from "next/link"
import { Waypoints } from "lucide-react"

import { siteConfig } from "@/config/site"

import { ThemeToggle } from "./theme-toggle"

export function MainNav() {
  return (
    <div className="flex items-center justify-between gap-6 border-b p-5 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <Waypoints className="h-6 w-6" />
        <span className="inline-block font-bold">{siteConfig.name}</span>
      </Link>
      <ThemeToggle />
    </div>
  )
}
