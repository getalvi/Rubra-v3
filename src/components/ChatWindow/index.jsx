import React from 'react';
import MessageThread from '../MessageThread';

export default function ChatWindow() {
  return (
    <div className="w-full h-full flex flex-col">
      <MessageThread />
    </div>
  );
}
