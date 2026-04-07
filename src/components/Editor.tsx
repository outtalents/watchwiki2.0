import React, { useState, useEffect, useRef } from 'react';
import { FileNode } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Edit3, Eye, ArrowLeft, Save, Search,
  Bold, Italic, Heading1, Heading2, Heading3, 
  List, ListOrdered, Quote, Code, Link as LinkIcon
} from 'lucide-react';
import { cn } from '../lib/utils';

interface EditorProps {
  file: FileNode | null;
  onUpdateContent: (id: string, content: string) => void;
  onBack?: () => void;
  onPublish?: () => void;
  onSearchClick?: () => void;
  isPublishing?: boolean;
  showControls?: boolean;
  className?: string;
}

export function Editor({ file, onUpdateContent, onBack, onPublish, onSearchClick, isPublishing, showControls = true, className }: EditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('preview');
  const [localContent, setLocalContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (file) {
      setLocalContent(file.content || '');
      // Default to preview mode when opening a file, unless it's empty
      setMode(showControls && !file.content ? 'edit' : 'preview');
    }
  }, [file?.id, showControls]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalContent(e.target.value);
    if (file) {
      onUpdateContent(file.id, e.target.value);
    }
  };

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);

    setLocalContent(newText);
    if (file) {
      onUpdateContent(file.id, newText);
    }

    // Focus back and set selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        end + before.length
      );
    }, 0);
  };

  if (!file) {
    return (
      <div className={cn("flex-1 flex items-center justify-center bg-white dark:bg-gray-950 text-gray-400 relative", className)}>
        <div className="absolute top-4 right-4 md:top-6 md:right-6">
          <button
            onClick={onSearchClick}
            className="flex items-center w-48 md:w-64 px-3 py-1.5 text-sm border border-[#15517a]/30 dark:border-blue-500/30 rounded-md text-gray-500 hover:border-[#15517a] dark:hover:border-blue-500 transition-colors bg-white dark:bg-gray-900"
          >
            <Search size={16} className="mr-2 text-[#15517a] dark:text-blue-400" />
            搜索文章...
          </button>
        </div>
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
          <p className="text-sm text-[#15517a] opacity-60">Created by 果断 © 2026</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex-1 flex flex-col bg-white dark:bg-gray-950 h-full overflow-hidden", className)}>
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center min-w-0 flex-1 mr-4">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden mr-2 p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md flex-shrink-0"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 truncate">{file.name}</h2>
        </div>
        {showControls && (
          <div className="flex items-center space-x-2">
            <button
              onClick={onSearchClick}
              className="flex items-center md:w-48 px-2 md:px-3 py-1.5 text-sm border border-[#15517a]/30 dark:border-blue-500/30 rounded-md text-gray-500 hover:border-[#15517a] dark:hover:border-blue-500 transition-colors bg-white dark:bg-gray-900 md:mr-2"
              title="搜索"
            >
              <Search size={16} className="text-[#15517a] dark:text-blue-400 md:mr-2" />
              <span className="hidden md:inline">搜索...</span>
            </button>
            {onPublish && (
              <button
                onClick={onPublish}
                disabled={isPublishing}
                className="flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-[#15517a] text-white hover:bg-[#1a6294] transition-colors disabled:opacity-50"
                title="Save all changes and copy to clipboard"
              >
                {isPublishing ? (
                  <div className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin mr-1.5"></div>
                ) : (
                  <Save size={16} className="mr-1.5" />
                )}
                保存并复制数据
              </button>
            )}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex-shrink-0">
              <button
                onClick={() => setMode('edit')}
                className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  mode === 'edit'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Edit3 size={16} className="mr-1.5" />
                编辑
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
                预览
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col min-h-0 relative">
        {mode === 'edit' && showControls ? (
          <>
            <div className="flex-shrink-0 flex items-center space-x-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 overflow-x-auto no-scrollbar">
              <button onClick={() => insertText('**', '**')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded text-gray-600 dark:text-gray-400" title="加粗"><Bold size={16} /></button>
              <button onClick={() => insertText('*', '*')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded text-gray-600 dark:text-gray-400" title="斜体"><Italic size={16} /></button>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-1" />
              <button onClick={() => insertText('# ')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded text-gray-600 dark:text-gray-400" title="一级标题"><Heading1 size={16} /></button>
              <button onClick={() => insertText('## ')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded text-gray-600 dark:text-gray-400" title="二级标题"><Heading2 size={16} /></button>
              <button onClick={() => insertText('### ')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded text-gray-600 dark:text-gray-400" title="三级标题"><Heading3 size={16} /></button>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-1" />
              <button onClick={() => insertText('- ')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded text-gray-600 dark:text-gray-400" title="无序列表"><List size={16} /></button>
              <button onClick={() => insertText('1. ')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded text-gray-600 dark:text-gray-400" title="有序列表"><ListOrdered size={16} /></button>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-1" />
              <button onClick={() => insertText('> ')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded text-gray-600 dark:text-gray-400" title="引用"><Quote size={16} /></button>
              <button onClick={() => insertText('`', '`')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded text-gray-600 dark:text-gray-400" title="代码"><Code size={16} /></button>
              <button onClick={() => insertText('[', '](url)')} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded text-gray-600 dark:text-gray-400" title="链接"><LinkIcon size={16} /></button>
            </div>
            <textarea
              ref={textareaRef}
              value={localContent}
              onChange={handleContentChange}
              className="flex-1 p-6 resize-none outline-none bg-transparent text-gray-800 dark:text-gray-200 font-mono text-sm leading-relaxed overflow-y-auto"
              placeholder="Start typing your markdown here..."
            />
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto prose prose-blue dark:prose-invert">
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
