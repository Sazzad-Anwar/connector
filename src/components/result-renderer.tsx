import copy from 'copy-to-clipboard'
import { Check, Copy } from 'lucide-react'
import { forwardRef, lazy, ReactElement, Suspense, useState } from 'react'
import { useTheme } from './theme-provider'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { toast } from './ui/use-toast'
const Editor = lazy(() => import('./editor'))

type PropsType = {
  result?: object | string | unknown[]
  height?: number
  type?: 'response' | 'input'
  readOnly?: boolean
  defaultLanguage?: 'json' | 'javascript'
  className?: string
  setData?: (data: string) => void
  loading?: ReactElement
}

const ResultRender = forwardRef<HTMLDivElement, PropsType>(
  function ResultRender(
    { result, height, readOnly, setData, className, loading }: PropsType,
    ref,
  ) {
    const { theme } = useTheme()
    const [isCopiedResponse, setIsCopiedResponse] = useState<boolean>(false)

    const copyResponse = () => {
      setIsCopiedResponse(true)
      copy(JSON.stringify(result))
      toast({
        variant: 'success',
        title: 'Success',
        description: 'Data is copied to clipboard',
      })
      setTimeout(() => {
        setIsCopiedResponse(false)
      }, 2000)
    }

    return (
      <div
        ref={ref}
        className="relative"
      >
        <Button
          type="button"
          variant="secondary"
          className="flex h-8 w-8 justify-self-end p-0 absolute right-0 top-0 z-10"
          size="sm"
          onClick={() => copyResponse()}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              {isCopiedResponse ? (
                <Check
                  className="animate__animated animate__fadeIn text-muted-foreground dark:text-foreground"
                  size={18}
                />
              ) : (
                <Copy
                  className="animate__animated animate__fadeIn text-muted-foreground dark:text-foreground"
                  size={18}
                />
              )}
            </TooltipTrigger>
            <TooltipContent align="start">
              <p>Copy data</p>
            </TooltipContent>
          </Tooltip>
        </Button>
        <Suspense fallback={loading}>
          <Editor
            ref={ref}
            loading={loading}
            height={height!}
            content={JSON.stringify(result, null, '\t')}
            setContent={setData ?? (() => null)}
            theme={theme}
            className={className}
            readOnly={readOnly}
          />
        </Suspense>
      </div>
    )
  },
)

export default ResultRender
