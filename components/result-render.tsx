"use client"

import React from "react"
import MonacoEditor from "@monaco-editor/react"
import { useTheme } from "next-themes"

import Loader from "./loader"

type PropsType = {
  result?: object
  height?: number
  readOnly?: boolean
  defaultLanguage?: "json" | "javascript"
  setData?: (value: any) => void
}

export default function ResultRender({
  result,
  height,
  readOnly,
  setData,
  defaultLanguage,
}: PropsType) {
  const { theme, systemTheme } = useTheme()

  function setEditorTheme(monaco: any) {
    monaco.editor.defineTheme("onedark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        {
          token: "comment",
          foreground: "#EF5B25",
          fontStyle: "normal",
        },
        { token: "constant", foreground: "#EF5B25" },
      ],
      colors: {
        "editor.background": "#020817",
      },
    })
  }

  const handleEditorChange = (value: any) => {
    setData && setData(value)
  }

  return (
    <MonacoEditor
      beforeMount={setEditorTheme}
      language="json"
      value={JSON.stringify(result, null, "\t")}
      options={{
        editor: {
          setTheme: {},
        },
        autoIndent: "brackets",
        copyWithSyntaxHighlighting: true,
        fontLigatures: true,
        fontSize: 14,
        wordWrap: "on",
        wrappingIndent: "deepIndent",
        wrappingStrategy: "advanced",
        foldingStrategy: "indentation",
        matchBrackets: "always",
        fontWeight: "400",
        readOnly,
        detectIndentation: true,
        minimap: {
          enabled: false,
        },
      }}
      theme={
        theme === "system" && systemTheme === "dark"
          ? "onedark"
          : theme === "dark"
          ? "onedark"
          : "light"
      }
      loading={<Loader />}
      height={height ?? 600}
      width="100%"
      className="monaco-editor-font-family h-full w-full p-0"
      defaultLanguage={defaultLanguage ?? "json"}
      onChange={handleEditorChange}
    />
  )
}
