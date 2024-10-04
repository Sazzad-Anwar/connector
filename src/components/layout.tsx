/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from '@/lib/utils'
import useSidePanelToggleStore from '@/store/sidePanelToggle'
import { platform } from '@tauri-apps/api/os'
import {
  checkUpdate,
  installUpdate,
  onUpdaterEvent,
} from '@tauri-apps/api/updater'
import React, { useEffect, useState } from 'react'
import { Pane } from 'split-pane-react'
import SplitPane from 'split-pane-react/esm/SplitPane'
import SideNav from './nav/nav'
import { Toaster } from './ui/toaster'
import { toast } from './ui/use-toast'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidePanelToggleStore()
  const sideNavWidth = 300
  const [sizes, setSizes] = useState([
    window.innerWidth >= 1024 ? 250 : sideNavWidth,
    window.innerWidth - sideNavWidth,
  ])

  useEffect(() => {
    if (!isOpen) {
      setSizes([0, window.innerWidth])
    } else {
      setSizes([sideNavWidth, window.innerWidth - sideNavWidth])
    }
  }, [isOpen])

  useEffect(() => {
    const checkUpdateHandler = async () => {
      try {
        const platformName = await platform()
        if (platformName) {
          const update = await checkUpdate()
          if (update.shouldUpdate) {
            await installUpdate()
          }
        }
      } catch (error: any) {
        return null
      }
    }
    const unlisten = async () => {
      try {
        await onUpdaterEvent(({ error }) => {
          if (error) {
            toast({
              variant: 'error',
              title: 'Error',
              description: error,
            })
          } else {
            toast({
              variant: 'success',
              title: 'Success',
              description: 'Update available',
            })
          }
        })
      } catch (error: any) {
        return null
      }
    }
    checkUpdateHandler()
    unlisten()
  }, [])

  useEffect(() => {
    const resizeWindow = () => {
      if (window.innerWidth <= 1024) {
        setSizes([0, window.innerWidth])
      } else {
        if (isOpen) {
          setSizes([sideNavWidth, window.innerWidth - sideNavWidth])
        } else {
          setSizes([0, window.innerWidth - sideNavWidth])
        }
      }
    }

    window.addEventListener('resize', () => {
      resizeWindow()
    })
    resizeWindow()
  }, [isOpen])

  return (
    <main className={cn('min-h-screen bg-background font-sans antialiased')}>
      <div className="relative flex min-h-screen flex-col">
        <SplitPane
          sashRender={() => <></>}
          split="vertical"
          sizes={sizes}
          onChange={(sizes) => setSizes(sizes)}
        >
          <Pane
            minSize={isOpen ? sideNavWidth : 0}
            maxSize={sideNavWidth * 2}
          >
            <SideNav />
          </Pane>

          <Pane
            minSize={window.innerWidth / 2}
            maxSize="100%"
          >
            {children}
          </Pane>
        </SplitPane>
        <Toaster />
      </div>
    </main>
  )
}
