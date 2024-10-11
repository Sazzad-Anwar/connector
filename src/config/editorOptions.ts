import { Monaco } from '@monaco-editor/react'

export const editorOptions = ({ readOnly }: { readOnly: boolean }) => {
  return {
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
  }
}

export function setEditorTheme(monaco: Monaco) {
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
