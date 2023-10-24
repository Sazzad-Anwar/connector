import { cn } from "@/lib/utils";
import useSidepanelToggleStore from "@/store/sidePanelToggle";
import React from "react";
import SideNav from "./nav/nav";
import { Toaster } from "./ui/toaster";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidepanelToggleStore();
  return (
    <main className={cn("min-h-screen bg-background font-sans antialiased")}>
      <div className="relative flex min-h-screen flex-col">
        <div className="flex">
          <SideNav />
          <div
            className={cn(
              "w-full ",
              isOpen ? "lg:w-[calc(100vw-250px)] xl:w-[calc(100vw-300px)]" : "",
            )}
          >
            {children}
          </div>
          <Toaster />
        </div>
      </div>
    </main>
  );
}
