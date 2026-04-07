import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { SearchResults } from './components/SearchResults';
import { FileNode } from './types';
import { v4 as uuidv4 } from 'uuid';
import defaultNodes from './data/nodes.json';

const STORAGE_KEY = 'watch_kb_data';

export default function App() {
  const [nodes, setNodes] = useState<FileNode[]>(() => {
    let initialNodes = defaultNodes as FileNode[];
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        initialNodes = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved data', e);
      }
    }
    
    // 默认只展开根目录，其他所有层级的文件夹默认收起
    return initialNodes.map(node => {
      if (node.type === 'folder') {
        return { ...node, isOpen: node.id === 'root' };
      }
      return node;
    });
  });
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const isDev = import.meta.env.DEV;

  useEffect(() => {
    if (nodes.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
    }
  }, [nodes]);

  const handlePublish = async () => {
    setIsPublishing(true);
    const jsonStr = JSON.stringify(nodes, null, 2);
    
    const fallbackCopyTextToClipboard = (text: string) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          alert('✅ 数据已成功复制到剪贴板！\n\n数据包含：所有的目录结构和文件内容。\n\n请在左侧代码编辑器中打开 src/data/nodes.json 文件，将内容粘贴进去并保存。\n\n这样您的修改就会永久生效，部署到 Cloudflare 后也会显示最新内容。');
        } else {
          throw new Error('Fallback copy failed');
        }
      } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
        alert('复制失败，请在控制台(Console)中查看并手动复制数据。');
        console.log(text);
      }
      document.body.removeChild(textArea);
    };

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(jsonStr);
        alert('✅ 数据已成功复制到剪贴板！\n\n数据包含：所有的目录结构和文件内容。\n\n请在左侧代码编辑器中打开 src/data/nodes.json 文件，将内容粘贴进去并保存。\n\n这样您的修改就会永久生效，部署到 Cloudflare 后也会显示最新内容。');
      } else {
        fallbackCopyTextToClipboard(jsonStr);
      }
    } catch (error) {
      console.error('Publish error:', error);
      fallbackCopyTextToClipboard(jsonStr);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSelectFile = (id: string) => {
    setActiveFileId(id);
    setIsSearching(false);
  };

  const handleToggleFolder = (id: string) => {
    setNodes(prev => prev.map(node => 
      node.id === id ? { ...node, isOpen: !node.isOpen } : node
    ));
  };

  const handleGoHome = () => {
    setActiveFileId(null);
    setIsSearching(false);
    setSearchQuery('');
    // Reset all folders except root to closed
    setNodes(prev => prev.map(node => {
      if (node.type === 'folder') {
        return { ...node, isOpen: node.id === 'root' };
      }
      return node;
    }));
  };

  const handleAddNode = (parentId: string | null, type: 'file' | 'folder') => {
    const newNode: FileNode = {
      id: uuidv4(),
      name: type === 'file' ? 'Untitled' : 'New Folder',
      type,
      parentId,
      content: type === 'file' ? '# Untitled\n\nStart typing...' : undefined,
      isOpen: type === 'folder' ? true : undefined,
    };

    setNodes(prev => [...prev, newNode]);
    
    if (parentId) {
      setNodes(prev => prev.map(n => n.id === parentId ? { ...n, isOpen: true } : n));
    }

    if (type === 'file') {
      setActiveFileId(newNode.id);
    }
  };

  const handleDeleteNode = (id: string) => {
    setNodes(prev => {
      // Recursively find all children to delete
      const getChildrenIds = (nodeId: string): string[] => {
        const children = prev.filter(n => n.parentId === nodeId);
        return [
          ...children.map(c => c.id),
          ...children.flatMap(c => getChildrenIds(c.id))
        ];
      };

      const idsToDelete = new Set([id, ...getChildrenIds(id)]);
      
      if (activeFileId && idsToDelete.has(activeFileId)) {
        setActiveFileId(null);
      }

      return prev.filter(n => !idsToDelete.has(n.id));
    });
  };

  const handleRenameNode = (id: string, newName: string) => {
    setNodes(prev => prev.map(node => 
      node.id === id ? { ...node, name: newName } : node
    ));
  };

  const handleReorderNode = (sourceId: string, targetId: string) => {
    setNodes(prev => {
      const sourceIndex = prev.findIndex(n => n.id === sourceId);
      const targetIndex = prev.findIndex(n => n.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) return prev;

      const sourceNode = prev[sourceIndex];
      const targetNode = prev[targetIndex];

      // Only allow reordering within the same parent
      if (sourceNode.parentId !== targetNode.parentId) return prev;

      const newNodes = [...prev];
      newNodes.splice(sourceIndex, 1);
      
      const newTargetIndex = newNodes.findIndex(n => n.id === targetId);
      const insertIndex = sourceIndex < targetIndex ? newTargetIndex + 1 : newTargetIndex;
      
      newNodes.splice(insertIndex, 0, sourceNode);
      
      return newNodes;
    });
  };

  const handleUpdateContent = (id: string, content: string) => {
    setNodes(prev => prev.map(node => 
      node.id === id ? { ...node, content } : node
    ));
  };

  const activeFile = nodes.find(n => n.id === activeFileId) || null;

  return (
    <div className="flex h-screen w-full bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans overflow-hidden">
      <Sidebar
        nodes={nodes}
        activeFileId={activeFileId}
        onSelectFile={handleSelectFile}
        onToggleFolder={handleToggleFolder}
        onAddNode={handleAddNode}
        onDeleteNode={handleDeleteNode}
        onRenameNode={handleRenameNode}
        onReorderNode={handleReorderNode}
        onPublish={handlePublish}
        onGoHome={handleGoHome}
        onSearchClick={() => setIsSearching(true)}
        isPublishing={isPublishing}
        showControls={isDev}
        className={activeFileId || isSearching ? "hidden md:flex" : "flex"}
      />
      {isSearching ? (
        <SearchResults
          query={searchQuery}
          nodes={nodes}
          onSelectFile={handleSelectFile}
          onClose={() => setIsSearching(false)}
          onQueryChange={setSearchQuery}
          className={!activeFileId && !isSearching ? "hidden md:flex" : "flex"}
        />
      ) : (
        <Editor
          file={activeFile}
          onUpdateContent={handleUpdateContent}
          onBack={() => setActiveFileId(null)}
          onPublish={handlePublish}
          onSearchClick={() => setIsSearching(true)}
          isPublishing={isPublishing}
          showControls={isDev}
          className={!activeFileId ? "hidden md:flex" : "flex"}
        />
      )}
    </div>
  );
}
