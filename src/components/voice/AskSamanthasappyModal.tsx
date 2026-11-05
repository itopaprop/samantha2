import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, 
  MicOff, 
  X, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  Send,
  HelpCircle,
  Volume2,
  AlertCircle,
  ExternalLink,
  RotateCw,
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const AskSamanthasappyModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [status, setStatus] = useState<'connecting' | 'listening' | 'thinking' | 'speaking' | 'ready'>('ready');
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastUserQuery, setLastUserQuery] = useState('');
  const [lastBotReply, setLastBotReply] = useState('');
  const [typedInput, setTypedInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const [isPermissionBannerDismissed, setIsPermissionBannerDismissed] = useState(false);
  const [showDetailedSteps, setShowDetailedSteps] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const isComponentMounted = useRef(true);
  const transcriptRef = useRef('');
  const silenceTimerRef = useRef<any>(null);
  const hasSpokenRef = useRef(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const nigerianVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const currentMimeTypeRef = useRef<string>('audio/webm');

  // Resolve sweetest African (Nigerian) female voice
  const resolveVoice = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    // 1. Direct Nigerian English voice
    const nigerianVoice = voices.find(v => {
      const l = (v.lang || '').toLowerCase();
      const n = (v.name || '').toLowerCase();
      return (
        l === 'en-ng' || 
        l.startsWith('en-ng') || 
        l.startsWith('en_ng') || 
        n.includes('nigeria') ||
        n.includes('en-ng') ||
        n.includes('chioma') ||
        n.includes('blessing')
      );
    });

    if (nigerianVoice) {
      nigerianVoiceRef.current = nigerianVoice;
      return;
    }

    // 2. African English voice (e.g. en-ZA, African, South Africa, Ayanda)
    const africanVoice = voices.find(v => {
      const l = (v.lang || '').toLowerCase();
      const n = (v.name || '').toLowerCase();
      return l === 'en-za' || n.includes('african') || n.includes('south africa') || n.includes('ayanda');
    });

    if (africanVoice) {
      nigerianVoiceRef.current = africanVoice;
      return;
    }

    // 3. Sweet young female English voices
    const sweetFemaleVoice = voices.find(v => {
      const n = (v.name || '').toLowerCase();
      return (
        n.includes('samantha') ||
        n.includes('karen') ||
        n.includes('victoria') ||
        n.includes('moira') ||
        n.includes('tessa') ||
        n.includes('natural') ||
        n.includes('google uk english female') ||
        n.includes('google us english') ||
        n.includes('zira')
      );
    }) || voices.find(v => (v.lang || '').startsWith('en'));

    if (sweetFemaleVoice) {
      nigerianVoiceRef.current = sweetFemaleVoice;
    }
  }, []);

  useEffect(() => {
    isComponentMounted.current = true;
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
        resolveVoice();
        window.speechSynthesis.onvoiceschanged = resolveVoice;
      }

      // Check real-time browser permission status changes
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'microphone' as PermissionName }).then((pStatus) => {
          if (pStatus.state === 'granted') {
            setMicPermissionDenied(false);
          } else if (pStatus.state === 'denied') {
            setMicPermissionDenied(true);
          }
          pStatus.onchange = () => {
            if (pStatus.state === 'granted') {
              setMicPermissionDenied(false);
              setIsPermissionBannerDismissed(true);
              startListeningSession();
            } else if (pStatus.state === 'denied') {
              setMicPermissionDenied(true);
            }
          };
        }).catch(() => {});
      }
    }

    return () => {
      isComponentMounted.current = false;
      cleanupAudio();
    };
  }, [resolveVoice]);

  const cleanupAudio = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch {}
      mediaRecorderRef.current = null;
    }
    if (synthRef.current) {
      try { synthRef.current.cancel(); } catch {}
    }
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      } catch {}
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch {}
      audioContextRef.current = null;
    }
    setAudioLevel(0);
    hasSpokenRef.current = false;
  };

  // Speak Samantha's reply using a sweet, youthful Nigerian female voice
  const speakText = (text: string) => {
    if (!synthRef.current) {
      setStatus('ready');
      return;
    }

    try {
      synthRef.current.cancel();

      const cleanText = text
        .replace(/[*_#`~>]/g, '')
        .replace(/•/g, ', ')
        .replace(/\b(MD|RN|NVQ)\b/g, (match) => {
          if (match === 'MD') return 'Managing Director';
          if (match === 'RN') return 'Registered Nurse';
          if (match === 'NVQ') return 'N V Q';
          return match;
        })
        .replace(/\n+/g, ' ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Sweet, vibrant, youthful 22yo Nigerian cadence
      utterance.pitch = 1.22;
      utterance.rate = 0.97;
      utterance.volume = 1.0;

      if (!nigerianVoiceRef.current) {
        resolveVoice();
      }

      if (nigerianVoiceRef.current) {
        utterance.voice = nigerianVoiceRef.current;
        utterance.lang = nigerianVoiceRef.current.lang || 'en-NG';
      } else {
        utterance.lang = 'en-NG';
      }

      utterance.onstart = () => {
        if (!isComponentMounted.current) return;
        setStatus('speaking');
      };

      utterance.onend = () => {
        if (!isComponentMounted.current) return;
        setStatus('ready');
        // Auto-resume listening so user can answer Samantha naturally
        if (!isMuted && isOpen) {
          setTimeout(() => {
            if (isOpen && !isMuted && isComponentMounted.current) {
              startListeningSession();
            }
          }, 350);
        }
      };

      utterance.onerror = () => {
        if (!isComponentMounted.current) return;
        setStatus('ready');
      };

      synthRef.current.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis playback notice:', e);
      setStatus('ready');
    }
  };

  // Start complete Voice Intake Session with VAD and dual-engine capture
  const startListeningSession = async () => {
    cleanupAudio();
    setStatus('connecting');
    setTranscript('');
    transcriptRef.current = '';
    hasSpokenRef.current = false;
    audioChunksRef.current = [];

    let stream: MediaStream | null = null;

    try {
      // 1. Request microphone stream with voice optimizations
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;
      setMicPermissionDenied(false);

      // 2. Setup Web Audio API RMS visualizer & Voice Activity Detection (VAD)
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.4;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkAudioLevel = () => {
          if (!isComponentMounted.current || !analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);

          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const currentLvl = Math.min(100, Math.round((avg / 128) * 100));
          setAudioLevel(currentLvl);

          // Voice Activity Detection: If audio level exceeds background threshold
          if (currentLvl > 16) {
            hasSpokenRef.current = true;

            // Reset silence timer while speech is active
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = null;
            }

            // Arm auto-submit timer: 1.5 seconds of silence after speaking
            silenceTimerRef.current = setTimeout(() => {
              if (hasSpokenRef.current && isComponentMounted.current) {
                commitAndSubmitVoice();
              }
            }, 1500);
          }

          animFrameRef.current = requestAnimationFrame(checkAudioLevel);
        };

        checkAudioLevel();
      }

      // 3. Setup continuous MediaRecorder capture
      const supportedMime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      currentMimeTypeRef.current = supportedMime || 'audio/webm';

      const recorder = supportedMime 
        ? new MediaRecorder(stream, { mimeType: supportedMime }) 
        : new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250);

      // 4. Also start Web Speech Recognition for live text transcription
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.maxAlternatives = 1;
          recognition.lang = navigator.language || 'en-US';

          recognition.onresult = (event: any) => {
            if (!isComponentMounted.current) return;
            let interimText = '';
            let finalText = '';

            for (let i = 0; i < event.results.length; ++i) {
              const res = event.results[i];
              if (res.isFinal) {
                finalText += res[0].transcript + ' ';
              } else {
                interimText += res[0].transcript;
              }
            }

            const combined = (finalText + interimText).trim();
            if (combined) {
              transcriptRef.current = combined;
              setTranscript(combined);
              hasSpokenRef.current = true;

              if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
              }
              silenceTimerRef.current = setTimeout(() => {
                if (transcriptRef.current.trim() && isComponentMounted.current) {
                  commitAndSubmitVoice();
                }
              }, 1400);
            }
          };

          recognition.onerror = (e: any) => {
            console.warn('SpeechRecognition notice:', e?.error);
          };

          recognition.onend = () => {
            if (status === 'listening' && isComponentMounted.current && !isMuted) {
              try { recognition.start(); } catch {}
            }
          };

          recognitionRef.current = recognition;
          recognition.start();
        } catch (e) {
          console.warn('SpeechRecognition launch note:', e);
        }
      }

      setStatus('listening');
    } catch (err: any) {
      console.warn('Microphone stream access notice:', err?.name || err?.message || err);
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError' || err?.message?.includes('Permission denied')) {
        setMicPermissionDenied(true);
        setIsPermissionBannerDismissed(false);
      }
      setStatus('ready');
      setShowTextInput(true);
    }
  };

  // Commit and submit the voice input (Transcript or Audio Blob)
  const commitAndSubmitVoice = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    const recognizedText = transcriptRef.current.trim();

    if (recognizedText) {
      handleSendQuery(recognizedText);
      return;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      setStatus('thinking');
      setTranscript('Listening to your spoken voice...');

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: currentMimeTypeRef.current });
        if (audioBlob.size > 2000) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Audio = reader.result as string;
            handleSendAudio(base64Audio, currentMimeTypeRef.current);
          };
          reader.readAsDataURL(audioBlob);
        } else {
          setStatus('listening');
          setTranscript('');
        }
      };

      try {
        mediaRecorderRef.current.stop();
      } catch {
        setStatus('ready');
      }
    } else {
      setStatus('ready');
    }
  };

  const handleOpenAgent = () => {
    setIsOpen(true);
    setLastUserQuery('');
    setLastBotReply('');

    if (synthRef.current) {
      synthRef.current.cancel();
    }

    startListeningSession();
  };

  const handleEndSession = () => {
    cleanupAudio();
    setStatus('ready');
    setIsOpen(false);
  };

  const handleSendAudio = async (base64Audio: string, mimeType: string) => {
    setStatus('thinking');
    setTranscript('Samantha is listening...');

    try {
      const res = await fetch('/api/ask-samanthasappy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64: base64Audio, mimeType, botType: 'ask_samanthasappy' })
      });
      const data = await res.json();
      const reply = data.reply || "Good day! Welcome to Samanthasappy Home Care. How may I assist you with our services today?";
      const heardText = data.transcribedText || 'Your spoken question';
      
      setLastUserQuery(heardText);
      setLastBotReply(reply);
      setTranscript('');
      speakText(reply);
    } catch (err) {
      console.warn('Audio query error:', err);
      const fallback = "Good day! Welcome to Samanthasappy Home Care. We provide 24/7 Residential Care, Domiciliary Home Visits, and Childcare Daycare. You can reach our care team directly on 08033569986.";
      setLastBotReply(fallback);
      speakText(fallback);
    }
  };

  const handleSendQuery = async (queryText: string) => {
    const clean = queryText.trim();
    if (!clean) return;

    cleanupAudio();

    setLastUserQuery(clean);
    setTranscript('');
    transcriptRef.current = '';
    setTypedInput('');
    setStatus('thinking');

    try {
      const res = await fetch('/api/ask-samanthasappy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: clean, botType: 'ask_samanthasappy' })
      });

      const data = await res.json();
      const reply = data.reply || "Good day! I am Samantha from Samanthasappy Home. How can I assist you with our elderly care, domiciliary visits, or bookings today?";

      setLastBotReply(reply);
      speakText(reply);
    } catch (err) {
      console.warn('Voice query error:', err);
      const fallback = "Good day! Welcome to Samanthasappy Home Care. We provide 24/7 Residential Care, Domiciliary Home Visits, and Childcare Daycare. You can reach our care team directly on 08033569986.";
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
      cleanupAudio();
      setStatus('ready');
    }
  };

  const handleOrbClick = () => {
    if (status === 'speaking') {
      if (synthRef.current) synthRef.current.cancel();
      startListeningSession();
    } else if (status === 'listening') {
      commitAndSubmitVoice();
    } else if (status === 'ready' || status === 'connecting') {
      startListeningSession();
    }
  };

  // Dedicated app full URL
  const standaloneUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-pre-xkedzizgx7ogjh4ham3bh5-275647488328.europe-west1.run.app';

  return (
    <>
      {/* FLOATING TRIGGER BUTTON (When closed) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
          <button
            onClick={handleOpenAgent}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#0b101c] hover:bg-[#11192e] text-white shadow-2xl border border-slate-700/80 hover:border-purple-500/60 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-4 focus:ring-purple-500/20"
            title="Open Ask Samanthasappy Voice Agent"
            aria-label="Open Ask Samanthasappy Voice Agent"
          >
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

      {/* VOICE AGENT MODAL */}
      {isOpen && (
        <div 
          className={`fixed z-50 transition-all duration-300 animate-fade-in ${
            isExpanded 
              ? 'inset-3 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[460px] sm:h-[660px]' 
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[370px] h-[525px]'
          }`}
        >
          <div className="w-full h-full bg-[#0b101c] rounded-3xl border border-slate-800/90 shadow-2xl flex flex-col justify-between overflow-hidden relative">
            
            {/* TOP HEADER */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/5 shrink-0 bg-[#0a0f1a]/80 backdrop-blur-sm">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-white tracking-tight leading-tight">
                    Ask Samanthasappy
                  </h3>
                  <div className="text-[10px] text-purple-300 font-medium flex items-center gap-1">
                    <span>Sweet Nigerian Care Guide</span>
                    <span>•</span>
                    <span>22 yrs</span>
                  </div>
                </div>
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

            {/* ACTIONABLE MIC PERMISSION UNBLOCK BANNER */}
            {micPermissionDenied && !isPermissionBannerDismissed && (
              <div className="mx-3.5 mt-2.5 p-3.5 bg-amber-950/70 border border-amber-500/40 rounded-2xl text-xs text-amber-200 shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-bold text-amber-100 text-[13px]">Microphone Blocked in Browser</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPermissionBannerDismissed(true)}
                    className="p-1 text-amber-400 hover:text-amber-100 transition-colors cursor-pointer"
                    title="Dismiss notification"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="mt-1 text-[11px] text-amber-200/90 leading-relaxed">
                  Your browser address bar blocked microphone access for this site.
                </p>

                {/* Step-by-step guidance */}
                <div className="mt-2.5 p-2 bg-amber-900/40 rounded-xl border border-amber-500/20 text-[11px] space-y-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-100">
                    <Lock className="w-3.5 h-3.5 text-amber-300" />
                    <span>How to unblock in 5 seconds:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 pl-1 text-amber-200/90">
                    <li>Look at your browser address bar at the top</li>
                    <li>Click the <b>Lock (🔒)</b> or <b>Microphone</b> icon next to the URL</li>
                    <li>Change <b>Microphone</b> from Blocked to <b>Allow</b></li>
                  </ol>
                </div>

                {/* Action Buttons */}
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={startListeningSession}
                    className="flex-1 py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Retry Microphone</span>
                  </button>

                  <a
                    href={standaloneUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 bg-slate-900/80 hover:bg-slate-800 text-amber-200 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                    <span>Open in New Tab</span>
                  </a>
                </div>
              </div>
            )}

            {/* CENTER ORB & VOICE STATUS AREA */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-3.5 text-center select-none overflow-y-auto">
              
              {/* Glowing Purple Microphone Orb with Real Audio Reactive Scaling */}
              <div className="relative flex items-center justify-center">
                {(status === 'listening' || status === 'speaking' || status === 'connecting') && (
                  <>
                    <span 
                      style={{ transform: `scale(${1 + (audioLevel / 100) * 0.45})` }}
                      className="absolute w-36 h-36 rounded-full border border-purple-500/30 transition-transform duration-75 pointer-events-none"
                    ></span>
                    <span 
                      style={{ opacity: 0.15 + (audioLevel / 100) * 0.6 }}
                      className="absolute w-44 h-44 rounded-full bg-purple-600/20 blur-md -z-10 animate-pulse duration-700 pointer-events-none"
                    ></span>
                  </>
                )}

                {/* Interactive Orb */}
                <button
                  type="button"
                  onClick={handleOrbClick}
                  aria-label={status === 'listening' ? "Tap to send voice" : status === 'speaking' ? "Tap to interrupt and speak" : "Tap to speak"}
                  className={`w-32 h-32 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center transition-all duration-150 relative cursor-pointer focus:outline-none focus:ring-4 focus:ring-purple-500/30 ${
                    status === 'speaking'
                      ? 'border-2 border-purple-400/90 bg-purple-950/50 shadow-[0_0_35px_rgba(168,85,247,0.45)]'
                      : status === 'listening'
                      ? 'border-2 border-purple-500/90 bg-purple-950/40 shadow-[0_0_30px_rgba(168,85,247,0.4)] scale-105'
                      : 'border border-purple-500/30 bg-purple-950/15 hover:border-purple-400/70 hover:scale-105'
                  }`}
                >
                  {status === 'speaking' ? (
                    <div className="flex items-center gap-1.5 h-10">
                      <span className="w-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s] h-6"></span>
                      <span className="w-1.5 bg-purple-300 rounded-full animate-bounce [animation-delay:-0.15s] h-10"></span>
                      <span className="w-1.5 bg-purple-400 rounded-full animate-bounce h-5"></span>
                      <span className="w-1.5 bg-purple-300 rounded-full animate-bounce [animation-delay:-0.2s] h-8"></span>
                    </div>
                  ) : status === 'listening' ? (
                    <div className="flex flex-col items-center gap-1">
                      <Mic className="w-11 h-11 text-purple-300 animate-pulse" />
                      <div className="flex items-center gap-1 h-3 mt-1">
                        <span 
                          style={{ height: `${Math.max(4, (audioLevel / 100) * 16)}px` }}
                          className="w-1 bg-cyan-400 rounded-full transition-all duration-75"
                        ></span>
                        <span 
                          style={{ height: `${Math.max(4, (audioLevel / 100) * 20)}px` }}
                          className="w-1 bg-purple-400 rounded-full transition-all duration-75"
                        ></span>
                        <span 
                          style={{ height: `${Math.max(4, (audioLevel / 100) * 16)}px` }}
                          className="w-1 bg-cyan-400 rounded-full transition-all duration-75"
                        ></span>
                      </div>
                    </div>
                  ) : (
                    <Mic className="w-11 h-11 text-purple-400" />
                  )}
                </button>
              </div>

              {/* Status Headline */}
              <div className="space-y-1.5">
                <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {status === 'connecting' && "Connecting..."}
                  {status === 'listening' && (transcript ? "Taking your voice..." : "Listening... Speak now")}
                  {status === 'thinking' && "Samantha is thinking..."}
                  {status === 'speaking' && "Samantha is speaking..."}
                  {status === 'ready' && (isMuted ? "Microphone Muted" : micPermissionDenied ? "Microphone Needs Permission" : "Ready to listen")}
                </div>

                {/* Subtitle / Live Transcript / AI Response */}
                <div className="min-h-[46px] flex items-center justify-center px-2">
                  {transcript ? (
                    <div className="space-y-1">
                      <div className="text-xs text-purple-100 font-medium px-3.5 py-2 bg-purple-950/60 rounded-xl border border-purple-500/40 max-w-[290px] shadow-sm leading-relaxed">
                        "{transcript}"
                      </div>
                      <div className="text-[10px] text-purple-300 font-semibold animate-pulse">
                        Taking your voice... (Pause or tap orb to send)
                      </div>
                    </div>
                  ) : lastBotReply && status === 'speaking' ? (
                    <div className="text-xs text-slate-200 px-3.5 py-2 bg-slate-900/80 rounded-2xl border border-purple-500/20 max-w-[310px] line-clamp-3 leading-relaxed shadow-sm">
                      {lastBotReply}
                    </div>
                  ) : status === 'listening' ? (
                    <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                      <span>Speak into your microphone in English or Pidgin</span>
                    </div>
                  ) : micPermissionDenied ? (
                    <div className="text-xs text-amber-300/90 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Allow mic in address bar or tap a question below</span>
                    </div>
                  ) : status === 'ready' ? (
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>Tap the mic orb above to talk with Samantha</span>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400">
                      Sweet 22yo Nigerian Care Coordinator
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Prompt Chips (Always clickable & speaks aloud) */}
              <div className="flex flex-wrap justify-center gap-1.5 pt-0.5">
                {[
                  "Care services?",
                  "Visiting hours?",
                  "Book consultation",
                  "Domiciliary care?"
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendQuery(chip)}
                    className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-purple-950/80 text-slate-300 hover:text-purple-200 border border-slate-700/60 hover:border-purple-500/50 text-[11px] font-medium transition-all cursor-pointer shadow-xs"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Text Input (Always available) */}
              {(showTextInput || micPermissionDenied) && (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (typedInput.trim()) handleSendQuery(typedInput);
                  }}
                  className="w-full flex items-center gap-2 pt-1"
                >
                  <input
                    type="text"
                    value={typedInput}
                    onChange={(e) => setTypedInput(e.target.value)}
                    placeholder="Ask Samantha a question (she will speak)..."
                    className="flex-1 bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white cursor-pointer transition-colors shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>

            {/* BOTTOM CONTROLS */}
            <div className="p-4 sm:p-5 border-t border-white/5 bg-[#0a0f1a] flex items-center gap-3 shrink-0">
              {/* Circular Mic Button */}
              <button
                type="button"
                onClick={handleToggleMic}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer border shadow-md shrink-0 ${
                  isMuted 
                    ? 'bg-rose-950/60 border-rose-700/60 text-rose-300 hover:bg-rose-900/80' 
                    : status === 'listening'
                    ? 'bg-purple-900/50 border-purple-500/70 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                    : 'bg-slate-800/90 hover:bg-slate-750 border-slate-700/70 text-slate-300'
                }`}
                title={isMuted ? "Unmute Microphone" : "Mute / Unmute"}
                aria-label={isMuted ? "Unmute Microphone" : "Mute / Unmute"}
              >
                {isMuted ? <MicOff className="w-5 h-5 text-rose-400" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Done Speaking / End Session Button */}
              {status === 'listening' ? (
                <button
                  type="button"
                  onClick={commitAndSubmitVoice}
                  className="flex-1 py-3 px-5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all cursor-pointer text-center active:scale-98 shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Done Speaking</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleEndSession}
                  className="flex-1 py-3 px-5 rounded-2xl bg-slate-800/80 hover:bg-slate-750 hover:border-slate-600 text-slate-200 border border-slate-700/60 font-semibold text-sm transition-all cursor-pointer text-center active:scale-98 shadow-sm"
                >
                  End Session
                </button>
              )}

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
