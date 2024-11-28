import { cn, getRootParentIdForNthChildren } from "@/lib/utils";
import useTabRenderStore from "@/store/tabView";
import { X } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useApiStore from "../../store/store";
import { Button } from "../ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

export default function ApiTabs() {
  const { tabs, removeTab, updateTab } = useTabRenderStore();
  const { apiId } = useParams();
  const navigate = useNavigate();
  const { collections } = useApiStore();

  useEffect(() => {
    updateTab(
      tabs
        .map((item) => ({ ...item, isActive: apiId === item.id }))
        .filter((item) => {
          const rootParentId = getRootParentIdForNthChildren(
            collections,
            item.folderId,
          );
          if (rootParentId) return true;
        }),
    );
  }, [apiId]);

  return (
    <div className="no-select">
      <Carousel
        opts={{ slidesToScroll: 1, align: "start" }}
        className="px-11 pt-5 w-full border-b"
      >
        <CarouselContent className="ml-0">
          {tabs.map((tab) => (
            <CarouselItem
              key={`folder-${tab.folderId}-api-${tab.id}`}
              className={cn(
                "basis-44 mr-0.5  text-left rounded-t-sm border flex items-center pl-2.5 pr-1.5 py-1 selection:bg-transparent",
                tab.id === apiId ? "bg-secondary" : "bg-background",
              )}
              onClick={() => {
                const element = document.getElementById(tab.id);
                element?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
                updateTab({
                  ...tab,
                  isActive: true,
                });
                navigate(`/api/${tab.folderId}/${tab.id}#${tab.id}`);
              }}
            >
              <span className="py-1 w-full text-xs cursor-pointer truncate">
                {tab.name}
              </span>
              <div className="flex gap-1 justify-end items-center">
                <Button
                  className="p-0 h-auto"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTab(tab.id);
                    if (tabs.length === 1) {
                      navigate("/");
                    } else {
                      const nextTab =
                        tabs.indexOf(tab) === 0
                          ? tabs[tabs.indexOf(tab) + 1]
                          : tabs[tabs.indexOf(tab) - 1];
                      navigate(`/api/${nextTab.folderId}/${nextTab.id}`);
                    }
                  }}
                >
                  <X size={16} />
                </Button>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="mt-2.5 mr-2 ml-14" />
        <CarouselNext className="mt-2 mr-14 ml-2" />
      </Carousel>
    </div>
  );
}
