import SideNavToggler from '@/components/nav/sidenav-toggler'

export default function page() {
  return (
    <section className="flex h-screen flex-col items-center justify-center text-center relative">
      <SideNavToggler className="absolute top-5 left-5" />
      <div className="flex justify-center items-center h-14 w-14 rounded-full border bg-secondary p-2">
        <i className="bi bi-plugin text-4xl " />
      </div>
      <h1 className="text-2xl mt-3">Welcome to Connector</h1>
    </section>
  )
}
