import { cn } from '@/lib/utils'
import useTabRenderStore from '@/store/tabView'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel'

type Props = {
  isEdited: boolean
}

export default function ApiTabs({ isEdited }: Props) {
  const { tabs, removeTab, updateTab } = useTabRenderStore()
  const { apiId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    updateTab(tabs.map((item) => ({ ...item, isActive: apiId === item.id })))
  }, [apiId])

  return (
    <div>
      <Carousel
        opts={{ slidesToScroll: 1, align: 'start' }}
        className="w-full pt-5 px-11 border-b"
      >
        <CarouselContent className="ml-0">
          {tabs.map((tab) => (
            <CarouselItem
              key={`folder-${tab.folderId}-api-${tab.id}`}
              className={cn(
                'basis-44 mr-0.5  text-left rounded-t-lg border flex items-center pl-2.5 pr-1.5 py-1 selection:bg-transparent',
                tab.id === apiId ? 'bg-secondary' : 'bg-background',
              )}
              onClick={() => {
                const element = document.getElementById(tab.id)
                element?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                })
                updateTab({
                  ...tab,
                  isActive: true,
                })
                navigate(`/api/${tab.folderId}/${tab.id}#${tab.id}`)
              }}
            >
              <span className="cursor-pointer w-full text-xs py-1 truncate">
                {tab.name}
              </span>
              <div className="flex items-center justify-end gap-1">
                {apiId === tab.id && isEdited && (
                  <span className="h-2 w-2 flex justify-center items-center p-0 rounded-full bg-green-500" />
                )}
                <Button
                  className="p-0 h-auto"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeTab(tab.id)
                    if (tabs.length === 1) {
                      navigate('/')
                    } else {
                      const nextTab =
                        tabs.indexOf(tab) === 0
                          ? tabs[tabs.indexOf(tab) + 1]
                          : tabs[tabs.indexOf(tab) - 1]
                      navigate(`/api/${nextTab.folderId}/${nextTab.id}`)
                    }
                  }}
                >
                  <X size={16} />
                </Button>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="ml-14 mr-2 mt-2.5" />
        <CarouselNext className="mr-14 ml-2 mt-2" />
      </Carousel>
    </div>
  )
}
