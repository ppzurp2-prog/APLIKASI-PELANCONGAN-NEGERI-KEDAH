/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, Sparkles, MessageSquare, CornerDownLeft, RefreshCcw } from 'lucide-react';
import { ChatMessage, TouristSpot } from '../types';

interface AiAssistantProps {
  selectedSpot: TouristSpot | null;
}

const SUGGESTED_PROMPTS = [
  'Apakah makanan khas tradisional di Kedah yang wajib dicoba?',
  'Cadangkan itinerari percutian 3 hari di Alor Setar & Yan.',
  'Bagaimana cara terbaik untuk mendaki Gunung Jerai?',
  'Senaraikan tempat membeli-belah bebas cukai terbaik di Langkawi.',
];

export default function AiAssistant({ selectedSpot }: AiAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: 'Selamat datang ke Kedah! Saya adalah Pembantu Pelancongan AI anda. Anda boleh tanya soalan mengenai tempat-tempat menarik, makanan traditional Kedah, cadangan jadual perjalanan (itinerary), atau apa-apa sahaja tips pelancongan di negeri Jelapang Padi ini!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to lowest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Context-aware auto prompt injection when user clicks on a spot card!
  useEffect(() => {
    if (!selectedSpot) return;

    // Check if the last prompt was already about this spot to avoid repeating
    const query = `Boleh berikan ulasan ringkas mengenai tarikan utama, tips melawat, dan tempat makan terdekat untuk ${selectedSpot.name} di ${selectedSpot.district}?`;
    
    // Add a helper info toast or prompt selection automatically if they wish
  }, [selectedSpot]);

  const handleSendPrompt = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: textToSend }),
      });

      if (!response.ok) {
        throw new Error('Gagal menghubungi pembantu AI.');
      }

      const data = await response.json();
      
      const aiMsg: ChatMessage = {
        sender: 'ai',
        text: data.reply || 'Maaf, saya menghadapi ralat teknikal ketika memproses soalan anda. Sila cuba seketika lagi.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        sender: 'ai',
        text: 'Maaf, saya tidak dapat menjawab ketika ini. Pastikan kunci API Gemini dimasukkan dengan betul dalam tetapan projek anda.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        sender: 'ai',
        text: 'Selamat datang ke Kedah! Sembang kita telah diset semula. Boleh saya bantu anda merancang percutian anda yang seterusnya ke negeri Kedah?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleAskAboutSelectedSpot = () => {
    if (!selectedSpot) return;
    const query = `Berikan maklumat lengkap, tips perjalanan, aktiviti menarik, dan cara pengangkutan terbaik untuk melawat ke: ${selectedSpot.name} di Kedah.`;
    handleSendPrompt(query);
  };

  return (
    <div id="ai-assistant-panel" className="bg-white rounded-2xl border border-emerald-100/80 p-5 shadow-sm flex flex-col h-[480px] justify-between overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-emerald-50 pb-4 mb-3 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <Bot className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-emerald-950 flex items-center gap-1">
              Pembantu AI Pelancongan
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse animate-bounce-slow" />
            </h3>
            <p className="text-[11px] text-emerald-700">Tanya soalan panduan pelancongan masa nyata</p>
          </div>
        </div>

        <button
          id="reset-chat-btn"
          onClick={handleResetChat}
          className="text-emerald-700 hover:text-emerald-950 hover:bg-emerald-50 p-1.5 rounded-lg transition-colors cursor-pointer"
          title="Kosongkan Sembang"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested chips or selected spot info card */}
      <div className="flex-shrink-0 mb-3">
        {selectedSpot ? (
          <div id="ai-context-box" className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 border-dashed flex justify-between items-center text-xs">
            <span className="text-emerald-950 max-w-[170px] truncate">
              Mengenai: <strong>{selectedSpot.name}</strong>
            </span>
            <button
              id="ask-ai-spot-tips-btn"
              onClick={handleAskAboutSelectedSpot}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-2 py-1 rounded text-[10px] cursor-pointer flex items-center gap-1 shadow-sm transition-colors"
            >
              <MessageSquare className="w-3 h-3" />
              Tanya Tips AI
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 max-h-[75px] overflow-y-auto no-scrollbar">
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                id={`pref-prompt-chip-${idx}`}
                key={idx}
                onClick={() => handleSendPrompt(prompt)}
                disabled={loading}
                className="text-[10px] bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-100 rounded-full px-2.5 py-1 text-left transition truncate max-w-[200px] cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto space-y-3.5 mb-4 pr-1 scrollbar-thin">
        {messages.map((msg, index) => {
          const isAI = msg.sender === 'ai';
          return (
            <div
              id={`chat-msg-row-${index}`}
              key={index}
              className={`flex items-start gap-2.5 ${!isAI ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar indicator */}
              <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                isAI ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {isAI ? 'AI' : 'Saya'}
              </div>

              {/* Message text bubble wrapper */}
              <div className={`flex flex-col max-w-[80%] ${!isAI ? 'items-end' : 'items-start'}`}>
                <div role="log" className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap break-words ${
                  isAI 
                    ? 'bg-slate-50 border border-slate-100 text-emerald-950 font-normal rounded-tl-none shadow-sm' 
                    : 'bg-emerald-600 text-white rounded-tr-none font-medium'
                }`}>
                  {msg.text}
                </div>
                
                {/* Time stamp */}
                <span className="text-[9px] text-slate-400 mt-1 font-mono">{msg.timestamp}</span>
              </div>
            </div>
          );
        })}

        {/* Floating loading bubble indicator */}
        {loading && (
          <div id="ai-typing-loader" className="flex items-start gap-2.5">
            <div className="w-7.5 h-7.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center text-xs">
              AI
            </div>
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl rounded-tl-none text-xs text-emerald-900/60 shadow-sm flex items-center gap-1.5 font-medium">
              <span>Menaip</span>
              <span className="flex gap-1">
                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce"></span>
                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar wrapper */}
      <form
        id="chat-input-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSendPrompt(inputValue);
        }}
        className="flex items-center gap-2 border border-emerald-100 rounded-xl p-1 bg-slate-50 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all flex-shrink-0"
      >
        <input
          id="chat-text-input"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={loading ? 'Memproses jawapan...' : 'Tanya pembantu AI di sini...'}
          disabled={loading}
          autoComplete="off"
          className="flex-1 bg-transparent px-3 py-1.5 outline-none font-medium text-xs text-emerald-950 placeholder-emerald-800/40 min-w-0"
        />
        <button
          id="chat-send-btn"
          type="submit"
          disabled={loading || !inputValue.trim()}
          className="w-8.5 h-8.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/30 text-white flex items-center justify-center rounded-lg transition-all flex-shrink-0 shadow-sm disabled:cursor-not-allowed cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
