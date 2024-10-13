/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from '@/lib/utils'
import useSidePanelToggleStore from '@/store/sidePanelToggle'

import React, { useEffect, useState } from 'react'
import { Pane } from 'split-pane-react'
import SplitPane from 'split-pane-react/esm/SplitPane'
// import useUpdate from '../hooks/useUpdate'
import SideNav from './nav/nav'
import { Toaster } from './ui/toaster'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidePanelToggleStore()
  // const { checkUpdate, RestartApp } = useUpdate()
  const sideNavWidth = 300
  const [sizes, setSizes] = useState([
    window.innerWidth >= 1024 ? 250 : sideNavWidth,
    window.innerWidth - sideNavWidth,
  ])

  // useEffect(() => {
  //   checkUpdate()
  // }, [])

  useEffect(() => {
    if (!isOpen) {
      setSizes([0, window.innerWidth])
    } else {
      setSizes([sideNavWidth, window.innerWidth - sideNavWidth])
    }
  }, [isOpen])

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

  useEffect(() => {
    if (import.meta.env.PROD) {
      document.addEventListener('contextmenu', (e) => e.preventDefault())

      function ctrlShiftKey(e: KeyboardEvent, keyCode: string) {
        return e.ctrlKey && e.shiftKey && e.keyCode === keyCode.charCodeAt(0)
      }

      document.onkeydown = (e) => {
        if (
          (e as KeyboardEvent).keyCode === 123 ||
          ctrlShiftKey(e as KeyboardEvent, 'I') ||
          ctrlShiftKey(e as KeyboardEvent, 'J') ||
          ctrlShiftKey(e as KeyboardEvent, 'C') ||
          ((e as KeyboardEvent).ctrlKey &&
            (e as KeyboardEvent).keyCode === 'U'.charCodeAt(0))
        )
          return false
      }
    }
  }, [])

  return (
    <>
      <main className={cn('min-h-screen bg-background font-sans antialiased')}>
        <div className="relative flex min-h-screen flex-col transition-all duration-200 ease-linear">
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
      {/* <RestartApp /> */}
    </>
  )
}
