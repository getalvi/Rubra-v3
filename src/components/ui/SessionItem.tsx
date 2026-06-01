import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, Pencil, Trash2, Check, X } from 'lucide-react';

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
      exit={{ opacity: 0, y: -4 }}
      className={`
        group relative flex items-center gap-2 px-3 py-2.5 rounded-lg
        cursor-pointer transition-colors duration-150
        ${active ? 'bg-[#2a2a2e]' : 'hover:bg-[#212124]'}
      `}
      onClick={editing ? undefined : onClick}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-[#9aa0a6] flex-shrink-0"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>

      {editing ? (
        <div className="flex-1 flex items-center gap-1 min-w-0">
          <input
            ref={inputRef}
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-[#1a1a1a] text-[#e8eaed] text-sm rounded px-2 py-1 outline-none border border-[#8ab4f8] min-w-0"
          />
          <button
            onClick={handleRename}
            className="p-1 rounded hover:bg-[#3c4043] text-[#81c995]"
          >
            <Check size={14} />
          </button>
          <button
            onClick={() => { setEditValue(title); setEditing(false); }}
            className="p-1 rounded hover:bg-[#3c4043] text-[#f28b82]"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <>
          <span className={`flex-1 text-sm truncate min-w-0 ${active ? 'text-[#e8eaed]' : 'text-[#9aa0a6]'}`}>
            {title}
          </span>
          <div ref={menuRef} className="relative opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="p-1 rounded hover:bg-[#3c4043] text-[#9aa0a6]"
            >
              <MoreHorizontal size={14} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 rounded-lg bg-[#2a2a2e] border border-[#3c4043] shadow-lg z-50 overflow-hidden">
                <button
                  onClick={(e) => { e.stopPropagation(); setEditing(true); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#e8eaed] hover:bg-[#3c4043] transition-colors"
                >
                  <Pencil size={14} />
                  Rename
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#f28b82] hover:bg-[#3c4043] transition-colors"
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
