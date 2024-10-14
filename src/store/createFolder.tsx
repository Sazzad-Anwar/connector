import { create } from 'zustand'

type CreatingFolderStoreType = {
  isCreatingFolder: boolean
  isCreatingCollection: boolean
  setIsCreatingFolder: (value: boolean) => void
  setIsCreatingCollection: (value: boolean) => void
}

const useCreatingFolderStore = create<CreatingFolderStoreType>()((set) => ({
  isCreatingFolder: false,
  isCreatingCollection: false,
  setIsCreatingFolder: (value) =>
    set((state) => ({ ...state, isCreatingFolder: value })),
  setIsCreatingCollection: (value) =>
    set((state) => ({ ...state, isCreatingCollection: value })),
}))

export default useCreatingFolderStore
