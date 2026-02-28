import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

function CodeEditor({ code, setCode, language }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    adjustHeight();
  }, [code]);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  };

  const handleKeyDown = (e) => {
    const textarea = e.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (e.key === 'Tab') {
      e.preventDefault();
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
    
    // Auto-indentation on Enter
    else if (e.key === 'Enter') {
      e.preventDefault();
      
      // Get current line
      const beforeCursor = code.substring(0, start);
      const currentLineStart = beforeCursor.lastIndexOf('\n') + 1;
      const currentLine = beforeCursor.substring(currentLineStart);
      
      // Count leading spaces/tabs for indentation
      const indentMatch = currentLine.match(/^(\s*)/);
      const currentIndent = indentMatch ? indentMatch[1] : '';
      
      // Check if current line ends with { or : (for auto-indent increase)
      const trimmedLine = currentLine.trim();
      const shouldIncreaseIndent = trimmedLine.endsWith('{') || 
                                   trimmedLine.endsWith(':') ||
                                   (language === 'python' && trimmedLine.endsWith(':'));
      
      // Calculate new indent
      let newIndent = currentIndent;
      if (shouldIncreaseIndent) {
        newIndent += '    '; // Add 4 spaces
      }
      
      // Insert new line with proper indentation
      const newCode = code.substring(0, start) + '\n' + newIndent + code.substring(end);
      setCode(newCode);
      
      setTimeout(() => {
        const newCursorPos = start + 1 + newIndent.length;
        textarea.selectionStart = textarea.selectionEnd = newCursorPos;
      }, 0);
    }
    
    // Auto-close brackets and quotes
    else if (e.key === '(' || e.key === '{' || e.key === '[' || e.key === '"' || e.key === "'") {
      const closingChar = {
        '(': ')',
        '{': '}',
        '[': ']',
        '"': '"',
        "'": "'"
      }[e.key];
      
      if (start === end) { // Only if no text is selected
        e.preventDefault();
        const newCode = code.substring(0, start) + e.key + closingChar + code.substring(end);
        setCode(newCode);
        
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1;
        }, 0);
      }
    }
    
    // Auto-close on }
    else if (e.key === '}' && code[start] === '}') {
      e.preventDefault();
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
    }
  };

  const addLineNumbers = () => {
    const lines = code.split('\n').length;
    return Array.from({ length: lines }, (_, i) => i + 1).join('\n');
  };

  return (
    <div className="code-editor-container">
      <div className="line-numbers">
        <pre>{addLineNumbers()}</pre>
      </div>
      <textarea
        ref={textareaRef}
        className="code-editor"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck="false"
        placeholder="Write your code here..."
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
