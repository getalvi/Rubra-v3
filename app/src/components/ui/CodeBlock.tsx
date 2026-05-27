import React, { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'plaintext' }) => {
  const [copied, setCopied] = useState(false);

  const highlighted = React.useMemo(() => {
    if (language && language !== 'plaintext') {
      try {
        return hljs.highlight(code, { language }).value;
      } catch {
        return hljs.highlightAuto(code).value;
      }
    }
    return hljs.highlightAuto(code).value;
  }, [code, language]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  const displayLang = language === 'plaintext' ? 'text' : language;

  return (
    <div className="rounded-xl overflow-hidden border border-[#3c4043] my-3">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#1a1a1a] border-b border-[#3c4043]">
        <span className="text-xs font-medium text-[#9aa0a6] uppercase tracking-wide">
          {displayLang}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-[#9aa0a6] hover:text-[#e8eaed] transition-colors duration-150 px-2 py-1 rounded-md hover:bg-[#2a2a2e]"
        >
          {copied ? (
            <>
              <Check size={14} className="text-[#81c995]" />
              <span className="text-[#81c995]">Copied</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto bg-[#0d0d0d]">
        <pre className="p-4 m-0">
          <code
            className="text-[13px] leading-6 font-mono"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;
