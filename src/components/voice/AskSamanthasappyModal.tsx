import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  X, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Send,
  HelpCircle
} from 'lucide-react';

export const AskSamanthasappyModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [status, setStatus] = useState<'connecting' | 'listening' | 'thinking' | 'speaking' | 'ready'>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastUserQuery, setLastUserQuery] = useState('');
  const [lastBotReply, setLastBotReply] = useState('');
  const [typedInput, setTypedInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const isComponentMounted = useRef(true);

  // Initialize Speech Synthesis and Speech Recognition
  useEffect(() => {
    isComponentMounted.current = true;
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setStatus('listening');
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition notice:', event?.error);
          setStatus('ready');
        };

        recognition.onend = () => {
          // If transcript has text, submit query
          setTranscript(prev => {
            if (prev.trim()) {
              handleSendQuery(prev.trim());
            } else {
              setStatus('ready');
            }
            return '';
          });
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      isComponentMounted.current = false;
      stopAllAudio();
    };
  }, []);

  const stopAllAudio = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }
    if (synthRef.current) {
      try { synthRef.current.cancel(); } catch {}
    }
  };

  const startListeningSession = () => {
    stopAllAudio();
    setStatus('connecting');
    setTranscript('');

    // Smooth connection transition
    setTimeout(() => {
      if (!isComponentMounted.current) return;
      if (recognitionRef.current && !isMuted) {
        try {
          recognitionRef.current.start();
          setStatus('listening');
        } catch (e) {
          console.warn('Could not start recognition:', e);
          setStatus('ready');
        }
      } else {
        setStatus('ready');
      }
    }, 700);
  };

  const handleOpenAgent = () => {
    setIsOpen(true);
    setLastUserQuery('');
    setLastBotReply('');
    startListeningSession();
  };

  const handleEndSession = () => {
    stopAllAudio();
    setStatus('ready');
    setIsOpen(false);
  };

  const speakText = (text: string) => {
    if (!synthRef.current) {
      setStatus('ready');
      return;
    }

    try {
      synthRef.current.cancel();

      const cleanText = text
        .replace(/[*_#`~]/g, '')
        .replace(/•/g, ', ')
        .replace(/\n+/g, ' ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;

      const voices = synthRef.current.getVoices();
      const naturalVoice = voices.find(v => 
        (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Moira') || v.name.includes('Victoria')) &&
        v.lang.startsWith('en')
      ) || voices.find(v => v.lang.startsWith('en'));

      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }

      utterance.onstart = () => {
        setStatus('speaking');
      };

      utterance.onend = () => {
        setStatus('ready');
        // Auto resume listening after Samantha finishes answering
        if (!isMuted && isOpen && recognitionRef.current) {
          setTimeout(() => {
            if (isOpen && !isMuted) {
              try { recognitionRef.current.start(); } catch {}
            }
          }, 400);
        }
      };

      utterance.onerror = () => {
        setStatus('ready');
      };

      synthRef.current.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      setStatus('ready');
    }
  };

  const handleSendQuery = async (queryText: string) => {
    const clean = queryText.trim();
    if (!clean) return;

    stopAllAudio();
    setLastUserQuery(clean);
    setTypedInput('');
    setStatus('thinking');

    try {
      const res = await fetch('/api/ask-samanthasappy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: clean, botType: 'ask_samanthasappy' })
      });

      const data = await res.json();
      const reply = data.reply || "I am Ask Samanthasappy, your dedicated care guide for Samanthasappy Home. How can I assist you with our elderly care, domiciliary visits, or bookings?";

      setLastBotReply(reply);
      speakText(reply);
    } catch (err) {
      console.warn('Voice query error:', err);
      const fallback = "Samanthasappy Home provides 24/7 Residential Care, Domiciliary Visits, and Childcare Daycare. You can reach our care leads directly at 08033569986.";
      setLastBotReply(fallback);
      speakText(fallback);
    }
  };

  const handleToggleMic = () => {
    if (isMuted) {
      setIsMuted(false);
      startListeningSession();
    } else {
      setIsMuted(true);
      stopAllAudio();
      setStatus('ready');
    }
  };

  return (
    <>
      {/* FLOATING TRIGGER BUTTON (When closed) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
          <button
            onClick={handleOpenAgent}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#0b101c] hover:bg-[#11192e] text-white shadow-2xl border border-slate-700/80 hover:border-purple-500/60 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-4 focus:ring-purple-500/20"
            title="Open Ask Samanthasappy"
            aria-label="Open Ask Samanthasappy"
          >
            {/* Soft glowing purple aura */}
            <span className="absolute -inset-1 rounded-full bg-purple-500/20 group-hover:bg-purple-500/30 blur-xs -z-10 animate-pulse duration-1000"></span>

            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            
            <div className="w-6 h-6 rounded-full bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Mic className="w-3.5 h-3.5" />
            </div>

            <span className="font-bold text-xs sm:text-sm tracking-tight text-white pr-1">
              Ask Samanthasappy
            </span>
          </button>
        </div>
      )}

      {/* VOICE AGENT MODAL (Exactly matching attached screenshot) */}
      {isOpen && (
        <div 
          className={`fixed z-50 transition-all duration-300 animate-fade-in ${
            isExpanded 
              ? 'inset-3 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[420px] sm:h-[620px]' 
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[350px] h-[490px]'
          }`}
        >
          <div className="w-full h-full bg-[#0b101c] rounded-3xl border border-slate-800/90 shadow-2xl flex flex-col justify-between overflow-hidden relative">
            
            {/* TOP HEADER */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/5 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                <h3 className="font-bold text-base sm:text-lg text-white tracking-tight">
                  Ask Samanthasappy
                </h3>
              </div>

              <div className="flex items-center gap-1.5 text-slate-400">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                  title={isExpanded ? "Minimize" : "Expand"}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleEndSession}
                  className="p-1.5 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                  title="Close Agent"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* CENTER ORB & VOICE STATUS AREA */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6 text-center select-none overflow-y-auto">
              
              {/* Glowing Purple Microphone Orb */}
              <div className="relative flex items-center justify-center">
                {/* Expanding pulse animation rings when listening or speaking */}
                {(status === 'listening' || status === 'speaking' || status === 'connecting') && (
                  <>
                    <span className="absolute w-36 h-36 rounded-full border border-purple-500/20 animate-ping duration-1000"></span>
                    <span className="absolute w-44 h-44 rounded-full bg-purple-600/5 blur-md -z-10 animate-pulse duration-1000"></span>
                  </>
                )}

                {/* Orb Container */}
                <div 
                  onClick={status === 'ready' ? startListeningSession : undefined}
                  className={`w-32 h-32 sm:w-36 sm:h-36 rounded-full flex items-center justify-center transition-all duration-300 relative ${
                    status === 'speaking'
                      ? 'border-2 border-purple-400/80 bg-purple-950/30 shadow-[0_0_35px_rgba(168,85,247,0.35)]'
                      : status === 'listening'
                      ? 'border-2 border-purple-500/50 bg-purple-950/25 shadow-[0_0_25px_rgba(168,85,247,0.25)]'
                      : 'border border-purple-500/30 bg-purple-950/15'
                  } ${status === 'ready' ? 'cursor-pointer hover:border-purple-400 hover:scale-105' : ''}`}
                >
                  {status === 'speaking' ? (
                    // Equalizer bars when speaking
                    <div className="flex items-center gap-1.5 h-10">
                      <span className="w-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s] h-6"></span>
                      <span className="w-1.5 bg-purple-300 rounded-full animate-bounce [animation-delay:-0.15s] h-10"></span>
                      <span className="w-1.5 bg-purple-400 rounded-full animate-bounce h-5"></span>
                      <span className="w-1.5 bg-purple-300 rounded-full animate-bounce [animation-delay:-0.2s] h-8"></span>
                    </div>
                  ) : (
                    <Mic className={`w-12 h-12 transition-transform ${
                      status === 'listening' ? 'text-purple-300 scale-110' : 'text-purple-400'
                    }`} />
                  )}
                </div>
              </div>

              {/* Status Headline (Exactly like screenshot) */}
              <div className="space-y-2">
                <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {status === 'connecting' && "Connecting..."}
                  {status === 'listening' && (transcript ? "Listening to you..." : "Listening...")}
                  {status === 'thinking' && "Thinking..."}
                  {status === 'speaking' && "Speaking..."}
                  {status === 'ready' && (isMuted ? "Microphone Muted" : "Ready to listen")}
                </div>

                {/* Subtitle / Live Transcript / AI Response */}
                <div className="min-h-[44px] flex items-center justify-center">
                  {transcript ? (
                    <div className="text-xs text-purple-200 px-3 py-1.5 bg-purple-950/40 rounded-xl border border-purple-500/30 max-w-[280px] truncate animate-pulse">
                      "{transcript}"
                    </div>
                  ) : lastBotReply && status === 'speaking' ? (
                    <div className="text-xs text-slate-300 px-3 py-2 bg-slate-900/60 rounded-xl border border-slate-800 max-w-[300px] line-clamp-3 leading-relaxed">
                      {lastBotReply}
                    </div>
                  ) : status === 'ready' ? (
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>Tap mic below or speak about Samanthasappy Home</span>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500">
                      Official Voice Agent for Samanthasappy Home
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Prompt Suggestions */}
              {status === 'ready' && (
                <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                  {[
                    "Care services?",
                    "Visiting hours?",
                    "Book consultation"
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendQuery(chip)}
                      className="px-2.5 py-1 rounded-full bg-slate-800/70 hover:bg-purple-950/60 text-slate-300 hover:text-purple-200 border border-slate-700/60 hover:border-purple-500/40 text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              {/* Optional Text Input for quiet environments */}
              {showTextInput && (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (typedInput.trim()) handleSendQuery(typedInput);
                  }}
                  className="w-full flex items-center gap-2 pt-2"
                >
                  <input
                    type="text"
                    value={typedInput}
                    onChange={(e) => setTypedInput(e.target.value)}
                    placeholder="Type your question here..."
                    className="flex-1 bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>

            {/* BOTTOM CONTROLS (Exactly matching screenshot) */}
            <div className="p-5 border-t border-white/5 bg-[#0a0f1a] flex items-center gap-3 shrink-0">
              {/* Circular Mic Button */}
              <button
                type="button"
                onClick={handleToggleMic}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer border shadow-md shrink-0 ${
                  isMuted 
                    ? 'bg-rose-950/60 border-rose-700/60 text-rose-300 hover:bg-rose-900/80' 
                    : status === 'listening'
                    ? 'bg-purple-900/40 border-purple-500/60 text-purple-200 hover:bg-purple-900/60'
                    : 'bg-slate-800/90 hover:bg-slate-750 border-slate-700/70 text-slate-300'
                }`}
                title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
                aria-label={isMuted ? "Unmute Microphone" : "Mute Microphone"}
              >
                {isMuted ? <MicOff className="w-5 h-5 text-rose-400" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* "End Session" Pill Button */}
              <button
                type="button"
                onClick={handleEndSession}
                className="flex-1 py-3 px-5 rounded-2xl bg-slate-800/80 hover:bg-slate-750 hover:border-slate-600 text-slate-200 border border-slate-700/60 font-semibold text-sm transition-all cursor-pointer text-center active:scale-98 shadow-sm"
              >
                End Session
              </button>

              {/* Text Input Toggle Icon */}
              <button
                type="button"
                onClick={() => setShowTextInput(!showTextInput)}
                className={`p-2.5 rounded-xl border text-xs transition-colors cursor-pointer shrink-0 ${
                  showTextInput 
                    ? 'bg-purple-950/60 border-purple-500/50 text-purple-300' 
                    : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:text-slate-200'
                }`}
                title="Toggle Text Input"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
