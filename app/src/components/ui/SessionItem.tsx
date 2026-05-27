import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Trash2, Pencil, Check, X } from 'lucide-react';

interface SessionItemProps {
  id: string;
  title: string;
  active?: boolean;
  timestamp?: number;
  onClick: () => void;
  onDelete: () => void;
  onRename: (newTitle: string) => void;
}

const SessionItem: React.FC<SessionItemProps> = ({
  title,
  active = false,
  onClick,
  onDelete,
  onRename,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const [showDelete, setShowDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue.trim()) {
      onRename(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditValue(title);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#2a2a2e]">
        <MessageSquare size={16} className="text-[#9aa0a6] flex-shrink-0" />
        <input
          ref={inputRef}
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="flex-1 bg-transparent text-sm text-[#e8eaed] outline-none min-w-0"
        />
        <button onClick={handleSave} className="p-1 rounded hover:bg-[#3c4043] text-[#81c995]">
          <Check size={14} />
        </button>
        <button
          onClick={() => { setEditValue(title); setIsEditing(false); }}
          className="p-1 rounded hover:bg-[#3c4043] text-[#f28b82]"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`
        group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer
        transition-all duration-150
        ${active ? 'bg-[#2a2a2e] border-l-2 border-l-[#8ab4f8]' : 'hover:bg-[#2a2a2e] border-l-2 border-l-transparent'}
      `}
      onClick={onClick}
    >
      <MessageSquare size={16} className="text-[#9aa0a6] flex-shrink-0" />
      <span className="flex-1 text-sm text-[#e8eaed] truncate min-w-0">{title}</span>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={e => { e.stopPropagation(); setIsEditing(true); }}
          className="p-1 rounded hover:bg-[#3c4043] text-[#9aa0a6] hover:text-[#e8eaed]"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={e => { e.stopPropagation(); setShowDelete(true); }}
          className="p-1 rounded hover:bg-[#3c4043] text-[#9aa0a6] hover:text-[#f28b82]"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {showDelete && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-[#1a1a1a] border border-[#3c4043] rounded-lg px-2 py-1 shadow-lg z-10">
          <span className="text-xs text-[#9aa0a6] whitespace-nowrap">Delete?</span>
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            className="p-1 rounded hover:bg-[#3c4043] text-[#f28b82]"
          >
            <Check size={12} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); setShowDelete(false); }}
            className="p-1 rounded hover:bg-[#3c4043] text-[#9aa0a6]"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

export default SessionItem;
