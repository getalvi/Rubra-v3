import React, { useState, useCallback } from 'react';
import { Copy, Check, Play } from 'lucide-react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

interface CodeBlockProps {
  code: string;
  language: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const highlighted = React.useMemo(() => {
    try {
      const validLang = hljs.getLanguage(language) ? language : 'plaintext';
      return hljs.highlight(code, { language: validLang }).value;
    } catch {
      return code;
    }
  }, [code, language]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  const langLabel = language === 'plaintext' ? 'text' : language;

  return (
    <div className="rounded-xl border border-[#3c4043] overflow-hidden my-3 bg-[#0d0d0d]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#1a1a1a] border-b border-[#282a2c]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#9aa0a6] uppercase tracking-wide">
            {langLabel}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-[#9aa0a6] hover:text-[#e8eaed] hover:bg-[#2a2a2e] transition-colors"
            title="Copy code"
          >
            {copied ? <Check size={14} className="text-[#81c995]" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-[#9aa0a6] hover:text-[#e8eaed] hover:bg-[#2a2a2e] transition-colors"
            title="Run code"
          >
            <Play size={14} />
            Run
          </button>
        </div>
      </div>
      {/* Code */}
      <div className="overflow-x-auto p-4">
        <pre className="text-sm leading-relaxed">
          <code
            className="hljs"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;
