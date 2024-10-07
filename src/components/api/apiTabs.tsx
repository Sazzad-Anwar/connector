import { X } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { cn } from '../../lib/utils'
import useTabRenderView from '../../store/tabView'
import { Button } from '../ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel'

export default function ApiTabs() {
  const { tabs, removeTab } = useTabRenderView()
  const { apiId } = useParams()
  const navigate = useNavigate()

  return (
    <div>
      <Carousel className="w-full pt-5 px-5 border-b">
        <CarouselContent className="ml-0">
          {tabs.map((tab) => (
            <CarouselItem
              key={`folder-${tab.folderId}-api-${tab.id}`}
              className={cn(
                'basis-44 mr-0.5  text-left rounded-t-lg border flex items-center pl-2.5 pr-1.5 py-1',
                tab.id === apiId ? 'bg-secondary' : 'bg-background',
              )}
              onClick={() => navigate(`/api/${tab.folderId}/${tab.id}`)}
            >
              <span className="cursor-pointer w-full text-xs py-1 truncate">
                {tab.name}
              </span>
              <Button
                className="p-0 h-auto"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation()
                  removeTab(tab.id)
                  if (tabs.length === 1) {
                    navigate('/')
                  } else {
                    const lastTab =
                      tabs.indexOf(tab) === 0
                        ? tabs[tabs.indexOf(tab) + 1]
                        : tabs[tabs.indexOf(tab) - 1]
                    navigate(`/api/${lastTab.folderId}/${lastTab.id}`)
                  }
                }}
              >
                <X size={16} />
              </Button>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}
