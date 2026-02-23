import React, { useRef, useEffect, useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useAgent } from '../../contexts/AgentContext';
import type { InlineComment, Presence } from '../../types';
import Cursor from '../Collaboration/Cursor';

interface CodeEditorProps {
  value: string;
  language: string;
  onChange?: (value: string) => void;
  onCursorMove?: (position: { line: number; column: number }) => void;
  onSelectionChange?: (selection: { start: { line: number; column: number }; end: { line: number; column: number } }) => void;
  onAddComment?: (line: number, content: string) => void;
  comments?: InlineComment[];
  readOnly?: boolean;
  height?: string;
  fileId?: string;
  showMinimap?: boolean;
  showLineNumbers?: boolean;
  fontSize?: number;
  theme?: 'vs-dark' | 'light' | 'hc-black';
}

const languageMap: Record<string, string> = {
  solidity: 'sol',
  typescript: 'typescript',
  javascript: 'javascript',
  python: 'python',
  rust: 'rust',
  go: 'go',
  java: 'java',
  cpp: 'cpp',
  html: 'html',
  css: 'css',
  json: 'json',
  yaml: 'yaml',
  markdown: 'markdown',
  sql: 'sql',
};

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  language,
  onChange,
  onCursorMove,
  onSelectionChange,
  onAddComment,
  comments = [],
  readOnly = false,
  height = '100%',
  fileId,
  showMinimap = true,
  showLineNumbers = true,
  fontSize = 14,
  theme = 'vs-dark',
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null);
  const { presence } = useAgent();
  const [activeCommentLine, setActiveCommentLine] = useState<number | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [decorations, setDecorations] = useState<string[]>([]);

  // Get Monaco language
  const monacoLanguage = languageMap[language.toLowerCase()] || 'plaintext';

  // Handle editor mount
  const handleEditorDidMount = useCallback((editor: editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure Monaco
    monaco.editor.defineTheme('agent-code-hub', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0f172a',
        'editor.lineHighlightBackground': '#1e293b',
        'editorLineNumber.foreground': '#64748b',
        'editorLineNumber.activeForeground': '#94a3b8',
        'editor.selectionBackground': '#3b82f680',
        'editor.inactiveSelectionBackground': '#3b82f640',
      },
    });

    monaco.editor.setTheme('agent-code-hub');

    // Configure Solidity language
    if (monacoLanguage === 'sol') {
      monaco.languages.register({ id: 'sol' });
      monaco.languages.setMonarchTokensProvider('sol', {
        tokenizer: {
          root: [
            [/\b(pragma|import|contract|library|interface|function|modifier|event|struct|enum|mapping|address|uint|int|bool|string|bytes|storage|memory|calldata|public|private|internal|external|pure|view|payable|constant|immutable|override|virtual|abstract|constructor|fallback|receive|selfdestruct|block|msg|tx|now|assert|require|revert|keccak256|sha256|ripemd160|ecrecover|addmod|mulmod|this|super|emit|return|returns|if|else|for|while|do|break|continue|throw|try|catch|finally|new|delete)\b/, 'keyword'],
            [/\b([0-9]+)\b/, 'number'],
            [/"([^"]*)"/, 'string'],
            [/'([^']*)'/, 'string'],
            [/(\/\/.*$)/, 'comment'],
            [/(\/\*[\s\S]*?\*\/)/, 'comment'],
          ],
        },
      });
    }

    // Cursor position change
    editor.onDidChangeCursorPosition((e) => {
      onCursorMove?.({
        line: e.position.lineNumber,
        column: e.position.column,
      });
    });

    // Selection change
    editor.onDidChangeCursorSelection((e) => {
      onSelectionChange?.({
        start: {
          line: e.selection.startLineNumber,
          column: e.selection.startColumn,
        },
        end: {
          line: e.selection.endLineNumber,
          column: e.selection.endColumn,
        },
      });
    });

    // Add comment on line number click
    editor.onMouseDown((e) => {
      if (e.target.type === monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS) {
        const line = e.target.position?.lineNumber;
        if (line) {
          setActiveCommentLine(line);
        }
      }
    });
  }, [monacoLanguage, onCursorMove, onSelectionChange]);

  // Update decorations for comments
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const newDecorations = comments.map((comment) => ({
      range: new monacoRef.current!.Range(comment.line, 1, comment.line, 1),
      options: {
        isWholeLine: true,
        className: 'comment-line-decoration',
        glyphMarginClassName: 'comment-glyph',
        overviewRuler: {
          color: '#3b82f6',
          position: monacoRef.current!.editor.OverviewRulerLane.Full,
        },
      },
    }));

    const decorationIds = editorRef.current.deltaDecorations(decorations, newDecorations);
    setDecorations(decorationIds);
  }, [comments]);

  // Handle comment submit
  const handleSubmitComment = () => {
    if (activeCommentLine && commentInput.trim() && onAddComment) {
      onAddComment(activeCommentLine, commentInput);
      setCommentInput('');
      setActiveCommentLine(null);
    }
  };

  // Get cursor decorations for other agents
  const renderRemoteCursors = () => {
    if (!editorRef.current) return null;

    const remotePresence = Array.from(presence.values()).filter(
      (p) => p.currentFile === fileId && p.cursorPosition
    );

    return remotePresence.map((p) => (
      <Cursor
        key={p.agentId}
        name={p.agentName}
        color={getAgentColor(p.agentId)}
        position={p.cursorPosition!}
        editor={editorRef.current!}
      />
    ));
  };

  // Generate consistent color for agent
  const getAgentColor = (agentId: string): string => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
    let hash = 0;
    for (let i = 0; i < agentId.length; i++) {
      hash = agentId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="relative h-full">
      <Editor
        height={height}
        language={monacoLanguage}
        value={value}
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          minimap: { enabled: showMinimap },
          lineNumbers: showLineNumbers ? 'on' : 'off',
          fontSize,
          fontFamily: 'JetBrains Mono, Fira Code, monospace',
          fontLigatures: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: true,
          renderWhitespace: 'selection',
          formatOnPaste: true,
          formatOnType: true,
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          tabSize: 2,
          insertSpaces: true,
          folding: true,
          foldingStrategy: 'indentation',
          showFoldingControls: 'mouseover',
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          glyphMargin: true,
        }}
        theme="agent-code-hub"
        loading={
          <div className="flex items-center justify-center h-full text-slate-500">
            Loading editor...
          </div>
        }
      />

      {/* Remote cursors */}
      {renderRemoteCursors()}

      {/* Comment input overlay */}
      {activeCommentLine && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="bg-slate-900 rounded-xl border border-slate-700 p-4 w-full max-w-md">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-white">Add comment on line {activeCommentLine}</h4>
              <button
                onClick={() => setActiveCommentLine(null)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <textarea
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Write a comment..."
              className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white placeholder-slate-500 border border-slate-700 focus:outline-none focus:border-blue-500 resize-none"
              rows={3}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setActiveCommentLine(null)}
                className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitComment}
                disabled={!commentInput.trim()}
                className="px-4 py-2 rounded-lg text-sm bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                Add Comment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS for decorations */}
      <style>{`
        .comment-line-decoration {
          background-color: rgba(59, 130, 246, 0.1);
        }
        .comment-glyph {
          background-color: #3b82f6;
          border-radius: 50%;
          width: 8px;
          height: 8px;
          margin-left: 5px;
        }
      `}</style>
    </div>
  );
};

export default CodeEditor;