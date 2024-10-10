import MonacoEditor, { Monaco } from '@monaco-editor/react'
import { memo, ReactElement, useEffect, useRef, useState } from 'react'
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
const Editor = ({
  theme,
  content,
  loading,
  height,
  className,
  setContent,
  readOnly,
}: Props) => {
  const [value, setValue] = useState<string>(content ?? '')

  // The Monaco Editor instance reference
  const editorRef = useRef<Monaco>(null)

  // Handle editor mount
  const handleEditorDidMount = (editor: Monaco) => {
    editorRef.current = editor
  }

  useEffect(() => {
    setValue(content ?? '{}')
  }, [content])

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !readOnly) {
        setValue(content ?? '{}')
      }
      // if (event.ctrlKey && event.key === 's') {
      //   setContent(value)
      // }
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
        setValue(value)
        setContent(value)
      }

      // Restore the cursor position to prevent jumping to the end
      setTimeout(() => {
        editor.setPosition(position)
        editor.focus() // Optionally refocus the editor
      }, 0)
    }
  }

  function setEditorTheme(monaco: Monaco) {
    monaco.editor.defineTheme('onedark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        {
          token: 'comment',
          foreground: '#1e293b',
          fontStyle: 'normal',
        },
        { token: 'constant', foreground: '#1e293b' },
      ],
      colors: {
        'editor.background': '#020817',
      },
    })
  }
  return (
    <MonacoEditor
      beforeMount={setEditorTheme}
      height={height}
      saveViewState={true}
      defaultLanguage="json"
      value={value}
      theme={
        theme === 'system' ? 'onedark' : theme === 'dark' ? 'onedark' : 'light'
      }
      className={className}
      onChange={handleEditorChange}
      options={{
        readOnly,
        wordWrap: 'on',
        automaticLayout: true,
        scrollBeyondLastLine: false,
        minimap: { enabled: false },
        renderLineHighlight: 'none',
        fastScrollSensitivity: 10,
        mouseWheelScrollSensitivity: 3,
        tabSize: 6,
        smoothScrolling: true,
      }}
      loading={loading ?? <LoadingComponent />}
      onMount={handleEditorDidMount}
    />
  )
}

export default memo(Editor)
