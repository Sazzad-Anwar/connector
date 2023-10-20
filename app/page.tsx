import { Waypoints } from "lucide-react"

export default function IndexPage() {
  return (
    <section className="flex h-screen flex-col items-center justify-center text-center">
      <Waypoints className="h-20 w-20 rounded-full border bg-secondary p-2" />
      <h1 className="text-2xl">Welcome to Connector</h1>
    </section>
  )
}
