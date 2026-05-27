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
    <div className="w-full max-w-2xl px-4 flex flex-col items-center">
      
      {/* Container Box Wrapper */}
      <div className="w-full flex items-center bg-[#1e1f20] rounded-full pl-5 pr-2 py-1.5 border border-transparent focus-within:bg-[#282a2c] focus-within:border-[#3c4043] transition-all duration-200 shadow-md">
        
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Rubra..." 
          className="flex-1 bg-transparent border-none focus:outline-none text-[#e3e3e3] placeholder-[#9aa0a6] text-[16px] py-2"
          disabled={isStreaming}
        />
        
        {/* Interaction Layout Tools */}
        <div className="flex items-center space-x-0.5">
          {/* Mock Mic Icon */}
          <button className="text-[#9aa0a6] hover:text-[#e3e3e3] p-2.5 transition rounded-full hover:bg-[#333538]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          
          {isStreaming ? (
            <button 
              onClick={stopStreaming} 
              className="bg-transparent text-[#8ab4f8] p-2.5 rounded-full transition hover:bg-[#2a3950]"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="7" y="7" width="10" height="10" rx="1.5" />
              </svg>
            </button>
          ) : (
            <button 
              onClick={handleSend} 
              className={`p-2.5 rounded-full transition-all duration-200 ${
                input.trim() 
                  ? 'text-[#8ab4f8] hover:bg-[#2a3950] opacity-100' 
                  : 'text-[#5f6368] cursor-not-allowed opacity-40'
              }`}
              disabled={!input.trim()}
            >
               <svg className="w-5 h-5 transform rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9-7-9-7v14z" />
               </svg>
            </button>
          )}
        </div>

      </div>

      {/* Legal Disclaimer */}
      <p className="text-center text-[11px] text-[#9aa0a6] mt-3 tracking-wide select-none">
        Rubra can make mistakes. Consider verifying important information.
      </p>
    </div>
  );
}
