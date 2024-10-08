import { create } from 'zustand'

import { TabType } from '../types/api'
import { isLocalStorageAvailable } from './store'

type TabViewStoreType = {
  tabs: TabType[]
  removeTab: (id: string) => void
  addTab: (tab: TabType) => void
  updateTab: (tab: TabType | TabType[]) => void
}

const useTabRenderStore = create<TabViewStoreType>()((set) => ({
  tabs:
    isLocalStorageAvailable() && localStorage.getItem('tabs')
      ? JSON.parse(localStorage.getItem('tabs')!)
      : [],
  removeTab: (id: string) => {
    const tabs =
      isLocalStorageAvailable() && localStorage.getItem('tabs')
        ? JSON.parse(localStorage.getItem('tabs')!)
        : []
    const newTabs = tabs.filter((tab: TabType) => tab.id !== id)
    isLocalStorageAvailable() &&
      localStorage.setItem('tabs', JSON.stringify(newTabs))
    set(() => ({ tabs: newTabs }))
  },
  addTab: (tab: TabType) => {
    const tabs: TabType[] =
      isLocalStorageAvailable() && localStorage.getItem('tabs')
        ? JSON.parse(localStorage.getItem('tabs')!)
        : []
    if (!tabs.map((tab: TabType) => tab.id).includes(tab.id)) {
      tabs.unshift(tab)
      localStorage.setItem('tabs', JSON.stringify(tabs))
      set(() => ({ tabs }))
    }
  },
  updateTab: (tab: TabType | TabType[]) => {
    const tabs =
      isLocalStorageAvailable() && localStorage.getItem('tabs')
        ? JSON.parse(localStorage.getItem('tabs')!)
        : []
    if (Array.isArray(tab)) {
      localStorage.setItem('tabs', JSON.stringify(tab))
      set(() => ({ tabs: tab }))
    } else {
      const newTabs = tabs.map((t: TabType) => {
        if (t.id === tab.id) {
          return tab
        }
        return t
      })
      localStorage.setItem('tabs', JSON.stringify(newTabs))
      set(() => ({ tabs: newTabs }))
    }
  },
}))

export default useTabRenderStore
