import React, { useEffect, useState, useRef } from 'react';
import type { editor } from 'monaco-editor';

interface CursorProps {
  name: string;
  color: string;
  position: { line: number; column: number };
  editor: editor.IStandaloneCodeEditor;
  selection?: { start: { line: number; column: number }; end: { line: number; column: number } };
}

const Cursor: React.FC<CursorProps> = ({
  name,
  color,
  position,
  editor,
  selection,
}) => {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const updatePosition = () => {
      if (!editor) return;

      try {
        // Get coordinates for the cursor position
        const editorCoords = editor.getScrolledVisiblePosition({
          lineNumber: position.line,
          column: position.column,
        });

        if (editorCoords) {
          const editorDom = editor.getDomNode();
          if (editorDom) {
            const editorRect = editorDom.getBoundingClientRect();
            setCoords({
              top: editorRect.top + editorCoords.top,
              left: editorRect.left + editorCoords.left,
            });
          }
        }
      } catch (err) {
        // Position might be out of view
        setCoords(null);
      }
    };

    // Use requestAnimationFrame for smooth updates
    const scheduleUpdate = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(updatePosition);
    };

    // Initial position
    scheduleUpdate();

    // Update on scroll
    const disposable = editor.onDidScrollChange(scheduleUpdate);

    return () => {
      disposable.dispose();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [editor, position]);

  if (!coords) return null;

  return (
    <div
      className="absolute pointer-events-none z-50 transition-all duration-150 ease-out"
      style={{
        top: coords.top,
        left: coords.left,
      }}
    >
      {/* Cursor line */}
      <div
        className="w-0.5 h-5 transition-all duration-150"
        style={{ backgroundColor: color }}
      />
      
      {/* Cursor label */}
      <div
        className="absolute -top-6 left-0 px-2 py-0.5 rounded text-xs font-medium text-white whitespace-nowrap transition-all duration-150"
        style={{ backgroundColor: color }}
      >
        {name}
        {/* Arrow */}
        <div
          className="absolute bottom-0 left-2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px]"
          style={{ borderTopColor: color, transform: 'translateY(100%)' }}
        />
      </div>

      {/* Selection highlight */}
      {selection && selection.start.line !== selection.end.line && (
        <SelectionHighlight
          editor={editor}
          selection={selection}
          color={color}
        />
      )}
    </div>
  );
};

// Selection highlight component
interface SelectionHighlightProps {
  editor: editor.IStandaloneCodeEditor;
  selection: { start: { line: number; column: number }; end: { line: number; column: number } };
  color: string;
}

const SelectionHighlight: React.FC<SelectionHighlightProps> = ({
  editor,
  selection,
  color,
}) => {
  const [rects, setRects] = useState<Array<{ top: number; left: number; width: number; height: number }>>([]);

  useEffect(() => {
    const calculateRects = () => {
      const newRects: Array<{ top: number; left: number; width: number; height: number }> = [];
      
      for (let line = selection.start.line; line <= selection.end.line; line++) {
        try {
          const startColumn = line === selection.start.line ? selection.start.column : 1;
          const endColumn = line === selection.end.line ? selection.end.column : 1000; // Approximate

          const startCoords = editor.getScrolledVisiblePosition({
            lineNumber: line,
            column: startColumn,
          });

          const endCoords = editor.getScrolledVisiblePosition({
            lineNumber: line,
            column: endColumn,
          });

          if (startCoords && endCoords) {
            const editorDom = editor.getDomNode();
            if (editorDom) {
              const editorRect = editorDom.getBoundingClientRect();
              newRects.push({
                top: editorRect.top + startCoords.top,
                left: editorRect.left + startCoords.left,
                width: Math.max(0, endCoords.left - startCoords.left),
                height: startCoords.height,
              });
            }
          }
        } catch (err) {
          // Line might be out of view
        }
      }

      setRects(newRects);
    };

    calculateRects();

    const disposable = editor.onDidScrollChange(calculateRects);
    return () => disposable.dispose();
  }, [editor, selection]);

  return (
    <>
      {rects.map((rect, index) => (
        <div
          key={index}
          className="absolute pointer-events-none"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            backgroundColor: `${color}33`, // 20% opacity
          }}
        />
      ))}
    </>
  );
};

export default Cursor;