import { useEffect, useState } from 'react'
import { useDebounce } from '../../hooks/useDebounce'
import { cn } from '../../lib/utils'
import useApiStore from '../../store/store'
import { Input } from '../ui/input'

type Props =
  | (
      | {
          searchType: 'api'
          collectionId: string
        }
      | {
          searchType: 'collection'
        }
    ) & { className?: string; placeholder?: string }

export default function Search(props: Props) {
  const [search, setSearch] = useState<string>('')
  const debouncedValue = useDebounce(search, 700)
  const { searchApi } = useApiStore()

  useEffect(() => {
    // if (props.searchType === 'collection') {
    //   searchApi(debouncedValue)
    // } else {
    //   searchApi(debouncedValue, props.collectionId)
    // }
    searchApi(debouncedValue)
  }, [debouncedValue])
  return (
    <Input
      className={cn('mx-2 h-7 rounded', props.className)}
      value={search}
      placeholder={props.placeholder}
      onChange={(e) => {
        setSearch(e.target.value)
      }}
    />
  )
}
