import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { FileNode } from './types';
import { v4 as uuidv4 } from 'uuid';
import defaultNodes from './data/nodes.json';

const STORAGE_KEY = 'watch_kb_data';

export default function App() {
  const [nodes, setNodes] = useState<FileNode[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved data', e);
      }
    }
    return defaultNodes as FileNode[];
  });
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  
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
          alert('✅ 数据已成功复制到剪贴板！\n\n请在左侧代码编辑器中打开 src/data/nodes.json 文件，将内容粘贴进去并保存。\n\n这样您的修改就会永久生效，部署到 Cloudflare 后也会显示最新内容。');
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
        alert('✅ 数据已成功复制到剪贴板！\n\n请在左侧代码编辑器中打开 src/data/nodes.json 文件，将内容粘贴进去并保存。\n\n这样您的修改就会永久生效，部署到 Cloudflare 后也会显示最新内容。');
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
  };

  const handleToggleFolder = (id: string) => {
    setNodes(nodes.map(node => 
      node.id === id ? { ...node, isOpen: !node.isOpen } : node
    ));
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

    setNodes([...nodes, newNode]);
    
    if (parentId) {
      setNodes(prev => prev.map(n => n.id === parentId ? { ...n, isOpen: true } : n));
    }

    if (type === 'file') {
      setActiveFileId(newNode.id);
    }
  };

  const handleDeleteNode = (id: string) => {
    // Recursively find all children to delete
    const getChildrenIds = (nodeId: string): string[] => {
      const children = nodes.filter(n => n.parentId === nodeId);
      return [
        ...children.map(c => c.id),
        ...children.flatMap(c => getChildrenIds(c.id))
      ];
    };

    const idsToDelete = new Set([id, ...getChildrenIds(id)]);
    
    setNodes(nodes.filter(n => !idsToDelete.has(n.id)));
    
    if (activeFileId && idsToDelete.has(activeFileId)) {
      setActiveFileId(null);
    }
  };

  const handleRenameNode = (id: string, newName: string) => {
    setNodes(nodes.map(node => 
      node.id === id ? { ...node, name: newName } : node
    ));
  };

  const handleUpdateContent = (id: string, content: string) => {
    setNodes(nodes.map(node => 
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
        onPublish={handlePublish}
        isPublishing={isPublishing}
        showControls={isDev}
        className={activeFileId ? "hidden md:flex" : "flex"}
      />
      <Editor
        file={activeFile}
        onUpdateContent={handleUpdateContent}
        onBack={() => setActiveFileId(null)}
        showControls={isDev}
        className={!activeFileId ? "hidden md:flex" : "flex"}
      />
    </div>
  );
}
