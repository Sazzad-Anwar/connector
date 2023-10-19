import Link from "next/link"

import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"
import SideNav from "@/components/sideNav/page"

export default function IndexPage() {
  return (
    <section className="flex h-screen items-center justify-center text-center">
      <h1 className="text-2xl">Welcome to Connector</h1>
    </section>
  )
}
