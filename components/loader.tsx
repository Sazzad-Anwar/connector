import React from "react"
import { Loader as LoaderSpinner } from "lucide-react"

import { cn } from "@/lib/utils"

export default function Loader({
  className,
  height,
}: {
  className?: string
  height?: number
}) {
  return (
    <div
      className={cn(
        "flex min-w-[450px] items-center justify-center",
        className
      )}
      style={{
        height: height ?? 500,
      }}
    >
      <div className="flex flex-col items-center justify-center">
        <LoaderSpinner size={25} className="animate-spin" />
        <span className="flex animate-pulse items-center text-base">
          Connecting
        </span>
      </div>
    </div>
  )
}
