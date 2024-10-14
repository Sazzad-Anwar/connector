import { ChevronsRight } from 'lucide-react'

export default function Breadcrumbs({
  breadcrumbs,
}: {
  breadcrumbs: string[]
}) {
  return (
    <div className="flex w-auto min-w-max items-center text-opacity-50">
      {breadcrumbs.length
        ? breadcrumbs?.map((breadcrumb, index) => (
            <span
              key={breadcrumb}
              className="ml-2 text-sm flex w-auto min-w-max items-center"
            >
              {index > 0 && (
                <ChevronsRight
                  size={13}
                  className="mr-2"
                />
              )}
              {breadcrumb}
            </span>
          ))
        : null}
    </div>
  )
}
