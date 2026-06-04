import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Paperclip,
  X,
  FileText,
  Loader2,
  Mic,
} from 'lucide-react';
import { uploadFile } from '@/services/api';

interface ChatInputProps {
  onSend: (message: string, image?: string, imageMime?: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export default function ChatInput({ onSend, isLoading, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; type: string; data: string; mime: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  }, [message]);

  const handleSubmit = useCallback(() => {
    if (!message.trim() && !uploadedFile) return;
    if (isLoading || disabled) return;

    onSend(
      message.trim(),
      uploadedFile?.data,
      uploadedFile?.mime
    );
    setMessage('');
    setUploadedFile(null);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [message, uploadedFile, isLoading, disabled, onSend]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];

        try {
          await uploadFile(file);
          setUploadedFile({
            name: file.name,
            type: file.type,
            data: base64Data,
            mime: file.type,
          });
        } catch {
          // If upload fails, still allow local preview
          setUploadedFile({
            name: file.name,
            type: file.type,
            data: base64Data,
            mime: file.type,
          });
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setIsUploading(false);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const clearFile = useCallback(() => {
    setUploadedFile(null);
  }, []);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const isImage = uploadedFile?.type.startsWith('image/');

  return (
    <div className="relative">
      {/* File preview */}
      <AnimatePresence>
        {uploadedFile && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-0 right-0 mb-2 px-4"
          >
            <div className="glass-card rounded-xl p-3 flex items-center gap-3 max-w-fit mx-auto">
              {isImage ? (
                <div className="relative">
                  <img
                    src={`data:${uploadedFile.mime};base64,${uploadedFile.data}`}
                    alt="Preview"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-orange-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate max-w-[200px]">{uploadedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(uploadedFile.data.length * 0.75 / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={clearFile}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input container */}
      <motion.div
        animate={{
          boxShadow: isFocused
            ? '0 0 0 1px hsl(25 95% 53% / 0.3), 0 0 20px hsl(25 95% 53% / 0.08)'
            : '0 0 0 1px hsl(220 15% 18% / 0.5)',
        }}
        transition={{ duration: 0.2 }}
        className="glass-input rounded-2xl p-3 flex items-end gap-2"
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.txt,.md,.json,.csv,.py,.js,.ts,.jsx,.tsx,.html,.css,.sql,.rs,.go,.java,.cpp,.c,.yaml,.yml,.dockerfile"
        />

        {/* Attach button */}
        <button
          onClick={triggerFileInput}
          disabled={isUploading || isLoading}
          className="p-2.5 rounded-xl hover:bg-white/5 transition-colors disabled:opacity-50 shrink-0"
          title="Attach file"
        >
          {isUploading ? (
            <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
          ) : (
            <Paperclip className="w-5 h-5 text-muted-foreground" />
          )}
        </button>

        {/* Textarea */}
        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={disabled ? 'Select a mode to start...' : 'Message RUBRA...'}
            disabled={isLoading || disabled}
            rows={1}
            className="w-full bg-transparent text-sm text-white placeholder:text-muted-foreground resize-none outline-none max-h-[200px] py-2.5"
          />
        </div>

        {/* Recording button */}
        <button
          onClick={() => setIsRecording(!isRecording)}
          disabled={isLoading}
          className={`p-2.5 rounded-xl transition-colors shrink-0 ${
            isRecording
              ? 'bg-red-500/20 text-red-400 animate-pulse'
              : 'hover:bg-white/5 text-muted-foreground'
          }`}
          title="Voice input"
        >
          {isRecording ? <Mic className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Send button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={(!message.trim() && !uploadedFile) || isLoading || disabled}
          className={`p-2.5 rounded-xl transition-all shrink-0 ${
            message.trim() || uploadedFile
              ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40'
              : 'bg-white/5 text-muted-foreground'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </motion.button>
      </motion.div>

      {/* Hint text */}
      <div className="text-center mt-2">
        <p className="text-[10px] text-muted-foreground/50">
          RUBRA can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
}
