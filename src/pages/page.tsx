import SidenavToggler from "@/components/nav/sidenav-toggler";
// import { buttonVariants } from "@/components/ui/button";
// import { Link } from "react-router-dom";
// import { cn } from "@/lib/utils";
// import { FaServer } from "react-icons/fa";

export default function page() {
  return (
    <section className="flex h-screen flex-col items-center justify-center text-center relative">
      <SidenavToggler className="absolute top-5 left-5" />
      <div className="flex justify-center items-center h-14 w-14 rounded-full border bg-secondary p-2">
        <i className="bi bi-plugin text-4xl " />
      </div>
      <h1 className="text-2xl mt-3">Welcome to Connector</h1>
      {/*<Link
        to="/auth"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "text-base font-medium mt-3",
        )}
      >
        Plug into cloud
        <FaServer size={15} className="ml-2" />
      </Link>*/}
    </section>
  );
}
