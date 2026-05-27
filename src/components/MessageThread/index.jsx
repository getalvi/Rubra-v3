import React from 'react';
import useChat from '../../hooks/useChat'; 

export default function MessageThread() {
  const { messages } = useChat(); 

  if (!messages || messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center mt-20">
        <div className="w-16 h-16 bg-gemini-surface rounded-full flex items-center justify-center mb-6">
          <img src="/favicon.svg" alt="Rubra" className="w-8 h-8 opacity-70" />
        </div>
        <h1 className="text-3xl font-semibold text-gemini-text mb-2">How can I help you today?</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full py-8 px-4">
      {messages.map((message, index) => (
        <div key={index} className="w-full mb-8">
          {message.role === 'user' ? (
            <div className="flex justify-end w-full">
              <div className="bg-gemini-surface px-6 py-3 rounded-3xl max-w-[80%] text-gemini-text text-md leading-relaxed break-words">
                {message.text}
              </div>
            </div>
          ) : (
            <div className="flex items-start w-full">
              <img src="/favicon.svg" alt="Rubra" className="w-8 h-8 rounded-full mr-4 mt-1 bg-white p-1" />
              <div className="flex-1 text-gemini-text leading-relaxed prose prose-invert max-w-none">
                {message.text}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
