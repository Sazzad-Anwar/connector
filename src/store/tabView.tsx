import { create } from 'zustand'

import { TabType } from '../types/api'
import { isLocalStorageAvailable } from './store'

type TabViewStoreType = {
  tabs: TabType[]
  removeFromTab: (id: string) => void
  addInTab: (tab: TabType) => void
}

const useTabRenderView = create<TabViewStoreType>()((set) => ({
  tabs:
    isLocalStorageAvailable() && localStorage.getItem('tabs')
      ? JSON.parse(localStorage.getItem('tabs')!)
      : [],
  removeFromTab: (id: string) => {
    const tabs =
      isLocalStorageAvailable() && localStorage.getItem('tabs')
        ? JSON.parse(localStorage.getItem('tabs')!)
        : []
    const newTabs = tabs.filter((tab: TabType) => tab.id !== id)
    isLocalStorageAvailable() &&
      localStorage.setItem('tabs', JSON.stringify(newTabs))
    set(() => ({ tabs: newTabs }))
  },
  addInTab: (tab: TabType) => {
    const tabs =
      isLocalStorageAvailable() && localStorage.getItem('tabs')
        ? JSON.parse(localStorage.getItem('tabs')!)
        : []
    if (!tabs.map((tab: TabType) => tab.id).includes(tab.id)) {
      tabs.push(tab)
      localStorage.setItem('tabs', JSON.stringify(tabs))
      set(() => ({ tabs }))
    }
  },
}))

export default useTabRenderView
