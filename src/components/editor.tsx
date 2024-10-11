import MonacoEditor, { Monaco } from '@monaco-editor/react'
import { forwardRef, ReactElement, useEffect, useRef, useState } from 'react'
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

  // The Monaco Editor instance reference
  const editorRef = useRef<Monaco>(null)

  // Handle editor mount
  const handleEditorDidMount = (editor: Monaco) => {
    editorRef.current = editor
  }

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
      // Get the current position of the cursor
      const editor = editorRef.current
      const position = editor.getPosition()

      // Set the new content only if it has changed
      if (value !== content) {
        // setValue(value)
        setContent(value)
      }

      // Restore the cursor position to prevent jumping to the end
      setTimeout(() => {
        editor.setPosition(position)
        editor.focus() // Optionally refocus the editor
      }, 0)
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
        onMount={handleEditorDidMount}
      />
    </div>
  )
})

export default Editor
