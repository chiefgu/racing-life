'use client';

import { useState, useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormatting = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Set cursor position after formatting
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleBold = () => insertFormatting('**', '**');
  const handleItalic = () => insertFormatting('*', '*');
  const handleHeading = () => insertFormatting('\n## ', '\n');
  const handleList = () => insertFormatting('\n- ', '');
  const handleLink = () => insertFormatting('[', '](url)');

  return (
    <div className={`border rounded-lg ${isFocused ? 'ring-2 ring-blue-500 border-transparent' : 'border-gray-300'}`}>
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={handleBold}
          className="px-3 py-1 hover:bg-gray-200 rounded font-bold"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={handleItalic}
          className="px-3 py-1 hover:bg-gray-200 rounded italic"
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={handleHeading}
          className="px-3 py-1 hover:bg-gray-200 rounded font-semibold"
          title="Heading"
        >
          H
        </button>
        <button
          type="button"
          onClick={handleList}
          className="px-3 py-1 hover:bg-gray-200 rounded"
          title="List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={handleLink}
          className="px-3 py-1 hover:bg-gray-200 rounded"
          title="Link"
        >
          🔗
        </button>
        <div className="ml-auto text-xs text-gray-500">
          Markdown supported
        </div>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="w-full px-4 py-3 min-h-[400px] focus:outline-none resize-y"
      />
    </div>
  );
}
