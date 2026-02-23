import React, { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  FileCode,
  Play,
  Save,
  Share2,
  GitBranch,
  Settings,
  ChevronRight,
  FolderOpen,
  Plus,
  MoreVertical,
  Search,
  MessageSquare,
  PanelLeft,
  PanelRight,
  X,
  Terminal,
  Bug,
  Zap,
  Copy,
  Download,
  CheckCircle2
} from 'lucide-react';
import ChatPanel from '../components/Chat/ChatPanel';
import type { ProjectFile } from '../types';

// Simple syntax highlighting component
const CodeEditor: React.FC<{
  content: string;
  language: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}> = ({ content, language, onChange, readOnly = false }) => {
  return (
    <div className="relative h-full">
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        className="w-full h-full p-4 font-mono text-sm bg-slate-950 text-slate-300 resize-none focus:outline-none"
        spellCheck={false}
        style={{
          lineHeight: '1.6',
          tabSize: 2,
        }}
      />
    </div>
  );
};

// File tree component
interface FileTreeItemProps {
  file: ProjectFile;
  depth: number;
  selectedId: string | null;
  onSelect: (file: ProjectFile) => void;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({ file, depth, selectedId, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isSelected = selectedId === file.id;
  const paddingLeft = `${depth * 12 + 12}px`;

  const getFileIcon = () => {
    if (file.isDirectory) {
      return isExpanded ? '📂' : '📁';
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    const icons: Record<string, string> = {
      ts: '🔷',
      tsx: '⚛️',
      js: '📜',
      jsx: '⚛️',
      sol: '⬡',
      py: '🐍',
      rs: '🦀',
      go: '🔵',
      json: '📋',
      md: '📝',
      css: '🎨',
      html: '🌐',
    };
    return icons[ext || ''] || '📄';
  };

  if (file.isDirectory) {
    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full flex items-center gap-2 py-1.5 pr-3 text-left hover:bg-slate-800/50 transition-colors ${
            isSelected ? 'bg-blue-500/10 text-blue-400' : 'text-slate-400'
          }`}
          style={{ paddingLeft }}
        >
          <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          <span>{getFileIcon()}</span>
          <span className="text-sm truncate">{file.name}</span>
        </button>
        {isExpanded && file.children?.map((child) => (
          <FileTreeItem
            key={child.id}
            file={child}
            depth={depth + 1}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    );
  }

  return (
    <button
      onClick={() => onSelect(file)}
      className={`w-full flex items-center gap-2 py-1.5 pr-3 text-left hover:bg-slate-800/50 transition-colors ${
        isSelected ? 'bg-blue-500/10 text-blue-400 border-r-2 border-blue-500' : 'text-slate-400'
      }`}
      style={{ paddingLeft }}
    >
      <span className="w-4" />
      <span>{getFileIcon()}</span>
      <span className="text-sm truncate">{file.name}</span>
    </button>
  );
};

const CodeWorkspace: React.FC = () => {
  const { projectId } = useParams();
  const [showChat, setShowChat] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeFileId, setActiveFileId] = useState<string | null>('1');
  const [openFiles, setOpenFiles] = useState<string[]>(['1']);
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [showConsole, setShowConsole] = useState(false);

  // Mock file structure
  const [files] = useState<ProjectFile[]>([
    {
      id: '1',
      name: 'src',
      path: '/src',
      content: '',
      language: '',
      lastModified: Date.now(),
      modifiedBy: 'user',
      version: 1,
      isDirectory: true,
      children: [
        {
          id: '2',
          name: 'components',
          path: '/src/components',
          content: '',
          language: '',
          lastModified: Date.now(),
          modifiedBy: 'user',
          version: 1,
          isDirectory: true,
          children: [
            {
              id: '3',
              name: 'Counter.tsx',
              path: '/src/components/Counter.tsx',
              content: `import React, { useState } from 'react';

interface CounterProps {
  initialValue?: number;
}

export const Counter: React.FC<CounterProps> = ({ initialValue = 0 }) => {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold">Count: {count}</h2>
      <div className="flex gap-2 mt-4">
        <button onClick={decrement} className="px-4 py-2 bg-red-500 text-white rounded">
          -
        </button>
        <button onClick={increment} className="px-4 py-2 bg-green-500 text-white rounded">
          +
        </button>
      </div>
    </div>
  );
};`,
              language: 'typescript',
              lastModified: Date.now(),
              modifiedBy: 'user',
              version: 1,
              isDirectory: false,
            },
          ],
        },
        {
          id: '4',
          name: 'App.tsx',
          path: '/src/App.tsx',
          content: `import React from 'react';
import { Counter } from './components/Counter';

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to Agent Code Hub</h1>
      <Counter initialValue={10} />
    </div>
  );
}

export default App;`,
          language: 'typescript',
          lastModified: Date.now(),
          modifiedBy: 'user',
          version: 1,
          isDirectory: false,
        },
        {
          id: '5',
          name: 'index.css',
          path: '/src/index.css',
          content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'Inter', sans-serif;
}`,
          language: 'css',
          lastModified: Date.now(),
          modifiedBy: 'user',
          version: 1,
          isDirectory: false,
        },
      ],
    },
    {
      id: '6',
      name: 'package.json',
      path: '/package.json',
      content: `{
  "name": "agent-code-hub-project",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "typescript": "^5.0.0",
    "vite": "^4.0.0"
  }
}`,
      language: 'json',
      lastModified: Date.now(),
      modifiedBy: 'user',
      version: 1,
      isDirectory: false,
    },
    {
      id: '7',
      name: 'README.md',
      path: '/README.md',
      content: `# Agent Code Hub Project

This is a collaborative coding project.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Features

- Real-time collaboration
- AI-powered code suggestions
- Integrated chat`,
      language: 'markdown',
      lastModified: Date.now(),
      modifiedBy: 'user',
      version: 1,
      isDirectory: false,
    },
  ]);

  // Flatten files for lookup
  const getFileById = useCallback((id: string, fileList: ProjectFile[] = files): ProjectFile | null => {
    for (const file of fileList) {
      if (file.id === id) return file;
      if (file.children) {
        const found = getFileById(id, file.children);
        if (found) return found;
      }
    }
    return null;
  }, [files]);

  const activeFile = activeFileId ? getFileById(activeFileId) : null;

  const handleFileSelect = (file: ProjectFile) => {
    if (file.isDirectory) return;
    setActiveFileId(file.id);
    if (!openFiles.includes(file.id)) {
      setOpenFiles([...openFiles, file.id]);
    }
  };

  const handleCloseFile = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newOpenFiles = openFiles.filter(id => id !== fileId);
    setOpenFiles(newOpenFiles);
    if (activeFileId === fileId && newOpenFiles.length > 0) {
      setActiveFileId(newOpenFiles[newOpenFiles.length - 1]);
    }
  };

  const handleContentChange = (value: string) => {
    if (activeFileId) {
      setFileContents(prev => ({ ...prev, [activeFileId]: value }));
    }
  };

  const handleRun = () => {
    setIsRunning(true);
    setShowConsole(true);
    setConsoleOutput(prev => [...prev, '> Running...', '> Build started...', '> Compiled successfully!']);
    setTimeout(() => {
      setIsRunning(false);
      setConsoleOutput(prev => [...prev, '> Ready on http://localhost:3000']);
    }, 2000);
  };

  const handleCopyCode = () => {
    if (activeFile) {
      navigator.clipboard.writeText(fileContents[activeFile.id] || activeFile.content);
    }
  };

  return (
    <div className="h-screen bg-slate-950 pt-16 flex flex-col">
      {/* Toolbar */}
      <div className="h-12 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-900/50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`p-2 rounded-lg transition-colors ${showSidebar ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white'}`}
          >
            <PanelLeft className="w-5 h-5" />
          </button>
          <div className="h-6 w-px bg-slate-800 mx-2" />
          <span className="text-sm text-slate-400">MyProject</span>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <span className="text-sm text-white">{activeFile?.name || 'Select a file'}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${isRunning ? 'animate-pulse' : ''}`} />
            <span className="text-sm">{isRunning ? 'Running...' : 'Run'}</span>
          </button>
          <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <Save className="w-4 h-4" />
          </button>
          <button 
            onClick={handleCopyCode}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
          <div className="h-6 w-px bg-slate-800 mx-2" />
          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-2 rounded-lg transition-colors ${showChat ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white'}`}
          >
            <PanelRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-64 border-r border-slate-800 bg-slate-900/30 flex flex-col">
            {/* Sidebar Header */}
            <div className="p-3 border-b border-slate-800 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">Explorer</span>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white">
                  <Plus className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white">
                  <FolderOpen className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* File Tree */}
            <div className="flex-1 overflow-y-auto py-2">
              {files.map((file) => (
                <FileTreeItem
                  key={file.id}
                  file={file}
                  depth={0}
                  selectedId={activeFileId}
                  onSelect={handleFileSelect}
                />
              ))}
            </div>
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tabs */}
          {openFiles.length > 0 && (
            <div className="flex items-center border-b border-slate-800 bg-slate-900/30 overflow-x-auto">
              {openFiles.map((fileId) => {
                const file = getFileById(fileId);
                if (!file) return null;
                const isActive = fileId === activeFileId;
                const isModified = fileContents[fileId] !== undefined && fileContents[fileId] !== file.content;

                return (
                  <button
                    key={fileId}
                    onClick={() => setActiveFileId(fileId)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm border-r border-slate-800 min-w-fit ${
                      isActive
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'
                    }`}
                  >
                    <span>{file.name}</span>
                    {isModified && <span className="w-2 h-2 rounded-full bg-blue-400" />}
                    <button
                      onClick={(e) => handleCloseFile(fileId, e)}
                      className="ml-2 p-0.5 rounded hover:bg-slate-700 text-slate-500 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </button>
                );
              })}
            </div>
          )}

          {/* Editor */}
          <div className="flex-1 flex flex-col min-h-0">
            {activeFile ? (
              <CodeEditor
                content={fileContents[activeFile.id] || activeFile.content}
                language={activeFile.language}
                onChange={handleContentChange}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <FileCode className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Select a file to start editing</p>
                </div>
              </div>
            )}

            {/* Console */}
            {showConsole && (
              <div className="h-48 border-t border-slate-800 bg-slate-950 flex flex-col">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/30">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-sm text-white">
                      <Terminal className="w-4 h-4" />
                      Terminal
                    </button>
                    <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300">
                      <Bug className="w-4 h-4" />
                      Problems
                    </button>
                    <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300">
                      <Zap className="w-4 h-4" />
                      Output
                    </button>
                  </div>
                  <button
                    onClick={() => setShowConsole(false)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 p-4 font-mono text-sm text-slate-400 overflow-y-auto">
                  {consoleOutput.map((line, i) => (
                    <div key={i} className="py-0.5">
                      {line.startsWith('>') ? (
                        <span className="text-emerald-400">{line}</span>
                      ) : (
                        line
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="w-80 border-l border-slate-800 bg-slate-900/30">
            <ChatPanel
              channelId={projectId || 'general'}
              showHeader={true}
              height="100%"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeWorkspace;
