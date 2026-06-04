import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, Terminal, ChevronDown, ChevronUp, Play } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

const languageMap: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  jsx: 'jsx',
  tsx: 'tsx',
  py: 'python',
  python: 'python',
  html: 'html',
  css: 'css',
  json: 'json',
  bash: 'bash',
  sh: 'bash',
  shell: 'bash',
  sql: 'sql',
  rust: 'rust',
  rs: 'rust',
  go: 'go',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  md: 'markdown',
  yaml: 'yaml',
  yml: 'yaml',
  dockerfile: 'dockerfile',
};

function detectLanguage(lang?: string, code?: string): string {
  if (lang && languageMap[lang]) return languageMap[lang];
  if (lang) return lang;

  // Auto-detect from code
  if (!code) return 'plaintext';
  if (code.includes('import React') || code.includes('from "react"') || code.includes("from 'react'")) return 'jsx';
  if (code.includes('def ') && code.includes(':')) return 'python';
  if (code.includes('function ') || code.includes('const ') || code.includes('let ')) return 'javascript';
  if (code.includes('<!DOCTYPE html>') || code.includes('<html>')) return 'html';
  if (code.includes('{') && code.includes('}') && code.includes(':') && !code.includes('function')) return 'json';
  if (code.includes('SELECT ') || code.includes('INSERT ') || code.includes('CREATE TABLE')) return 'sql';
  if (code.includes('fn ') || code.includes('impl ') || code.includes('use std::')) return 'rust';
  if (code.includes('package main') || code.includes('func ')) return 'go';
  if (code.includes('public class') || code.includes('System.out.')) return 'java';
  if (code.includes('#include')) return 'cpp';

  return 'plaintext';
}

export default function CodeBlock({ code, language, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [highlighted, setHighlighted] = useState('');
  const codeRef = useRef<HTMLElement>(null);
  const detectedLang = detectLanguage(language, code);
  const displayLang = detectedLang.charAt(0).toUpperCase() + detectedLang.slice(1);
  const lines = code.split('\n');
  const shouldCollapse = lines.length > 15 && !expanded;
  const displayCode = shouldCollapse ? lines.slice(0, 15).join('\n') + '\n...' : code;

  const highlightCode = useCallback(async () => {
    if (typeof window !== 'undefined' && (window as any).hljs) {
      const hljs = (window as any).hljs;
      try {
        const result = hljs.highlight(displayCode, { language: detectedLang, ignoreIllegals: true });
        setHighlighted(result.value);
      } catch {
        setHighlighted(hljs.highlightAuto(displayCode).value);
      }
    }
  }, [displayCode, detectedLang]);

  useEffect(() => {
    highlightCode();
  }, [highlightCode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="code-block my-4 group"
    >
      {/* Header */}
      <div className="code-header">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-orange-400" />
          <span className="text-xs font-medium text-muted-foreground">
            {filename || displayLang}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground">
            {lines.length} lines
          </span>
        </div>
        <div className="flex items-center gap-1">
          {shouldCollapse && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
              title={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
          )}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-white/10 transition-colors flex items-center gap-1"
            title="Copy code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] text-emerald-400">Copied</span>
              </>
            ) : (
              <Copy className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </button>
          <button
            className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
            title="Run code"
          >
            <Play className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className="relative overflow-x-auto">
        <pre className="p-4 text-sm leading-relaxed overflow-x-auto">
          <code
            ref={codeRef}
            className={`language-${detectedLang} font-mono text-[13px]`}
            dangerouslySetInnerHTML={{
              __html: highlighted || displayCode,
            }}
          />
        </pre>
      </div>
    </motion.div>
  );
}
