import React from 'react';
import { FileNode } from '../types';
import { Search, X, ChevronRight, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../lib/utils';

interface SearchResultsProps {
  query: string;
  nodes: FileNode[];
  onSelectFile: (id: string) => void;
  onClose: () => void;
  onQueryChange: (query: string) => void;
  className?: string;
}

export function SearchResults({ query, nodes, onSelectFile, onClose, onQueryChange, className }: SearchResultsProps) {
  // Helper to get the path of a node
  const getNodePath = (nodeId: string): string[] => {
    const path: string[] = [];
    let currentId: string | null = nodeId;
    
    while (currentId) {
      const node = nodes.find(n => n.id === currentId);
      if (node) {
        path.unshift(node.name);
        currentId = node.parentId;
      } else {
        break;
      }
    }
    return path;
  };

  // Perform search
  const searchResults = React.useMemo(() => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    const results: { node: FileNode; path: string[]; matchSnippets: string[] }[] = [];
    
    nodes.forEach(node => {
      if (node.type !== 'file') return;
      
      const titleMatch = node.name.toLowerCase().includes(lowerQuery);
      const contentMatch = node.content?.toLowerCase().includes(lowerQuery);
      
      if (titleMatch || contentMatch) {
        const path = getNodePath(node.id);
        const matchSnippets: string[] = [];
        
        if (contentMatch && node.content) {
          // Extract snippets around the match
          const content = node.content;
          const lowerContent = content.toLowerCase();
          let startIndex = 0;
          let matchCount = 0;
          
          while (startIndex < lowerContent.length && matchCount < 3) {
            const index = lowerContent.indexOf(lowerQuery, startIndex);
            if (index === -1) break;
            
            // Get ~40 chars before and after
            const start = Math.max(0, index - 40);
            const end = Math.min(content.length, index + query.length + 40);
            
            let snippet = content.substring(start, end);
            if (start > 0) snippet = '...' + snippet;
            if (end < content.length) snippet = snippet + '...';
            
            matchSnippets.push(snippet);
            startIndex = index + query.length;
            matchCount++;
          }
        }
        
        results.push({ node, path, matchSnippets });
      }
    });
    
    return results;
  }, [query, nodes]);

  // Highlight keyword in text
  const highlightText = (text: string, keyword: string) => {
    if (!keyword.trim()) return text;
    
    const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === keyword.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 dark:bg-yellow-900/50 text-gray-900 dark:text-gray-100 rounded px-0.5 font-medium">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <div className={cn("flex-1 flex flex-col bg-white dark:bg-gray-950 h-full overflow-hidden", className)}>
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center flex-1 mr-4">
          <div className="relative w-full max-w-md flex items-center">
            <Search size={16} className="absolute left-3 text-[#15517a] dark:text-blue-400" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="搜索文章标题或内容..."
              className="w-full pl-9 pr-8 py-1.5 text-sm border border-[#15517a]/30 dark:border-blue-500/30 rounded-md focus:outline-none focus:ring-1 focus:ring-[#15517a] dark:focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
            />
            {query && (
              <button 
                onClick={() => onQueryChange('')}
                className="absolute right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
          title="关闭搜索"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-6 flex items-center">
            <Search size={20} className="mr-2 text-[#15517a] dark:text-blue-400" />
            搜索结果 {query ? `"${query}"` : ''}
            <span className="ml-3 text-sm font-normal text-gray-500">
              共 {searchResults.length} 条结果
            </span>
          </h2>

          {!query.trim() ? (
            <div className="text-center py-12 text-gray-500">
              请输入关键词进行搜索
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              未找到与 "{query}" 相关的结果
            </div>
          ) : (
            <div className="space-y-6">
              {searchResults.map((result, index) => (
                <div 
                  key={index} 
                  className="group cursor-pointer"
                  onClick={() => onSelectFile(result.node.id)}
                >
                  {/* Path */}
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {result.path.map((segment, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <ChevronRight size={12} className="mx-1" />}
                        <span className="hover:underline">{segment}</span>
                      </React.Fragment>
                    ))}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg font-medium text-[#15517a] dark:text-blue-400 group-hover:underline mb-1 flex items-center">
                    <FileText size={16} className="mr-1.5 opacity-70" />
                    {highlightText(result.node.name, query)}
                  </h3>
                  
                  {/* Snippets */}
                  {result.matchSnippets.length > 0 ? (
                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                      {result.matchSnippets.map((snippet, i) => (
                        <p key={i} className="line-clamp-2 leading-relaxed">
                          {highlightText(snippet, query)}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      标题匹配
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
