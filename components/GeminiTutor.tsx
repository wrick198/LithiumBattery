import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageSquare, Sparkles, X, Loader2, GripHorizontal } from 'lucide-react';
import { SimMode } from '../types';

interface GeminiTutorProps {
  mode: SimMode;
  voltage: number;
  current: number;
}

export const GeminiTutor: React.FC<GeminiTutorProps> = ({ mode, voltage, current }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Draggable State
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const elementOffsetRef = useRef({ x: 0, y: 0 });

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'model',
        text: "你好！我是你的物理实验助手。关于电池、电压或本次仿真背后的科学原理，尽管问我！"
      }]);
    }
    // Initialize position to bottom right
    setPosition({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
    setIsInitialized(true);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        throw new Error("API Key not found");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const context = `
        你是一个在名为"物理人生"的Web应用程序中的物理导师。
        请用简体中文回答。
        
        当前仿真模式: ${mode === SimMode.VOLTAIC ? '伏打电堆 (1800年)' : '锂离子电池 (现代)'}。
        当前电压读数: ${voltage.toFixed(2)} 伏特 (Volts)。
        当前电流读数: ${current.toFixed(2)} 安培 (Amps)。
        
        请用通俗易懂的语言解释物理概念，适合学生理解。
        除非用户要求详细解释，否则保持回答简洁（不超过3句话）。
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            { role: 'user', parts: [{ text: context + "\n\n用户问题: " + userMsg }] }
        ]
      });

      const text = response.text || "我无法生成回复，请重试。";
      setMessages(prev => [...prev, { role: 'model', text }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "抱歉，连接实验室数据库时出现问题 (API Error)。" }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent default to stop text selection
    // e.preventDefault(); 
    // ^ Don't prevent default on inputs inside the chat window, handled by checking target?
    // Actually, only enable drag from specific areas (like header or button)
    
    isDraggingRef.current = false;
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    elementOffsetRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const dx = e.clientX - dragStartPosRef.current.x;
    const dy = e.clientY - dragStartPosRef.current.y;
    
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
       isDraggingRef.current = true;
    }

    if (isDraggingRef.current) {
        const newX = e.clientX - elementOffsetRef.current.x;
        const newY = e.clientY - elementOffsetRef.current.y;
        
        // Simple boundary check (optional, but nice)
        const maxX = window.innerWidth - 60;
        const maxY = window.innerHeight - 60;
        
        setPosition({ 
            x: Math.min(Math.max(0, newX), maxX), 
            y: Math.min(Math.max(0, newY), maxY) 
        });
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    // We don't reset isDraggingRef immediately here because onClick needs to read it
    // It will be reset on next MouseDown
  };

  const handleToggle = () => {
      if (!isDraggingRef.current) {
          setIsOpen(!isOpen);
      }
  };

  if (!isInitialized) return null;

  return (
    <>
      <div 
        style={{ left: position.x, top: position.y }}
        className="fixed z-50 touch-none"
      >
        {!isOpen ? (
            <button 
              onMouseDown={handleMouseDown}
              onClick={handleToggle}
              className="w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-transform flex items-center justify-center cursor-grab active:cursor-grabbing"
              title="咨询 AI 导师 (可拖动)"
            >
              <Sparkles size={24} />
            </button>
        ) : (
            // Chat Window
            <div 
               className="w-80 md:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden font-sans relative -translate-x-[90%] -translate-y-[90%] md:-translate-x-[100%] md:-translate-y-[100%]"
               // Translating up/left so the button position acts as the bottom-right anchor roughly
               // Or we can just center it? Let's anchor bottom-right to the drag point
               style={{ transform: 'translate(-100%, -100%)' }}
            >
              {/* Draggable Header */}
              <div 
                 onMouseDown={handleMouseDown}
                 className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 text-white flex justify-between items-center cursor-grab active:cursor-grabbing select-none"
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={18} />
                  <h3 className="font-bold text-sm">物理导师 AI</h3>
                </div>
                <div className="flex items-center gap-2">
                   <GripHorizontal size={18} className="opacity-50" />
                   <button 
                     onMouseDown={(e) => e.stopPropagation()} // Prevent drag when clicking close
                     onClick={() => setIsOpen(false)} 
                     className="hover:bg-white/20 p-1 rounded transition"
                   >
                     <X size={18} />
                   </button>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      m.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                     <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex items-center gap-2">
                       <Loader2 className="animate-spin text-indigo-600" size={16} />
                       <span className="text-xs text-slate-500">思考中...</span>
                     </div>
                  </div>
                )}
              </div>

              <div className="p-3 bg-white border-t border-slate-100">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="问点什么..."
                    onMouseDown={(e) => e.stopPropagation()} // Allow text selection/focus
                    className="flex-grow p-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button 
                    type="submit" 
                    disabled={isLoading || !input.trim()}
                    className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <MessageSquare size={18} />
                  </button>
                </form>
              </div>
            </div>
        )}
      </div>
    </>
  );
};