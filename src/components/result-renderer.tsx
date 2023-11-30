/* eslint-disable @typescript-eslint/no-explicit-any */
import MonacoEditor from '@monaco-editor/react'
import copy from 'copy-to-clipboard'
import { Check, Copy } from 'lucide-react'
import { forwardRef, useEffect, useRef, useState } from 'react'
import { useTheme } from './theme-provider'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { toast } from './ui/use-toast'

type PropsType = {
  result?: object | string | any[]
  height?: number
  type?: 'response' | 'input'
  readOnly?: boolean
  defaultLanguage?: 'json' | 'javascript'
  className?: string
  setData?: (value: any) => void
}

const ResultRender = forwardRef<HTMLDivElement, PropsType>(
  function ResultRender(
    { result, height, readOnly, setData, className, type = 'input' }: PropsType,
    ref,
  ) {
    const { theme } = useTheme()
    const editorRef = useRef<any>(null)
    const [isCopiedResponse, setIsCopiedResponse] = useState<boolean>(false)
    const [isErrorResult, setIsErrorResult] = useState<boolean>(false)
    const [editorValue, setEditorValue] = useState<string>(
      JSON.stringify(result, null, '\t') ?? '{}',
    )

    function setEditorTheme(monaco: any) {
      monaco.editor.defineTheme('onedark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          {
            token: 'comment',
            foreground: '#EF5B25',
            fontStyle: 'normal',
          },
          { token: 'constant', foreground: '#EF5B25' },
        ],
        colors: {
          'editor.background': '#020817',
        },
      })
    }

    const handleEditorChange = (value: any) => {
      setData && setData(value)
      setEditorValue(value)
    }

    useEffect(() => {
      const handleEscapeKeyPress = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          // Handle the "Escape" key press here
          // form.setValue('jsonBody', api?.jsonBody)
          setEditorValue(JSON.stringify(result, null, '\t') ?? '{}')
        }
      }

      // Add the event listener when the component mounts
      document.addEventListener('keydown', handleEscapeKeyPress)
      // Remove the event listener when the component unmounts
      return () => {
        document.removeEventListener('keydown', handleEscapeKeyPress)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
      if (type === 'response') {
        setEditorValue(JSON.stringify(result, null, '\t') ?? '{}')
      }
    }, [type, result])

    useEffect(() => {
      try {
        if (typeof result === 'string') {
          JSON.parse(result as string)
          setIsErrorResult(false)
        }
      } catch (error: any) {
        setIsErrorResult(true)
        setEditorValue(result as string)
      }
    }, [result])

    useEffect(() => {
      if (editorRef.current) {
        // Store the current cursor position and selection
        const currentPosition = editorRef.current.getPosition()
        const currentSelection = editorRef.current.getSelection()

        // Update the editor value
        editorRef.current.setValue(editorValue)

        // Set the cursor position and selection back
        editorRef.current.setPosition(currentPosition)
        editorRef.current.setSelection(currentSelection)
      }
    }, [editorValue])

    const copyResponse = () => {
      setIsCopiedResponse(true)
      copy(JSON.stringify(result))
      toast({
        variant: 'success',
        title: 'Data is copied',
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
          variant="ghost"
          className="mr-2 flex h-8 w-8 justify-self-end p-0 absolute right-0 top-0 z-10"
          size="sm"
          onClick={() => copyResponse()}
        >
          <Tooltip>
            <TooltipTrigger asChild>
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
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy data</p>
            </TooltipContent>
          </Tooltip>
        </Button>
        <MonacoEditor
          beforeMount={setEditorTheme}
          language={isErrorResult ? 'text' : 'json'}
          value={editorValue}
          options={{
            automaticLayout: true,
            formatOnType: true,
            formatOnPaste: true,
            editor: {
              setTheme: {},
            },
            tabSize: 8,
            autoIndent: 'brackets',
            copyWithSyntaxHighlighting: true,
            fontLigatures: true,
            fontSize: 15,
            wordWrap: 'on',
            wordBreak: 'normal',
            wrappingIndent: 'indent',
            wrappingStrategy: 'advanced',
            foldingStrategy: 'indentation',
            matchBrackets: 'always',
            fontWeight: '400',
            readOnly,
            detectIndentation: true,
            minimap: {
              enabled: false,
            },
          }}
          theme={
            theme === 'system'
              ? 'onedark'
              : theme === 'dark'
              ? 'onedark'
              : 'light'
          }
          loading={<></>}
          height={height ?? window.innerHeight - 320}
          width="100%"
          defaultLanguage={isErrorResult ? 'html' : 'json'}
          onChange={handleEditorChange}
          className={className}
        />
      </div>
    )
  },
)

export default ResultRender
