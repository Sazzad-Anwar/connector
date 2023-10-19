"use Client"

import { MoveRight } from "lucide-react"

export default function Breadcrumbs({
  breadcrumbs,
}: {
  breadcrumbs: string[]
}) {
  return (
    <div className="flex items-center text-opacity-50">
      {breadcrumbs.length &&
        breadcrumbs?.map((breadcrumb, index) => (
          <span key={breadcrumb} className="ml-2 flex items-center">
            {index > 0 && <MoveRight size={13} className="mr-2" />}
            {breadcrumb}
          </span>
        ))}
    </div>
  )
}
