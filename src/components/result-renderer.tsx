import { forwardRef, useEffect, useRef, useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import { useTheme } from "./theme-provider";

type PropsType = {
  result?: object | string | any[];
  height?: number;
  readOnly?: boolean;
  defaultLanguage?: "json" | "javascript";
  className?: string;
  setData?: (value: any) => void;
};

const ResultRender = forwardRef<HTMLDivElement, PropsType>(
  function ResultRender(
    { result, height, readOnly, setData, className }: PropsType,
    ref,
  ) {
    const { theme } = useTheme();
    const editorRef = useRef<any>(null);
    const [isErrorResult, setIsErrorResult] = useState<boolean>(false);
    const [editorValue, setEditorValue] = useState<string>(
      JSON.stringify(result, null, "\t") ?? "{}",
    );

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
      });
    }

    const handleEditorChange = (value: any) => {
      setData && setData(value);
      setEditorValue(value);
    };

    useEffect(() => {
      try {
        if (typeof result === "string") {
          JSON.parse(result as string);
          setIsErrorResult(false);
        }
      } catch (error: any) {
        setIsErrorResult(true);
        setEditorValue(result as string);
      }
    }, [result]);

    useEffect(() => {
      if (editorRef.current) {
        // Store the current cursor position and selection
        const currentPosition = editorRef.current.getPosition();
        const currentSelection = editorRef.current.getSelection();

        // Update the editor value
        editorRef.current.setValue(editorValue);

        // Set the cursor position and selection back
        editorRef.current.setPosition(currentPosition);
        editorRef.current.setSelection(currentSelection);
      }
    }, [editorValue]);

    return (
      <div ref={ref}>
        <MonacoEditor
          beforeMount={setEditorTheme}
          language="json"
          value={editorValue}
          options={{
            automaticLayout: true,
            formatOnType: true,
            formatOnPaste: true,
            editor: {
              setTheme: {},
            },
            autoIndent: "brackets",
            copyWithSyntaxHighlighting: true,
            fontLigatures: true,
            fontSize: 15,
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
            theme === "system"
              ? "onedark"
              : theme === "dark"
                ? "onedark"
                : "light"
          }
          loading={<></>}
          height={height}
          width="100%"
          defaultLanguage={isErrorResult ? "html" : "json"}
          onChange={handleEditorChange}
          className={className}
        />
      </div>
    );
  },
);

export default ResultRender;
