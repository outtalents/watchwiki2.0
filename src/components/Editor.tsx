import React, { useState, useEffect } from 'react';
import { FileNode } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Edit3, Eye } from 'lucide-react';

interface EditorProps {
  file: FileNode | null;
  onUpdateContent: (id: string, content: string) => void;
}

export function Editor({ file, onUpdateContent }: EditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('preview');
  const [localContent, setLocalContent] = useState('');

  useEffect(() => {
    if (file) {
      setLocalContent(file.content || '');
      // Default to preview mode when opening a file, unless it's empty
      setMode(file.content ? 'preview' : 'edit');
    }
  }, [file?.id]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalContent(e.target.value);
    if (file) {
      onUpdateContent(file.id, e.target.value);
    }
  };

  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-950 text-gray-400 relative">
        <div className="text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 120 120"
            className="w-24 h-24 mx-auto mb-6 text-[#15517a]"
            fill="none"
            stroke="currentColor"
          >
            {/* Strap Top */}
            <path d="M 44 26 L 46 4 L 74 4 L 76 26" strokeWidth="3" strokeLinejoin="round" fill="currentColor" fillOpacity="0.05" />
            <line x1="48" y1="12" x2="72" y2="12" strokeWidth="1.5" opacity="0.3" />
            <line x1="47" y1="20" x2="73" y2="20" strokeWidth="1.5" opacity="0.3" />
            
            {/* Strap Bottom */}
            <path d="M 44 94 L 46 116 L 74 116 L 76 94" strokeWidth="3" strokeLinejoin="round" fill="currentColor" fillOpacity="0.05" />
            <line x1="48" y1="108" x2="72" y2="108" strokeWidth="1.5" opacity="0.3" />
            <line x1="47" y1="100" x2="73" y2="100" strokeWidth="1.5" opacity="0.3" />
            
            {/* Lugs */}
            <path d="M 35 38 L 32 22 L 44 26" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 85 38 L 88 22 L 76 26" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 35 82 L 32 98 L 44 94" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 85 82 L 88 98 L 76 94" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

            {/* Crown & Pushers (Chronograph style) */}
            <rect x="94" y="54" width="5" height="12" rx="1.5" strokeWidth="2.5" fill="currentColor" />
            <path d="M 86 41 L 96 34 L 99 39 L 89 46 Z" strokeWidth="2" fill="currentColor" />
            <path d="M 86 79 L 96 86 L 99 81 L 89 74 Z" strokeWidth="2" fill="currentColor" />

            {/* Case */}
            <circle cx="60" cy="60" r="36" strokeWidth="4" fill="white" className="dark:fill-gray-950" />
            
            {/* Bezel inner ring */}
            <circle cx="60" cy="60" r="31" strokeWidth="1" opacity="0.3" />
            
            {/* Tachymeter / Outer Bezel Marks */}
            <circle cx="60" cy="60" r="33.5" strokeWidth="3" strokeDasharray="1 4" opacity="0.4" />
            
            {/* Sub-dials (Chronograph) */}
            <circle cx="46" cy="60" r="7" strokeWidth="1.5" opacity="0.6" />
            <circle cx="74" cy="60" r="7" strokeWidth="1.5" opacity="0.6" />
            <circle cx="60" cy="74" r="7" strokeWidth="1.5" opacity="0.6" />
            
            {/* Sub-dial hands */}
            <line x1="46" y1="60" x2="46" y2="55" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="74" y1="60" x2="78" y2="60" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="60" y1="74" x2="56" y2="74" strokeWidth="1.5" strokeLinecap="round" />

            {/* Main Dial Indices */}
            <line x1="60" y1="32" x2="60" y2="36" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="60" y1="84" x2="60" y2="88" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="32" y1="60" x2="36" y2="60" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="84" y1="60" x2="88" y2="60" strokeWidth="2.5" strokeLinecap="round" />
            
            <line x1="40" y1="40" x2="43" y2="43" strokeWidth="2" strokeLinecap="round" />
            <line x1="80" y1="40" x2="77" y2="43" strokeWidth="2" strokeLinecap="round" />
            <line x1="40" y1="80" x2="43" y2="77" strokeWidth="2" strokeLinecap="round" />
            <line x1="80" y1="80" x2="77" y2="77" strokeWidth="2" strokeLinecap="round" />

            {/* Main Hands */}
            {/* Hour Hand */}
            <path d="M 60 60 L 56 46 L 60 40 L 64 46 Z" fill="currentColor" stroke="none" />
            {/* Minute Hand */}
            <g transform="rotate(45 60 60)">
              <path d="M 60 60 L 57 36 L 60 28 L 63 36 Z" fill="currentColor" stroke="none" />
            </g>
            {/* Chronograph Seconds Hand */}
            <line x1="60" y1="68" x2="60" y2="28" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="60" cy="38" r="1.5" fill="white" className="dark:fill-gray-950" stroke="currentColor" strokeWidth="1" />

            {/* Center Pin */}
            <circle cx="60" cy="60" r="2" fill="white" className="dark:fill-gray-950" strokeWidth="1.5" />
          </svg>
          <h2 className="text-xl font-medium text-[#15517a]">Watch Industry Knowledge Base</h2>
        </div>
        <div className="absolute bottom-8 w-full text-center">
          <p className="text-sm text-[#15517a] opacity-60">Created by 果断</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-950 h-full overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">{file.name}</h2>
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setMode('edit')}
            className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              mode === 'edit'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Edit3 size={16} className="mr-1.5" />
            Edit
          </button>
          <button
            onClick={() => setMode('preview')}
            className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              mode === 'preview'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Eye size={16} className="mr-1.5" />
            Preview
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto relative">
        {mode === 'edit' ? (
          <textarea
            value={localContent}
            onChange={handleContentChange}
            className="w-full h-full p-6 resize-none outline-none bg-transparent text-gray-800 dark:text-gray-200 font-mono text-sm leading-relaxed"
            placeholder="Start typing your markdown here..."
          />
        ) : (
          <div className="p-8 max-w-4xl mx-auto">
            <div className="prose prose-blue dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {localContent || '*Empty file*'}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
