import { cn } from "@/lib/utils";
import useSidepanelToggleStore from "@/store/sidePanelToggle";
import React, { useEffect, useState } from "react";
import SideNav from "./nav/nav";
import { Toaster } from "./ui/toaster";
import SplitPane from "split-pane-react/esm/SplitPane";
import { Pane } from "split-pane-react";
import {
  checkUpdate,
  installUpdate,
  onUpdaterEvent,
} from "@tauri-apps/api/updater";
import { toast } from "./ui/use-toast";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidepanelToggleStore();
  const sideNavWidth = 300;
  const [sizes, setSizes] = useState([
    window.innerWidth >= 991 ? 250 : sideNavWidth,
    window.innerWidth - sideNavWidth,
  ]);

  useEffect(() => {
    if (!isOpen) {
      setSizes([0, window.innerWidth]);
    } else {
      setSizes([sideNavWidth, window.innerWidth - sideNavWidth]);
    }
  }, [isOpen]);

  useEffect(() => {
    const checkUpdateHandler = async () => {
      const update = await checkUpdate();
      if (update.shouldUpdate) {
        await installUpdate();
      }
    };
    const unlisten = async () => {
      await onUpdaterEvent(({ error }) => {
        if (error) {
          toast({
            variant: "error",
            title: error,
          });
        } else {
          toast({
            variant: "success",
            title: "Connection is updated!",
          });
        }
      });
    };
    checkUpdateHandler();
    unlisten();
  }, []);

  useEffect(() => {
    const resizeWindow = () => {
      if (window.innerWidth < 991) {
        setSizes([0, window.innerWidth]);
      } else {
        setSizes([sideNavWidth, window.innerWidth - sideNavWidth]);
      }
    };

    window.addEventListener("resize", () => {
      resizeWindow();
    });
    resizeWindow();
  }, []);

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
