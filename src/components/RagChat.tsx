import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Trash2, 
  Lightbulb, 
  Layers, 
  Flame, 
  BrainCircuit, 
  CheckCircle2,
  ChevronDown,
  Info,
  HelpCircle
} from 'lucide-react';
import { Note, ChatMessage, TeachingMode, QnACitation } from '../types';

interface RagChatProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectActiveNote: (id: string) => void;
  onLaunchQuizFromConcept: (concept: string) => void;
}

export const RagChat: React.FC<RagChatProps> = ({
  notes,
  activeNoteId,
  onSelectActiveNote,
  onLaunchQuizFromConcept,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `Hello! I am your **Study Buddy RAG Tutor**. 

I have indexed your uploaded notes and can:
- 💡 Explain complex concepts using the **Feynman Technique** with simple analogies
- 🎯 Answer direct exam questions grounded strictly in your study material
- ⚡ Create memorable **Mnemonics** to remember sequences and lists
- 👶 Break down tricky fundamentals with **ELI5**

What would you like to explore today? Select a note above or ask anything!`,
      mode: 'feynman',
      timestamp: new Date().toISOString(),
      followUpChecks: [
        'Explain the mechanism of ATP Synthase using an everyday analogy',
        'What are the 4 Coffman conditions for deadlocks?',
        'How does monetary contraction combat demand-pull inflation?'
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [teachingMode, setTeachingMode] = useState<TeachingMode>('feynman');
  const [selectedNoteScope, setSelectedNoteScope] = useState<string>(activeNoteId || 'all');
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (activeNoteId) {
      setSelectedNoteScope(activeNoteId);
    }
  }, [activeNoteId]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    // Determine notes context based on scope
    let contextText = '';
    let scopeLabel = 'All Notes';
    if (selectedNoteScope === 'all') {
      contextText = notes.map(n => `=== NOTE: ${n.title} (Category: ${n.category}) ===\n${n.content}`).join('\n\n');
      scopeLabel = 'All Active Notes';
    } else {
      const single = notes.find(n => n.id === selectedNoteScope);
      if (single) {
        contextText = `=== NOTE: ${single.title} (Category: ${single.category}) ===\n${single.content}`;
        scopeLabel = single.title;
      }
    }

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/study/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend.trim(),
          notesContext: contextText,
          mode: teachingMode,
          conversationHistory: messages.slice(-4),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();

      // Extract follow-up checks if provided in response text
      const followUps: string[] = [];
      const followUpMatch = data.answer.match(/(?:💡 Follow-up.*|Test Yourself.*)([\s\S]*)/i);
      if (followUpMatch && followUpMatch[1]) {
        const lines = followUpMatch[1].split('\n').filter((l: string) => l.trim().startsWith('-') || l.trim().match(/^\d\./));
        lines.slice(0, 3).forEach((line: string) => {
          const clean = line.replace(/^[-*\d.]+\s*/, '').replace(/\*\*/g, '').trim();
          if (clean.length > 5) followUps.push(clean);
        });
      }

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.answer,
        mode: teachingMode,
        timestamp: data.timestamp || new Date().toISOString(),
        citations: selectedNoteScope !== 'all' && notes.find(n => n.id === selectedNoteScope) ? [
          {
            noteId: selectedNoteScope,
            noteTitle: scopeLabel,
            quoteSnippet: `Grounded in ${scopeLabel}`,
          }
        ] : undefined,
        followUpChecks: followUps.length > 0 ? followUps : [
          'Can you explain this back in your own words?',
          'How would this appear on an exam question?',
        ]
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('QnA error:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ **Unable to generate response**: ${err.message || 'Please check your connection and try again.'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakText = (msgId: string, text: string) => {
    if ('speechSynthesis' in window) {
      if (speakingMsgId === msgId) {
        window.speechSynthesis.cancel();
        setSpeakingMsgId(null);
        return;
      }
      window.speechSynthesis.cancel();
      // Strip markdown tags
      const cleanText = text.replace(/[*#_`]/g, '').replace(/\[.*?\]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);
      setSpeakingMsgId(msgId);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const modeOptions: { id: TeachingMode; label: string; desc: string; icon: string }[] = [
    { id: 'feynman', label: 'Feynman Mode', desc: 'Simple real-world analogies & intuition', icon: '💡' },
    { id: 'eli5', label: 'ELI5', desc: 'Ultra-simplified for beginners', icon: '👶' },
    { id: 'deep_dive', label: 'Deep Dive', desc: 'Academic rigor, mechanisms & exam traps', icon: '🔬' },
    { id: 'mnemonics', label: 'Mnemonics', desc: 'Memory anchors & acronyms', icon: '⚡' },
    { id: 'direct', label: 'Direct Tutor', desc: 'Precise note-grounded answer', icon: '🎯' },
  ];

  return (
    <div id="rag-chat-view" className="flex flex-col h-[calc(100vh-140px)] min-h-[720px] max-w-5xl mx-auto space-y-5">
      
      {/* Scope & Mode Control Header */}
      <div className="bg-white/[0.08] backdrop-blur-2xl p-5 rounded-3xl border border-white/20 shadow-2xl flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
        
        {/* Note Scope Selector */}
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 text-indigo-300" />
          <span className="text-xs sm:text-sm font-bold text-white">Knowledge Scope:</span>
          <select
            id="rag-scope-select"
            value={selectedNoteScope}
            onChange={(e) => {
              setSelectedNoteScope(e.target.value);
              if (e.target.value !== 'all') {
                onSelectActiveNote(e.target.value);
              }
            }}
            className="px-4 py-2 rounded-2xl bg-white/[0.08] border border-white/25 text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-indigo-400 backdrop-blur-md shadow-inner cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-white">📚 All Active Notes ({notes.length} guides)</option>
            {notes.map((n) => (
              <option key={n.id} value={n.id} className="bg-slate-900 text-white">
                📄 {n.title} ({n.category})
              </option>
            ))}
          </select>
        </div>

        {/* Teaching Style Mode Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {modeOptions.map((opt) => (
            <button
              key={opt.id}
              id={`teaching-mode-btn-${opt.id}`}
              onClick={() => setTeachingMode(opt.id)}
              title={opt.desc}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all backdrop-blur-md ${
                teachingMode === opt.id
                  ? 'bg-white/25 text-white border border-white/40 shadow-md shadow-purple-900/30 scale-105'
                  : 'bg-white/[0.05] text-slate-300 hover:text-white hover:bg-white/[0.12] border border-white/10'
              }`}
            >
              <span className="text-sm">{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Clear Chat Button */}
        <button
          onClick={() => setMessages(messages.slice(0, 1))}
          className="p-2 rounded-2xl text-slate-300 hover:text-white hover:bg-white/10 text-xs font-semibold flex items-center gap-1.5 backdrop-blur-sm border border-white/10 transition-colors"
          title="Clear Conversation"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">Clear</span>
        </button>

      </div>

      {/* Chat Messages Scrolling Area */}
      <div className="flex-1 bg-white/[0.05] backdrop-blur-2xl rounded-3xl border border-white/15 p-6 sm:p-8 overflow-y-auto space-y-8 shadow-2xl">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-4 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-xs font-bold border border-white/25 backdrop-blur-md shadow-lg ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-purple-900/40'
                }`}
              >
                {isUser ? 'You' : 'AI'}
              </div>

              {/* Message Bubble */}
              <div
                className={`space-y-4 p-5 sm:p-6 text-sm sm:text-base leading-relaxed backdrop-blur-xl ${
                  isUser
                    ? 'bg-indigo-600/90 text-white rounded-3xl rounded-tr-none border border-white/25 shadow-xl shadow-indigo-950/40'
                    : 'bg-white/[0.08] border border-white/20 text-slate-100 rounded-3xl rounded-tl-none shadow-2xl'
                }`}
              >
                {/* Mode Tag if AI */}
                {!isUser && msg.mode && (
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/15 text-indigo-200 border border-white/20 capitalize backdrop-blur-sm shadow-inner">
                      {msg.mode.replace('_', ' ')} Mode
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSpeakText(msg.id, msg.text)}
                        title={speakingMsgId === msg.id ? 'Stop audio' : 'Read aloud'}
                        className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white transition-colors"
                      >
                        {speakingMsgId === msg.id ? (
                          <VolumeX className="w-4 h-4 text-emerald-300" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        title="Copy answer"
                        className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-4 h-4 text-emerald-300" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Formatted Text */}
                <div className="whitespace-pre-wrap font-sans space-y-3 text-slate-100 text-sm sm:text-base leading-relaxed">
                  {msg.text}
                </div>

                {/* Citations if available */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-3 border-t border-white/10 space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Grounded Source:</span>
                    {msg.citations.map((cite, i) => (
                      <div key={i} className="text-xs text-indigo-200 flex items-center gap-1.5 font-medium">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-300" />
                        <span>{cite.noteTitle}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Interactive Follow-up Knowledge Checks */}
                {msg.followUpChecks && msg.followUpChecks.length > 0 && (
                  <div className="pt-4 border-t border-white/10 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      Active Recall Follow-up Checks:
                    </div>
                    <div className="flex flex-col gap-2">
                      {msg.followUpChecks.map((check, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(check)}
                          className="text-left text-xs sm:text-sm p-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 hover:border-indigo-400/50 text-slate-200 hover:text-white transition-all flex items-center justify-between group backdrop-blur-md shadow-sm"
                        >
                          <span>{check}</span>
                          <span className="text-xs text-indigo-300 group-hover:translate-x-1 transition-transform font-bold flex-shrink-0 ml-2">Ask →</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-4 max-w-md mr-auto">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold animate-pulse border border-white/20 shadow-lg">
              AI
            </div>
            <div className="p-5 rounded-3xl bg-white/[0.08] backdrop-blur-xl border border-white/15 text-slate-200 text-xs sm:text-sm flex items-center gap-3 shadow-xl">
              <Sparkles className="w-5 h-5 text-indigo-300 animate-spin flex-shrink-0" />
              <span>Grounding answer in notes & crafting {teachingMode.replace('_', ' ')} explanation...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2.5 overflow-x-auto py-1.5 no-scrollbar flex-shrink-0">
        <span className="text-xs font-bold text-slate-300 whitespace-nowrap">Suggested:</span>
        {[
          'Explain the hardest concept using an analogy',
          'What are potential exam traps in this material?',
          'Create a mnemonic to memorize key lists',
          'Give me a real-world application of this',
        ].map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.18] border border-white/20 text-slate-200 hover:text-white text-xs font-semibold whitespace-nowrap backdrop-blur-md transition-all shadow-sm hover:scale-105"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Query Input Box */}
      <div className="bg-white/[0.09] backdrop-blur-2xl p-3 rounded-3xl border border-white/25 shadow-2xl flex items-center gap-3 flex-shrink-0">
        <input
          id="rag-query-input"
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder={`Ask anything about your notes in ${teachingMode.replace('_', ' ')} mode...`}
          className="flex-1 px-5 py-3 bg-transparent text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none"
        />
        <button
          id="send-rag-query-btn"
          onClick={() => handleSendMessage()}
          disabled={!inputQuery.trim() || isLoading}
          className="p-3.5 rounded-2xl bg-indigo-600/90 hover:bg-indigo-500 text-white disabled:opacity-40 shadow-xl shadow-indigo-600/30 transition-all border border-white/20 backdrop-blur-md hover:scale-105 cursor-pointer"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
};
