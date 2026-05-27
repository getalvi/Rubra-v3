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
      <div className="flex items-center bg-gemini-deepDark rounded-full px-5 py-2 shadow-lg border border-gemini-border focus-within:border-gemini-blueAccent transition-colors">
        <button className="text-gemini-icon hover:text-gemini-textPrimary p-2 transition rounded-full hover:bg-gemini-surfaceActive">
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
          className="flex-1 bg-transparent border-none focus:outline-none text-gemini-textPrimary px-4 text-lg"
          disabled={isStreaming}
        />
        
        <div className="flex items-center space-x-1">
          {/* Add Gemini-like icons inside the pill */}
          <button className="text-gemini-icon hover:text-gemini-textPrimary p-2 transition rounded-full hover:bg-gemini-surfaceActive">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          </button>
          
          {isStreaming ? (
            <button onClick={stopStreaming} className="bg-transparent text-gemini-blueAccent p-2 rounded-full transition hover:bg-gemini-surfaceActive">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </button>
          ) : (
            <button 
              onClick={handleSend} 
              className={`p-2 rounded-full transition ${input.trim() ? 'text-gemini-blueAccent hover:bg-[#2a3950]' : 'text-gemini-icon cursor-not-allowed'}`}
              disabled={!input.trim()}
            >
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
               </svg>
            </button>
          )}
        </div>
      </div>
      <p className="text-center text-xs text-[#a0a0a0] mt-3">
        Rubra can make mistakes. Consider verifying important information.
      </p>
    </div>
  );
}
