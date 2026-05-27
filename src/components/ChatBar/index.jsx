import React, { useState } from 'react';
import useChat from '../../hooks/useChat'; 

export default function ChatBar() {
  const [input, setInput] = useState('');
  const { sendMessage, isStreaming, stopStreaming } = useChat(); 

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-3xl px-4 z-10">
      <div className="flex items-center bg-gemini-surface rounded-full px-4 py-3 shadow-lg border border-[#282a2c] focus-within:bg-[#2a2b2f] transition-colors">
        <button className="text-gray-400 hover:text-gemini-text p-2 transition rounded-full hover:bg-[#333538]">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Rubra anything..." 
          className="flex-1 bg-transparent border-none focus:outline-none text-gemini-text px-4 text-md"
          disabled={isStreaming}
        />
        
        {isStreaming ? (
          <button onClick={stopStreaming} className="bg-transparent text-gray-400 hover:text-gemini-text p-2 rounded-full transition hover:bg-[#333538]">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>
        ) : (
          <button onClick={handleSend} className={`bg-transparent p-2 rounded-full transition ${input.trim() ? 'text-gemini-accent hover:bg-[#2a3950]' : 'text-gray-500 cursor-not-allowed'}`}>
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
             </svg>
          </button>
        )}
      </div>
      <p className="text-center text-xs text-[#a0a0a0] mt-3">
        Rubra can make mistakes. Consider verifying important information.
      </p>
    </div>
  );
}
