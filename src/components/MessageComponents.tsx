import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot, Copy, Check, Sparkles, Globe, Code2, Search, Eye, GraduationCap, Zap } from 'lucide-react';
import CodeBlock from './CodeBlock';
import type { Message } from '@/types';

const agentIcons: Record<string, React.ElementType> = {
  GeneralAgent: Sparkles,
  CodingAgent: Code2,
  SearchAgent: Search,
  SmartTutorAgent: GraduationCap,
  BrowseAgent: Globe,
  FastChatAgent: Zap,
  VisionAgent: Eye,
};

const agentColors: Record<string, string> = {
  GeneralAgent: 'text-blue-400',
  CodingAgent: 'text-cyan-400',
  SearchAgent: 'text-violet-400',
  SmartTutorAgent: 'text-emerald-400',
  BrowseAgent: 'text-rose-400',
  FastChatAgent: 'text-amber-400',
  VisionAgent: 'text-fuchsia-400',
};

interface UserMessageProps {
  message: Message;
}

export function UserMessage({ message }: UserMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = message.content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [message.content]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex gap-3 justify-end group"
    >
      <div className="flex-1 max-w-[85%] md:max-w-[75%]">
        <div className="message-user px-4 py-3">
          {message.image && (
            <div className="mb-3">
              <img
                src={message.image}
                alt="Uploaded"
                className="max-w-full max-h-64 rounded-lg object-contain"
              />
            </div>
          )}
          <p className="text-sm text-white/90 whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>
        <div className="flex items-center justify-end gap-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] text-muted-foreground">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button
              onClick={handleCopy}
              className="p-1 rounded hover:bg-white/5 transition-colors"
              title="Copy message"
            >
              {copied ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3 text-muted-foreground" />
              )}
            </button>
          </div>
      </div>
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
        <User className="w-4 h-4 text-white" />
      </div>
    </motion.div>
  );
}

interface AIMessageProps {
  message: Message;
}

export function AIMessage({ message }: AIMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = message.content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [message.content]);

  const AgentIcon = message.agent ? (agentIcons[message.agent] || Bot) : Bot;
  const agentColor = message.agent ? (agentColors[message.agent] || 'text-orange-400') : 'text-orange-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex gap-3 group"
    >
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-600/20 border border-orange-500/30 flex items-center justify-center shrink-0">
        <AgentIcon className={`w-4 h-4 ${agentColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-orange-400">
            {message.agent || 'RUBRA'}
          </span>
          {message.intent && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-muted-foreground capitalize">
              {message.intent}
            </span>
          )}
          {message.isStreaming && (
            <span className="flex items-center gap-1 text-[10px] text-orange-400 animate-pulse-soft">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              Thinking
            </span>
          )}
        </div>
        <div className="message-ai px-4 py-3">
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const code = String(children).replace(/\n$/, '');

                  if (inline || !match) {
                    return (
                      <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono text-orange-300" {...props}>
                        {children}
                      </code>
                    );
                  }

                  return <CodeBlock code={code} language={match[1]} />;
                },
                pre({ children }: any) {
                  return <>{children}</>;
                },
                p({ children }: any) {
                  return <p className="text-sm text-white/85 leading-relaxed mb-3 last:mb-0">{children}</p>;
                },
                ul({ children }: any) {
                  return <ul className="text-sm text-white/85 space-y-1 mb-3 list-disc list-inside">{children}</ul>;
                },
                ol({ children }: any) {
                  return <ol className="text-sm text-white/85 space-y-1 mb-3 list-decimal list-inside">{children}</ol>;
                },
                li({ children }: any) {
                  return <li className="leading-relaxed">{children}</li>;
                },
                h1({ children }: any) {
                  return <h1 className="text-lg font-bold text-white mb-3 mt-4">{children}</h1>;
                },
                h2({ children }: any) {
                  return <h2 className="text-base font-semibold text-white mb-2 mt-3">{children}</h2>;
                },
                h3({ children }: any) {
                  return <h3 className="text-sm font-semibold text-white mb-2 mt-3">{children}</h3>;
                },
                blockquote({ children }: any) {
                  return (
                    <blockquote className="border-l-2 border-orange-500/50 pl-4 my-3 text-white/70 italic">
                      {children}
                    </blockquote>
                  );
                },
                table({ children }: any) {
                  return (
                    <div className="overflow-x-auto my-3">
                      <table className="text-sm text-white/85 border-collapse">{children}</table>
                    </div>
                  );
                },
                th({ children }: any) {
                  return <th className="border border-border/50 px-3 py-2 text-left font-semibold bg-white/5">{children}</th>;
                },
                td({ children }: any) {
                  return <td className="border border-border/50 px-3 py-2">{children}</td>;
                },
                a({ href, children }: any) {
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-400 hover:text-orange-300 underline underline-offset-2 transition-colors"
                    >
                      {children}
                    </a>
                  );
                },
                hr() {
                  return <hr className="border-border/50 my-4" />;
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-white/5 transition-colors"
            title="Copy message"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-600/20 border border-orange-500/30 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-orange-400" />
      </div>
      <div className="message-ai px-4 py-3 flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="typing-dot w-2 h-2 rounded-full bg-orange-400" />
          <span className="typing-dot w-2 h-2 rounded-full bg-orange-400" />
          <span className="typing-dot w-2 h-2 rounded-full bg-orange-400" />
        </div>
        <span className="text-xs text-muted-foreground ml-1">RUBRA is thinking...</span>
      </div>
    </motion.div>
  );
}
