/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from '@/lib/utils'
import useSidePanelToggleStore from '@/store/sidePanelToggle'
import React, { lazy, Suspense, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pane } from 'split-pane-react'
import SplitPane from 'split-pane-react/esm/SplitPane'
import useUpdate from '../hooks/useUpdate'
import useTabRenderStore from '../store/tabView'
import Loading from './loading'
import { Toaster } from './ui/toaster'
const SideNav = lazy(() => import('./nav/nav'))

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidePanelToggleStore()
  const { tabs } = useTabRenderStore()
  const navigate = useNavigate()
  const { checkUpdate, RestartApp } = useUpdate()
  const sideNavWidth = 320
  const [sizes, setSizes] = useState([
    window.innerWidth >= 1024 ? 250 : sideNavWidth,
    window.innerWidth - sideNavWidth,
  ])

  useEffect(() => {
    checkUpdate()
  }, [])

  useEffect(() => {
    if (!isOpen) {
      setSizes([0, window.innerWidth])
    } else {
      setSizes([sideNavWidth, window.innerWidth - sideNavWidth])
    }
  }, [isOpen])

  useEffect(() => {
    const activeTab = tabs.find((tab) => tab.isActive)
    if (activeTab?.id) {
      navigate(`/api/${activeTab?.folderId}/${activeTab?.id}`)
    } else {
      navigate('/')
    }
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
            className="hidden lg:block"
          >
            <Pane
              minSize={isOpen ? sideNavWidth : 0}
              maxSize={sideNavWidth * 2}
            >
              <Suspense fallback={<Loading className="h-screen" />}>
                <SideNav />
              </Suspense>
            </Pane>

            <Pane
              minSize={window.innerWidth / 2}
              maxSize="100%"
            >
              {children}
            </Pane>
          </SplitPane>
          <div className="block lg:hidden">{children}</div>
          <Toaster />
        </div>
      </main>
      <RestartApp />
    </>
  )
}
