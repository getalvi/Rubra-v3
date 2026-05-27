import React, { useRef, useEffect } from 'react';
import useChat from '../../hooks/useChat'; 

export default function MessageThread() {
  const { messages, sendMessage } = useChat(); 
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSuggestionClick = (text) => {
    sendMessage(text);
  };

  if (!messages || messages.length === 0) {
    return (
      <div className="flex flex-col items-start justify-center min-h-[70vh] max-w-2xl mx-auto px-2 select-none animate-fade-in">
        {/* Gradient Greeting Text */}
        <div className="mb-10 w-full">
          <h1 className="text-5xl font-semibold tracking-tight leading-tight bg-gradient-to-r from-[#4285f4] via-[#9b72cb] to-[#d96570] bg-clip-text text-transparent">
            Hello, Alvi
          </h1>
          <h2 className="text-5xl font-medium text-[#444746] mt-1 leading-tight">
            How can I help you today?
          </h2>
        </div>

        {/* Gemini Grid Action Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-4">
          <button 
            onClick={() => handleSuggestionClick("Draft a professional email matching Gemini style")}
            className="bg-[#1e1f20] hover:bg-[#282a2c] p-5 h-36 rounded-2xl text-left flex flex-col justify-between border border-transparent hover:border-[#333538] transition-all duration-200 group"
          >
            <p className="text-[#e3e3e3] text-sm font-normal leading-relaxed">Draft a professional email matching Gemini style</p>
            <div className="self-end bg-[#131314] p-2 rounded-full text-[#8ab4f8] group-hover:bg-[#1e1f20]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </div>
          </button>

          <button 
            onClick={() => handleSuggestionClick("Write a complex recursive function in JavaScript")}
            className="bg-[#1e1f20] hover:bg-[#282a2c] p-5 h-36 rounded-2xl text-left flex flex-col justify-between border border-transparent hover:border-[#333538] transition-all duration-200 group"
          >
            <p className="text-[#e3e3e3] text-sm font-normal leading-relaxed">Write a complex recursive function in JavaScript</p>
            <div className="self-end bg-[#131314] p-2 rounded-full text-[#8ab4f8] group-hover:bg-[#1e1f20]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            </div>
          </button>

          <button 
            onClick={() => handleSuggestionClick("Analyze this code snippet for runtime complexity")}
            className="bg-[#1e1f20] hover:bg-[#282a2c] p-5 h-36 rounded-2xl text-left flex flex-col justify-between border border-transparent hover:border-[#333538] transition-all duration-200 group"
          >
            <p className="text-[#e3e3e3] text-sm font-normal leading-relaxed">Analyze this code snippet for runtime complexity</p>
            <div className="self-end bg-[#131314] p-2 rounded-full text-[#8ab4f8] group-hover:bg-[#1e1f20]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto space-y-8">
      {messages.map((message, index) => (
        <div key={message.id || index} className={`w-full flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          
          {message.role === 'user' ? (
            <div className="bg-[#1e1f20] text-[#f0f4f9] px-5 py-3 rounded-2xl max-w-[85%] text-[15px] leading-relaxed break-words font-normal">
              {message.text}
            </div>
          ) : (
            <div className="flex items-start w-full group">
              <div className="w-8 h-8 rounded-full mr-4 bg-gradient-to-tr from-[#4285f4] to-[#9b72cb] flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-white text-xs font-bold font-mono">R</span>
              </div>
              <div className="flex-1 text-[#e3e3e3] leading-7 text-[15px] whitespace-pre-wrap break-words pt-1 font-normal tracking-wide">
                {message.text || (
                  <div className="flex items-center space-x-2 pt-2">
                    <div className="w-2 h-2 bg-[#8ab4f8] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-[#9b72cb] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-[#d96570] rounded-full animate-bounce"></div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
