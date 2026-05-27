import React from 'react';
import useChat from '../../hooks/useChat';

export default function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useChat();

  return (
    <aside className={`fixed md:relative top-0 left-0 h-full w-64 bg-gemini-surface border-r border-[#282a2c] z-40 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}>
      <div className="p-4 flex items-center justify-between border-b border-[#282a2c] mt-12 md:mt-0">
        <div className="flex items-center space-x-2">
          <img src="/favicon.svg" alt="Rubra" className="w-6 h-6" />
          <span className="font-semibold text-lg text-gemini-text">Rubra v3</span>
        </div>
        <button onClick={toggleSidebar} className="md:hidden text-gray-400 hover:text-gemini-text">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {/* History or navigation list goes here */}
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Recent Chats</div>
        <div className="text-sm text-gray-400 italic">No recent history</div>
      </div>
    </aside>
  );
}
