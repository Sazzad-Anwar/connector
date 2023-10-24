import { create } from "zustand"

import { isLocalStorageAvailable } from "./store"

type ToggleSidePanelType = {
  isOpen: boolean
  toggle: () => void
}

const useSidepanelToggleStore = create<ToggleSidePanelType>()((set) => ({
  isOpen:
    isLocalStorageAvailable() && localStorage.getItem("isSidebarOpen")
      ? JSON.parse(localStorage.getItem("isSidebarOpen")!)
      : true,
  toggle: () => {
    let sidebarIsOpen =
      isLocalStorageAvailable() && localStorage.getItem("isSidebarOpen")
        ? JSON.parse(localStorage.getItem("isSidebarOpen")!)
        : true
    set(() => ({
      isOpen: !sidebarIsOpen,
    }))
    isLocalStorageAvailable() &&
      localStorage.setItem("isSidebarOpen", JSON.stringify(!sidebarIsOpen))
  },
}))

export default useSidepanelToggleStore
