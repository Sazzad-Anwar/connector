import { cn } from "@/lib/utils";
import useSidepanelToggleStore from "@/store/sidePanelToggle";
import React, { useEffect, useState } from "react";
import SideNav from "./nav/nav";
import { Toaster } from "./ui/toaster";
import SplitPane from "split-pane-react/esm/SplitPane";
import { Pane } from "split-pane-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidepanelToggleStore();
  const sideNavWidth = 300;
  const [sizes, setSizes] = useState([
    sideNavWidth,
    window.innerWidth - sideNavWidth,
  ]);

  useEffect(() => {
    if (!isOpen) {
      setSizes([0, window.innerWidth]);
    } else {
      setSizes([sideNavWidth, window.innerWidth - sideNavWidth]);
    }
  }, [isOpen]);

  return (
    <main className={cn("min-h-screen bg-background font-sans antialiased")}>
      <div className="relative flex min-h-screen flex-col">
        <SplitPane
          sashRender={() => <></>}
          split="vertical"
          sizes={sizes}
          onChange={(sizes) => setSizes(sizes)}
        >
          <Pane minSize={isOpen ? sideNavWidth : 0} maxSize={sideNavWidth * 2}>
            <SideNav />
          </Pane>

          <Pane minSize={window.innerWidth / 2} maxSize="100%">
            {children}
          </Pane>
        </SplitPane>
        <Toaster />
      </div>
    </main>
  );
}
