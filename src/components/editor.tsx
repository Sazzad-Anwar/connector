import MonacoEditor from '@monaco-editor/react'
import { forwardRef, ReactElement, useEffect, useState } from 'react'
import { editorOptions, setEditorTheme } from '../config/editorOptions'
import LoadingComponent from './loading'
type Props = {
  theme: 'dark' | 'light' | 'system'
  height: number
  loading?: ReactElement
  content: string
  setContent: (value: string) => void
  className?: string
  readOnly?: boolean
}
const Editor = forwardRef<HTMLDivElement, Props>(function Editor(
  { theme, content, loading, height, className, setContent, readOnly }: Props,
  ref,
) {
  const [value, setValue] = useState<string>(content ?? '{}')

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !readOnly) {
        setValue(content ?? '{}')
      }
    }

    // Add the event listener when the component mounts
    document.addEventListener('keydown', handleKeyPress)
    // Remove the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [content])

  // Function to handle content change
  const handleEditorChange = (value: string | undefined) => {
    if (value) {
      // Set the new content only if it has changed
      if (value !== content) {
        setValue(value)
        setContent(value)
      }
    }
  }

  return (
    <div ref={ref}>
      <MonacoEditor
        beforeMount={setEditorTheme}
        height={height}
        saveViewState={true}
        defaultLanguage="json"
        value={value}
        theme={
          theme === 'system'
            ? 'onedark'
            : theme === 'dark'
            ? 'onedark'
            : 'light'
        }
        className={className}
        onChange={handleEditorChange}
        options={editorOptions({ readOnly: readOnly ?? false })}
        loading={loading ?? <LoadingComponent />}
      />
    </div>
  )
})

export default Editor
