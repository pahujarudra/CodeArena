import { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import Editor from '@monaco-editor/react';

function CodeEditor({ code, setCode, language }) {
  const editorRef = useRef(null);

  // Map language names to Monaco language identifiers
  const getMonacoLanguage = (lang) => {
    const languageMap = {
      'cpp': 'cpp',
      'c++': 'cpp',
      'java': 'java',
      'python': 'python',
      'javascript': 'javascript',
      'js': 'javascript',
      'typescript': 'typescript',
      'ts': 'typescript',
      'c': 'c',
      'csharp': 'csharp',
      'c#': 'csharp'
    };
    return languageMap[lang?.toLowerCase()] || 'cpp';
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    
    // Update status on content change
    editor.onDidChangeModelContent(() => {
      const code = editor.getValue();
      const lines = code.split("\n").length;
      const statusElement = document.getElementById('editor-status');
      if (statusElement) {
        statusElement.textContent = `Lines: ${lines} | Length: ${code.length}`;
      }
    });
  };

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  return (
    <div className="code-editor-container">
      <Editor
        height="100%"
        language={getMonacoLanguage(language)}
        value={code}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          automaticLayout: true,
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          scrollbar: { 
            alwaysConsumeMouseWheel: false 
          },
          lineNumbers: 'on',
          tabSize: 4,
          insertSpaces: true,
          wordWrap: 'off',
          padding: { top: 10, bottom: 10 },
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          acceptSuggestionOnEnter: 'on',
          bracketPairColorization: { enabled: true },
          formatOnPaste: true,
          formatOnType: true,
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          autoIndent: 'full',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          folding: true,
          foldingStrategy: 'indentation',
          renderLineHighlight: 'all',
          selectionHighlight: true,
          occurrencesHighlight: 'singleFile',
          renderWhitespace: 'selection'
        }}
      />
    </div>
  );
}

CodeEditor.propTypes = {
  code: PropTypes.string.isRequired,
  setCode: PropTypes.func.isRequired,
  language: PropTypes.string.isRequired
};

export default CodeEditor;
