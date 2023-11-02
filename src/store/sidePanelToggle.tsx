import { create } from 'zustand'

import { isLocalStorageAvailable } from './store'

type ToggleSidePanelType = {
  isOpen: boolean
  toggle: () => void
}

const useSidePanelToggleStore = create<ToggleSidePanelType>()((set) => ({
  isOpen:
    isLocalStorageAvailable() && localStorage.getItem('isSidebarOpen')
      ? JSON.parse(localStorage.getItem('isSidebarOpen')!)
      : true,
  toggle: () => {
    const sidebarIsOpen =
      isLocalStorageAvailable() && localStorage.getItem('isSidebarOpen')
        ? JSON.parse(localStorage.getItem('isSidebarOpen')!)
        : true
    set(() => ({
      isOpen: !sidebarIsOpen,
    }))
    isLocalStorageAvailable() &&
      localStorage.setItem('isSidebarOpen', JSON.stringify(!sidebarIsOpen))
  },
}))

export default useSidePanelToggleStore
