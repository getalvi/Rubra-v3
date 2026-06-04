export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  intent?: string;
  agent?: string;
  isStreaming?: boolean;
  image?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface StreamEvent {
  type: 'meta' | 'token' | 'tool_call' | 'tool_result' | 'status' | 'error';
  content?: string;
  intent?: string;
  mode?: string;
  agent?: string;
  done?: boolean;
  message?: string;
}

export interface UploadResponse {
  type: 'image' | 'text' | 'file';
  filename: string;
  text: string;
  size?: number;
  mime?: string;
}

export type ChatMode = 'auto' | 'hermes' | 'coding' | 'tutor' | 'search' | 'browse' | 'vision';

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  href?: string;
  children?: SidebarItem[];
}
