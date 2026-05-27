import React, { useRef, useEffect } from 'react';
import useChat from '../../hooks/useChat'; 
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function MessageThread() {
  const { messages } = useChat(); 
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center mt-32 max-w-2xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-medium text-gemini-textPrimary mb-12">Hi, I'm Rubra. How can I help you today?</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {/* Replicate Gemini Suggestion Chips */}
          {['Draft a professional email', 'Write a complex function', 'Analyze this snippet'].map(chip => (
            <button key={chip} className="bg-gemini-deepDark hover:bg-gemini-surfaceActive p-6 rounded-2xl text-left text-gemini-text border border-gemini-border transition">
              {chip}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full py-8 px-4">
      {messages.map((message, index) => (
        <div key={message.id || index} className={`w-full mb-8 ${message.role === 'user' ? 'flex justify-end' : 'flex'}`}>
          {message.role === 'user' ? (
            <div className="bg-gemini-deepDark px-6 py-3 rounded-full max-w-[85%] text-gemini-textPrimary text-md leading-relaxed break-words border border-gemini-border">
              {message.text}
            </div>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full mr-4 mt-1 flex-shrink-0">
                <img src="/favicon.svg" alt="Rubra" className="w-full h-full p-1 opacity-70" />
              </div>
              <div className="flex-1 text-gemini-text leading-relaxed text-md max-w-3xl prose prose-invert">
                 <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={atomDark}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        }
                    }}
                 >
                   {message.text}
                 </ReactMarkdown>
              </div>
            </>
          )}
        </div>
      ))}
       <div ref={messagesEndRef} />
    </div>
  );
}
