import {
  FolderClosed,
  KanbanSquare,
  LayoutDashboard,
  LucideIcon,
} from "lucide-react"
import { v4 as uuid } from "uuid"

export interface SideNav {
  id: string
  routeName: string
  route?: string
  hasChildren: boolean
  icon?: LucideIcon
  children?: SideNav[]
}

export interface ApiType {
  id: string
  isCollection: boolean
  isRequest: boolean
  name: string
  children: ApiType[]
}

export const SideNavigation: SideNav[] = [
  {
    id: uuid(),
    routeName: "Dashboard",
    route: "Route 1",
    hasChildren: false,
    icon: FolderClosed,
  },
  {
    id: uuid(),
    routeName: "Products",
    hasChildren: true,
    children: [
      {
        id: uuid(),
        routeName: "All Products",
        route: "Route 2",
        hasChildren: false,
      },
      {
        id: uuid(),
        routeName: "New Products",
        route: "/admin/new-products",
        hasChildren: false,
      },
    ],
  },
]
