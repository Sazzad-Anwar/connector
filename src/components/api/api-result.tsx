/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from '@/lib/utils'
import copy from 'copy-to-clipboard'
import { Check, Copy } from 'lucide-react'
import { useRef, useState } from 'react'
import Loading from '../loading'
import ResultRender from '../result-renderer'
import { Button } from '../ui/button'
import { toast } from '../ui/use-toast'
import { ResponseStatus } from './api'

type PropsType = {
  isLoading: boolean
  result: any
  height?: number
  responseStatus: ResponseStatus
}

export default function ApiResult({
  isLoading,
  result,
  height,
  responseStatus,
}: PropsType) {
  const resultDivRef = useRef<HTMLDivElement>(null)
  const resultContainerRef = useRef<HTMLDivElement>(null)
  const [isCopiedResponse, setIsCopiedResponse] = useState<boolean>(false)

  const payloadSize = (data: any): string => {
    // Convert JSON data to string
    // Convert JSON data to string
    const json_string = JSON.stringify(data)

    // Calculate length of string in bytes
    const string_length = new TextEncoder().encode(json_string).length

    // Convert payload size to KB
    const payload_size_kb = +(string_length / 1024).toFixed(2)
    return payload_size_kb > 1 ? `${payload_size_kb} KB` : `${string_length} B`
  }

  const copyResponse = () => {
    setIsCopiedResponse(true)
    copy(JSON.stringify(result))
    toast({
      variant: 'success',
      title: 'Response is copied',
    })
    setTimeout(() => {
      setIsCopiedResponse(false)
    }, 2000)
  }

  return (
    <section
      ref={resultDivRef}
      className="border-t py-1"
    >
      {isLoading && <Loading height={height! - 300} />}
      {!isLoading && result ? (
        <>
          <div className="flex items-center justify-between py-3 pl-5 pr-0 text-sm">
            <h1 className="text-base">Response</h1>
            <div className="flex items-center">
              {responseStatus?.status ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    className="mr-2 flex h-8 w-8 justify-self-end p-0"
                    size="sm"
                    onClick={() => copyResponse()}
                  >
                    {isCopiedResponse ? (
                      <Check
                        className="animate__animated animate__fadeIn"
                        size={18}
                      />
                    ) : (
                      <Copy
                        className="animate__animated animate__fadeIn"
                        size={18}
                      />
                    )}
                  </Button>
                  <p>
                    Status
                    <span
                      className={cn(
                        responseStatus.status?.toString().startsWith('2', 0)
                          ? 'ml-1 font-medium text-green-600 dark:font-normal dark:text-green-400'
                          : 'ml-1 font-medium text-red-500 dark:font-normal',
                        'mr-2',
                      )}
                    >
                      {responseStatus.status}
                    </span>
                  </p>
                  <p className="mr-4">
                    Time:
                    <span className={'pl-1 text-green-500'}>
                      {responseStatus.time}
                    </span>
                  </p>
                  <p className="mr-2">
                    Size:
                    <span className={'ml-1 text-green-500'}>
                      {payloadSize(result)}
                    </span>
                  </p>
                </>
              ) : null}
            </div>
          </div>
          <ResultRender
            ref={resultContainerRef}
            readOnly={true}
            height={height}
            type="response"
            result={result && result}
          />
        </>
      ) : null}
    </section>
  )
}
