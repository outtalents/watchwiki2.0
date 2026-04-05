import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { FileNode } from './types';
import { v4 as uuidv4 } from 'uuid';

export default function App() {
  const [nodes, setNodes] = useState<FileNode[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial nodes from API
  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const response = await fetch('/api/nodes');
        if (response.ok) {
          const data = await response.json();
          setNodes(data);
        } else {
          console.error('Failed to fetch nodes from API');
        }
      } catch (error) {
        console.error('API error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNodes();
  }, []);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nodes }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save');
      }
      
      alert('发布成功！内容已保存到源码中。');
    } catch (error) {
      console.error('Publish error:', error);
      alert('发布失败，请重试。');
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

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#15517a] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

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
        className={activeFileId ? "hidden md:flex" : "flex"}
      />
      <Editor
        file={activeFile}
        onUpdateContent={handleUpdateContent}
        onBack={() => setActiveFileId(null)}
        className={!activeFileId ? "hidden md:flex" : "flex"}
      />
    </div>
  );
}
