import { create } from 'zustand'

import { isLocalStorageAvailable } from './store'

type ResultRenderViewType = {
  resultRenderView: 'horizontal' | 'vertical'
  toggleResultRenderView: () => void
}

const useResultRenderViewStore = create<ResultRenderViewType>()((set) => ({
  resultRenderView: (isLocalStorageAvailable() &&
  localStorage.getItem('resultRenderView')
    ? localStorage.getItem('resultRenderView')
    : 'horizontal') as 'horizontal' | 'vertical',
  toggleResultRenderView: () => {
    const resultRenderView =
      isLocalStorageAvailable() && localStorage.getItem('resultRenderView')
        ? localStorage.getItem('resultRenderView')!
        : 'horizontal'
    set(() => ({
      resultRenderView:
        resultRenderView === 'horizontal' ? 'vertical' : 'horizontal',
    }))
    isLocalStorageAvailable() &&
      localStorage.setItem(
        'resultRenderView',
        JSON.stringify(!resultRenderView),
      )
  },
}))

export default useResultRenderViewStore
