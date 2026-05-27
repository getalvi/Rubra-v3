import React from 'react';
import useChat from '../../hooks/useChat'; 

export default function MessageThread() {
  const { messages } = useChat(); 

  if (!messages || messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center mt-32">
        <div className="w-16 h-16 bg-gemini-surface rounded-full flex items-center justify-center mb-6 border border-[#282a2c]">
          <img src="/favicon.svg" alt="Rubra" className="w-8 h-8 opacity-80" />
        </div>
        <h1 className="text-3xl font-medium text-gemini-text mb-2">How can I help you today?</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full py-8 px-4 max-w-3xl mx-auto">
      {messages.map((message, index) => (
        <div key={index} className="w-full mb-8">
          {message.role === 'user' ? (
            <div className="flex justify-end w-full">
              <div className="bg-gemini-surface px-6 py-3 rounded-3xl max-w-[85%] text-gemini-text text-md leading-relaxed break-words border border-[#282a2c]">
                {message.text}
              </div>
            </div>
          ) : (
            <div className="flex items-start w-full">
              <div className="w-8 h-8 rounded-full mr-4 mt-1 bg-[#1e1f20] border border-[#282a2c] flex items-center justify-center flex-shrink-0">
                <img src="/favicon.svg" alt="Rubra" className="w-5 h-5" />
              </div>
              <div className="flex-1 text-gemini-text leading-relaxed text-md whitespace-pre-wrap break-words pt-1">
                {message.text}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
