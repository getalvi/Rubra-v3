import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, Pencil, Trash2, Check, X, MessageSquare } from 'lucide-react';

interface SessionItemProps {
  id: string;
  title: string;
  active: boolean;
  timestamp: number;
  onClick: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
}

const SessionItem: React.FC<SessionItemProps> = ({
  title,
  active,
  onClick,
  onDelete,
  onRename,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleRename = () => {
    if (editValue.trim() && editValue !== title) {
      onRename(editValue.trim());
    }
    setEditing(false);
    setMenuOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRename();
    if (e.key === 'Escape') {
      setEditValue(title);
      setEditing(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4, transition: { duration: 0.15 } }}
      className={`
        group relative flex items-center gap-2 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-lg
        cursor-pointer transition-colors duration-150
        ${active ? 'bg-[#2a2a2e]' : 'hover:bg-[#1e1e20]'}
      `}
      onClick={editing ? undefined : onClick}
    >
      <MessageSquare
        size={14}
        className={`flex-shrink-0 ${active ? 'text-[#8ab4f8]' : 'text-[#5f6368]'}`}
      />

      {editing ? (
        <div className="flex-1 flex items-center gap-1 min-w-0">
          <input
            ref={inputRef}
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-[#0d0d0d] text-[#e8eaed] text-xs sm:text-sm rounded px-2 py-1 outline-none border border-[#8ab4f8] min-w-0"
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={handleRename}
            className="p-1 rounded hover:bg-[#3c4043] text-[#81c995] flex-shrink-0 transition-colors"
          >
            <Check size={14} />
          </button>
          <button
            onClick={() => { setEditValue(title); setEditing(false); }}
            className="p-1 rounded hover:bg-[#3c4043] text-[#f28b82] flex-shrink-0 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 min-w-0">
            <span className={`block text-xs sm:text-sm truncate ${active ? 'text-[#e8eaed] font-medium' : 'text-[#9aa0a6]'}`}>
              {title}
            </span>
          </div>
          <div ref={menuRef} className="relative opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="p-1 rounded hover:bg-[#3c4043] text-[#9aa0a6] transition-colors"
            >
              <MoreHorizontal size={14} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-32 sm:w-36 rounded-lg bg-[#2a2a2e] border border-[#3c4043] shadow-lg z-50 overflow-hidden">
                <button
                  onClick={(e) => { e.stopPropagation(); setEditing(true); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs sm:text-sm text-[#e8eaed] hover:bg-[#3c4043] transition-colors"
                >
                  <Pencil size={14} />
                  Rename
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs sm:text-sm text-[#f28b82] hover:bg-[#3c4043] transition-colors"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default SessionItem;
