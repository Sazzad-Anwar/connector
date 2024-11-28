import { ChevronsRight } from "lucide-react";

export default function Breadcrumbs({
  breadcrumbs,
}: {
  breadcrumbs: string[];
}) {
  return (
    <div className="flex items-center w-auto min-w-max text-opacity-50 no-select">
      {breadcrumbs.length
        ? breadcrumbs?.map((breadcrumb, index) => (
          <span
            key={breadcrumb}
            className="flex items-center ml-2 w-auto min-w-max text-sm"
          >
            {index > 0 && <ChevronsRight size={13} className="mr-2" />}
            {breadcrumb}
          </span>
        ))
        : null}
    </div>
  );
}
