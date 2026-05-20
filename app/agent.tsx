"use client";

import React, { useEffect, useRef, useState } from 'react';

export default function Agent() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'agent', text: 'Hello! How can I help you today?' }
  ]);
  
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Close when clicking outside the panel
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!open) return;
      if (!panelRef.current) return;
      if (panelRef.current.contains(e.target as Node)) return;
      setOpen(false);
    }

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [open]);

  // Handle sending messages
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', text: input }]);
    setInput('');

    // Simulated response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: 'agent', text: 'I am processing your request...' }
      ]);
    }, 1000);
  };

  return (
    // 'fixed' keeps it hovering on the screen, 'bottom-6 right-6' pins it to the corner
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Panel (appears above the button) */}
      <div
        ref={panelRef}
        // 'bottom-full mb-4' pushes it directly above the button
        className={`absolute bottom-full right-0 mb-4 w-80 sm:w-96 overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-2xl transform-gpu origin-bottom-right transition-all duration-300 ease-out ${
          open
            ? 'translate-y-0 opacity-100 scale-100 pointer-events-auto'
            : 'translate-y-2 opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm">
              <img src="/robot.png" alt="Agent Avatar" className="h-5 w-5 object-contain" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white"></span>
            </div>
            <h3 className="font-semibold text-gray-800 tracking-wide">Assistant</h3>
          </div>
          <button
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors bg-white rounded-full p-1 hover:bg-gray-100"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Message Area */}
        <div className="flex h-80 flex-col gap-4 overflow-y-auto p-4 bg-white scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex max-w-[85%] flex-col ${msg.role === 'user' ? 'self-end' : 'self-start'}`}
            >
              <div 
                className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'rounded-br-sm bg-blue-600 text-white' 
                    : 'rounded-bl-sm bg-gray-100 text-gray-800 border border-gray-200'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-100 bg-gray-50 p-3">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-xl bg-white px-4 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-all hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 shadow-sm"
            >
              <svg className="h-4 w-4 -rotate-45 ml-0.5 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Floating button / icon */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        // Keeping your custom open animation (-translate-y-6 scale-105)
        className={`relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg ring-1 ring-slate-200 transition-transform duration-300 ease-in-out z-10 ${
          open ? '-translate-y-4 scale-105' : 'translate-y-0'
        }`}
      >
        <img src="/robot.png" alt="assistant" className="h-10 w-10 object-contain" />
      </button>
    </div>
  );
}