import React, { useState } from 'react';
import { FileNode } from '../types';
import { ChevronRight, ChevronDown, FileText, Folder, Plus, FolderPlus, Trash2, Edit2, Check, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  nodes: FileNode[];
  activeFileId: string | null;
  onSelectFile: (id: string) => void;
  onToggleFolder: (id: string) => void;
  onAddNode: (parentId: string | null, type: 'file' | 'folder') => void;
  onDeleteNode: (id: string) => void;
  onRenameNode: (id: string, newName: string) => void;
}

export function Sidebar({
  nodes,
  activeFileId,
  onSelectFile,
  onToggleFolder,
  onAddNode,
  onDeleteNode,
  onRenameNode,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleRenameStart = (e: React.MouseEvent, node: FileNode) => {
    e.stopPropagation();
    setEditingId(node.id);
    setEditName(node.name);
  };

  const handleRenameSubmit = (id: string) => {
    if (editName.trim()) {
      onRenameNode(id, editName.trim());
    }
    setEditingId(null);
  };

  const handleRenameCancel = () => {
    setEditingId(null);
  };

  const renderNode = (node: FileNode, level: number = 0) => {
    const children = nodes.filter((n) => n.parentId === node.id);
    const isFolder = node.type === 'folder';
    const isOpen = node.isOpen;
    const isActive = activeFileId === node.id;
    const isEditing = editingId === node.id;

    return (
      <div key={node.id} className="select-none">
        <div
          className={cn(
            "group flex items-center py-1 px-2 hover:bg-white/10 cursor-pointer text-sm rounded-md mx-1 my-0.5",
            isActive ? "bg-white/20 text-white" : "text-white/80",
            level > 0 && "ml-4"
          )}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => isFolder ? onToggleFolder(node.id) : onSelectFile(node.id)}
        >
          <div className="flex items-center flex-1 min-w-0">
            {isFolder ? (
              <span className="mr-1 text-white/60">
                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </span>
            ) : (
              <span className="mr-1 ml-4 text-white/60">
                <FileText size={14} />
              </span>
            )}
            
            {isEditing ? (
              <div className="flex items-center flex-1" onClick={e => e.stopPropagation()}>
                <input
                  autoFocus
                  className="flex-1 bg-[#15517a] text-white border border-white/30 rounded px-1 text-sm outline-none w-full"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameSubmit(node.id);
                    if (e.key === 'Escape') handleRenameCancel();
                  }}
                />
                <button onClick={() => handleRenameSubmit(node.id)} className="ml-1 text-green-400 hover:text-green-300"><Check size={14} /></button>
                <button onClick={handleRenameCancel} className="ml-1 text-red-400 hover:text-red-300"><X size={14} /></button>
              </div>
            ) : (
              <span className="truncate flex-1">{node.name}</span>
            )}
          </div>

          {!isEditing && (
            <div className="hidden group-hover:flex items-center space-x-1 ml-2">
              {isFolder && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); onAddNode(node.id, 'file'); }}
                    className="p-1 text-white/60 hover:text-white rounded"
                    title="New File"
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onAddNode(node.id, 'folder'); }}
                    className="p-1 text-white/60 hover:text-white rounded"
                    title="New Folder"
                  >
                    <FolderPlus size={14} />
                  </button>
                </>
              )}
              <button
                onClick={(e) => handleRenameStart(e, node)}
                className="p-1 text-white/60 hover:text-white rounded"
                title="Rename"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteNode(node.id); }}
                className="p-1 text-white/60 hover:text-red-400 rounded"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
        
        {isFolder && isOpen && (
          <div>
            {children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootNodes = nodes.filter(n => n.parentId === null);

  return (
    <div className="w-64 flex-shrink-0 bg-[#15517a] text-white border-none flex flex-col h-full">
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#15517a]">
        <h1 className="font-semibold text-white truncate">手表行业知识库</h1>
        <div className="flex space-x-1">
          <button
            onClick={() => onAddNode(null, 'file')}
            className="p-1.5 text-white/70 hover:bg-white/10 hover:text-white rounded-md"
            title="New Root File"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => onAddNode(null, 'folder')}
            className="p-1.5 text-white/70 hover:bg-white/10 hover:text-white rounded-md"
            title="New Root Folder"
          >
            <FolderPlus size={16} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-2 bg-[#15517a] text-white border-none">
        {rootNodes.map(node => renderNode(node, 0))}
        {rootNodes.length === 0 && (
          <div className="text-center text-sm text-white/50 mt-10">
            No files yet. Create one!
          </div>
        )}
      </div>
    </div>
  );
}
