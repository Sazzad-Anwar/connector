import { create } from 'zustand'
import { isLocalStorageAvailable } from './store'

type ToggleSidePanelType = {
  isCreatingFolder: boolean
  isOpen: boolean
  toggle: () => void
  setIsCreatingFolder: (value: boolean) => void
}

const useSidePanelToggleStore = create<ToggleSidePanelType>()((set) => ({
  isCreatingFolder: false,
  isOpen:
    isLocalStorageAvailable() && localStorage.getItem('isSidebarOpen')
      ? JSON.parse(localStorage.getItem('isSidebarOpen')!)
      : true,
  setIsCreatingFolder: (value) => set(() => ({ isCreatingFolder: value })),
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
