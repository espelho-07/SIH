import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { assistantApi, AssistantActionChip } from '@/api/assistantApi';
import { Button } from '@/components/ui/Button';
import {
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  AlertTriangle,
  Stethoscope,
  Building2,
  Calendar,
  Activity,
  RefreshCw,
  Clock,
  ArrowRight,
  Pill,
  HeartPulse,
  Flame,
  CheckCircle2,
  Layers,
  Database,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isEmergency?: boolean;
  intent?: string;
  sources?: string[];
  latencyMs?: number;
  actionChips?: AssistantActionChip[];
  doctor?: { name: string; specialty: string; room?: string };
}

function renderInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-slate-950">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={index} className="italic text-slate-700">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono text-teal-800">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export const PatientChatbotWidget: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'ml'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // ML Predictor tab state
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [symptomInput, setSymptomInput] = useState('');
  const [mlLoading, setMlLoading] = useState(false);
  const [mlResults, setMlResults] = useState<any>(null);

  const sessionIdRef = useRef<string>(
    sessionStorage.getItem('aarogya_session_id') || `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  );
  const historyRef = useRef<{ role: string; content: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const patientName = user?.name ? user.name.split(' ')[0] : 'Citizen';

  // Initialize Web Speech Recognition
  useEffect(() => {
    sessionStorage.setItem('aarogya_session_id', sessionIdRef.current);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'gu-IN'; // Multi-lingual with Gujarati priority

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript) {
          setInputValue(currentTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        stopListening();
      };

      recognition.onend = () => {
        stopListening();
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading, activeTab]);

  const startListening = () => {
    if (!recognitionRef.current) return;
    try {
      setRecordingSeconds(0);
      setIsListening(true);
      recognitionRef.current.start();
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Failed to start speech recognition:', err);
      stopListening();
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      recognitionRef.current?.stop();
    } catch (e) {
      // ignore
    }
  };

  const handleAudioPlayback = async (msgId: string, text: string) => {
    if (playingAudioId === msgId) {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      setPlayingAudioId(null);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      return;
    }

    setPlayingAudioId(msgId);

    // Try Sarvam TTS first
    try {
      const cleanText = text.replace(/[*_#`]/g, '').slice(0, 350);
      const ttsData = await assistantApi.textToSpeech(cleanText, 'gu-IN', 'pooja');
      if (ttsData && ttsData.audio_base64) {
        const audio = new Audio(`data:audio/wav;base64,${ttsData.audio_base64}`);
        audioElementRef.current = audio;
        audio.onended = () => setPlayingAudioId(null);
        audio.onerror = () => {
          setPlayingAudioId(null);
          fallbackBrowserSpeech(cleanText);
        };
        await audio.play();
        return;
      }
    } catch (e) {
      console.warn('Sarvam TTS failed, using browser speech:', e);
    }

    // Fallback to browser Web Speech API
    fallbackBrowserSpeech(text.replace(/[*_#`]/g, '').slice(0, 300));
  };

  const fallbackBrowserSpeech = (cleanText: string) => {
    if (!('speechSynthesis' in window)) {
      setPlayingAudioId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.onend = () => setPlayingAudioId(null);
    utterance.onerror = () => setPlayingAudioId(null);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const queryText = (textToSend || inputValue).trim();
    if (!queryText || loading) return;

    stopListening();

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    const updatedHistory = [...historyRef.current, { role: 'user', content: queryText }];
    historyRef.current = updatedHistory;

    try {
      const res = await assistantApi.sendMessage({
        message: queryText,
        userId: user?.id || 'PAT-1001',
        sessionId: sessionIdRef.current,
        history: updatedHistory.slice(-6),
      });

      if (res.data) {
        const botMsg: ChatMessage = {
          id: `bot_${Date.now()}`,
          sender: 'assistant',
          text: res.data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isEmergency: res.data.is_emergency,
          intent: res.data.intent,
          sources: res.data.sources,
          latencyMs: res.data.latency_ms,
          actionChips: res.data.actionChips,
        };

        setMessages((prev) => [...prev, botMsg]);
        historyRef.current.push({ role: 'assistant', content: res.data.answer });

        if (ttsEnabled) {
          handleAudioPlayback(botMsg.id, res.data.answer);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            sender: 'assistant',
            text: '⚠️ Could not connect to the healthcare model. Please check the network or retry.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ Model Service Error: ${err.message || 'Unknown error'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = async () => {
    await assistantApi.resetSession(sessionIdRef.current);
    sessionIdRef.current = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    sessionStorage.setItem('aarogya_session_id', sessionIdRef.current);
    historyRef.current = [];
    setMessages([]);
    setInputValue('');
  };

  const handleActionClick = (chip: AssistantActionChip) => {
    if (chip.action === 'NAVIGATE' && chip.path) {
      setIsOpen(false);
      navigate(chip.path);
    } else if (chip.action === 'EMERGENCY') {
      window.open(`tel:${chip.phone || '108'}`, '_self');
    } else if (chip.label) {
      handleSendMessage(chip.label.replace(/^[^\w]+/, '').trim());
    }
  };

  const handleRunMlPrediction = async () => {
    if (selectedSymptoms.length === 0) return;
    setMlLoading(true);
    try {
      const data = await assistantApi.predictDisease(selectedSymptoms, 5);
      setMlResults(data);
    } catch (e) {
      console.warn('ML Prediction failed:', e);
    } finally {
      setMlLoading(false);
    }
  };

  const quickSymptoms = [
    'fever',
    'headache',
    'cough',
    'sore throat',
    'chest pain',
    'shortness of breath',
    'dizziness',
    'nausea',
    'joint pain',
    'abdominal pain',
    'fatigue',
    'cold',
  ];

  return (
    <>
      {/* Corner Floating Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-5 z-40 flex items-center gap-2 group">
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg border border-teal-500/30 backdrop-blur-xs group-hover:scale-105 transition-all">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>AarogyaMitra AI</span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="relative h-14 w-14 rounded-full bg-gradient-to-tr from-teal-800 via-teal-600 to-emerald-400 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-2 border-white cursor-pointer focus:outline-none ring-4 ring-teal-500/20"
            aria-label="Open Medical AI Chatbot"
          >
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-400 rounded-full border-2 border-white animate-ping"></div>
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-white"></div>
            <Sparkles className="h-7 w-7 text-white drop-shadow-xs" />
          </button>
        </div>
      )}

      {/* Main Chatbot Window */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 w-full sm:w-[450px] sm:h-[680px] sm:max-h-[90vh] bg-white sm:rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-950 text-white p-4 pb-3 overflow-hidden shrink-0 shadow-sm">
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-300 p-0.5 shadow-md flex items-center justify-center">
                  <div className="h-full w-full bg-slate-900/60 rounded-[14px] flex items-center justify-center backdrop-blur-xs">
                    <Stethoscope className="h-5 w-5 text-emerald-300" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm text-white tracking-tight">
                      AarogyaMitra AI
                    </h3>
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full">
                      Model Live
                    </span>
                  </div>
                  <p className="text-[10px] text-teal-200/80 font-mono">
                    Gemini 3.1 + ML Differential (Port 8000)
                  </p>
                </div>
              </div>

              {/* Header Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleResetChat}
                  title="New Consultation (Clear Memory)"
                  className="text-teal-200 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  title={ttsEnabled ? 'Mute auto-read' : 'Enable auto-read in Gujarati'}
                  className="text-teal-200 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {ttsEnabled ? <Volume2 className="h-4 w-4 text-emerald-400" /> : <VolumeX className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-teal-200 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Navigation Switch Tabs */}
            <div className="flex gap-2 mt-3 pt-2 border-t border-white/10">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'chat'
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'bg-white/10 text-slate-200 hover:bg-white/15'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                AI Chat Consultation
              </button>
              <button
                onClick={() => setActiveTab('ml')}
                className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'ml'
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'bg-white/10 text-slate-200 hover:bg-white/15'
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                ML Disease Classifier
              </button>
            </div>
          </div>

          {/* TAB 1: AI CHAT CONSULTATION */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFB]">
              {/* Quick Prompts Bar */}
              <div className="bg-white border-b border-slate-200/80 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                  Quick:
                </span>
                <button
                  onClick={() => handleSendMessage('સાહેબ મને ત્રણ દિવસથી તાવ છે, શરીર દુખે છે ને બહુ નબળાઈ લાગે છે')}
                  className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-medium transition-colors cursor-pointer"
                >
                  🎙️ તાવ અને નબળાઈ
                </button>
                <button
                  onClick={() => handleSendMessage('Which medicine is available for fever in Rajkot hospitals?')}
                  className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 text-[11px] font-medium transition-colors cursor-pointer"
                >
                  💊 Fever Medicine Stock
                </button>
                <button
                  onClick={() => handleSendMessage('Which hospital provides Maternal Care in Rajkot?')}
                  className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 text-[11px] font-medium transition-colors cursor-pointer"
                >
                  🏥 Maternal Care
                </button>
                <button
                  onClick={() => handleSendMessage('What chronic conditions does PAT-1001 have?')}
                  className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 text-[11px] font-medium transition-colors cursor-pointer"
                >
                  👤 PAT-1001 EHR
                </button>
                <button
                  onClick={() => handleSendMessage('I have sudden crushing chest pain and cannot breathe!')}
                  className="shrink-0 px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-medium transition-colors cursor-pointer"
                >
                  🚨 Chest Pain
                </button>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs">
                {/* Welcome Card */}
                {messages.length === 0 && (
                  <div className="space-y-2.5 animate-in fade-in-50 duration-200">
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="h-6 w-6 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                          AI
                        </div>
                        <span className="font-bold text-slate-900">
                          AarogyaMitra Clinical Assistant
                        </span>
                        <span className="text-[10px] text-slate-400 ml-auto">Now</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed">
                        <strong>નમસ્તે {patientName}!</strong> I am your grounded Healthcare AI assistant connected to MongoDB Atlas, ML Disease Predictor, and Gemini Reasoning.
                      </p>
                      <p className="text-slate-600 mt-1.5">
                        You can ask any healthcare question or tap the 🎙️ <strong>Mic</strong> to speak in Gujarati, Hindi, or English.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div
                        onClick={() => handleSendMessage('Which medicine is available for fever in Rajkot?')}
                        className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-2xs transition-all cursor-pointer"
                      >
                        <div className="text-teal-700 font-bold text-xs flex items-center gap-1 mb-1">
                          <Pill className="h-3.5 w-3.5" /> Medicine Stock
                        </div>
                        <p className="text-[10px] text-slate-500">Live dispensary inventory</p>
                      </div>

                      <div
                        onClick={() => handleSendMessage('Which hospital is in Gondal and what are the hours?')}
                        className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-2xs transition-all cursor-pointer"
                      >
                        <div className="text-teal-700 font-bold text-xs flex items-center gap-1 mb-1">
                          <Building2 className="h-3.5 w-3.5" /> Hospitals & Timings
                        </div>
                        <p className="text-[10px] text-slate-500">PHC & District facilities</p>
                      </div>

                      <div
                        onClick={() => handleSendMessage('I have high fever, headache, body ache and cough')}
                        className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-2xs transition-all cursor-pointer"
                      >
                        <div className="text-teal-700 font-bold text-xs flex items-center gap-1 mb-1">
                          <HeartPulse className="h-3.5 w-3.5" /> Symptom Checker
                        </div>
                        <p className="text-[10px] text-slate-500">ML Differential triage</p>
                      </div>

                      <div
                        onClick={() => handleSendMessage('What chronic conditions does patient PAT-1001 have?')}
                        className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-teal-400 hover:shadow-2xs transition-all cursor-pointer"
                      >
                        <div className="text-teal-700 font-bold text-xs flex items-center gap-1 mb-1">
                          <Database className="h-3.5 w-3.5" /> Patient EHR
                        </div>
                        <p className="text-[10px] text-slate-500">Allergies & past visits</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Conversation List */}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[92%] rounded-2xl p-3.5 shadow-2xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-br from-teal-800 to-teal-950 text-white rounded-tr-xs'
                          : msg.isEmergency
                          ? 'bg-rose-50 border border-rose-200 text-rose-950 rounded-tl-xs'
                          : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs'
                      }`}
                    >
                      {/* Message Header for Bot */}
                      {msg.sender === 'assistant' && (
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-[11px]">
                          <div className="flex items-center gap-1.5 text-teal-900 font-bold">
                            <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                            <span>AarogyaMitra Response</span>
                          </div>

                          <button
                            onClick={() => handleAudioPlayback(msg.id, msg.text)}
                            title="Listen in Gujarati Voice (Sarvam Bulbul TTS)"
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                              playingAudioId === msg.id
                                ? 'bg-emerald-600 text-white animate-pulse'
                                : 'bg-teal-50 hover:bg-teal-100 text-teal-800'
                            }`}
                          >
                            <Volume2 className="h-3 w-3" />
                            <span>{playingAudioId === msg.id ? 'Playing...' : '🔊 Read Aloud'}</span>
                          </button>
                        </div>
                      )}

                      {/* Exact Model Response Formatted */}
                      <div className="space-y-2 text-xs leading-relaxed">
                        {msg.text.split('\n').map((line, lIdx) => {
                          const trimmed = line.trim();
                          if (!trimmed) return <div key={lIdx} className="h-1" />;

                          // Headers
                          if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
                            const headerText = trimmed.replace(/^#+\s*/, '');
                            return (
                              <h4 key={lIdx} className="font-bold text-teal-950 text-[13px] pt-1.5 border-b border-teal-100/80 pb-0.5">
                                {headerText}
                              </h4>
                            );
                          }

                          // Bullet points
                          if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
                            const bulletContent = trimmed.replace(/^[\*\-•]\s*/, '');
                            return (
                              <div key={lIdx} className="flex items-start gap-1.5 pl-1 text-slate-800">
                                <span className="text-teal-600 font-bold shrink-0 mt-0.5">•</span>
                                <div>{renderInlineMarkdown(bulletContent)}</div>
                              </div>
                            );
                          }

                          // Disclaimer or Warning
                          if (trimmed.startsWith('⚠️') || trimmed.includes('Medical Disclaimer') || trimmed.includes('તબીબી ચેતવણી')) {
                            return (
                              <div key={lIdx} className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/80 text-amber-900 text-[11px] font-medium mt-2">
                                {renderInlineMarkdown(trimmed)}
                              </div>
                            );
                          }

                          return (
                            <p key={lIdx} className={msg.sender === 'user' ? 'text-white' : 'text-slate-800'}>
                              {renderInlineMarkdown(trimmed)}
                            </p>
                          );
                        })}
                      </div>

                      {/* Sources metadata tag */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex flex-wrap items-center gap-1">
                          <span className="font-semibold text-slate-400">Sources:</span>
                          {msg.sources.map((src, sIdx) => (
                            <span key={sIdx} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[9px] font-mono">
                              {src}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action Chips */}
                      {msg.actionChips && msg.actionChips.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-slate-100">
                          {msg.actionChips.map((chip, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleActionClick(chip)}
                              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs ${
                                chip.action === 'EMERGENCY'
                                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                  : 'bg-teal-700 hover:bg-teal-800 text-white'
                              }`}
                            >
                              <span>{chip.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 w-fit">
                    <div className="h-4 w-4 rounded-full border-2 border-teal-600 border-t-transparent animate-spin"></div>
                    <span className="text-xs font-medium">
                      Querying Python AI Model & MongoDB...
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Speech Recording Bar if Active */}
              {isListening && (
                <div className="bg-emerald-950 text-emerald-200 px-4 py-2 flex items-center justify-between border-t border-emerald-800 text-xs animate-in fade-in duration-150">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping"></span>
                    <span className="font-semibold text-white">
                      Listening in Gujarati / English ({recordingSeconds}s)... Speak now!
                    </span>
                  </div>
                  <button
                    onClick={stopListening}
                    className="text-xs bg-white/10 hover:bg-white/20 text-white px-2 py-0.5 rounded cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}

              {/* Chat Input Bar */}
              <div className="p-3 bg-white border-t border-slate-200/80 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="તમારો પ્રશ્ન અથવા લક્ષણો લખો... (Type symptoms or query)"
                    className="flex-1 bg-slate-100 hover:bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-xl px-3.5 py-2.5 text-xs outline-none transition-all"
                  />

                  {/* Mic Button */}
                  <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    title="Speak in Gujarati / English"
                    className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      isListening
                        ? 'bg-rose-500 text-white ring-4 ring-rose-500/30'
                        : 'bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200'
                    }`}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>

                  {/* Send Button */}
                  <Button
                    type="submit"
                    disabled={!inputValue.trim() || loading}
                    className="h-10 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold gap-1.5 shadow-sm"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send</span>
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: ML DISEASE CLASSIFIER (DIRECT FASTAPI PREDICTOR) */}
          {activeTab === 'ml' && (
            <div className="flex-1 overflow-y-auto p-4 bg-[#F8FAFB] text-xs space-y-4">
              <div className="p-3 rounded-2xl bg-teal-900 text-white">
                <h4 className="font-bold text-sm flex items-center gap-1.5 text-emerald-300">
                  <Activity className="h-4 w-4" /> ML Differential Diagnosis
                </h4>
                <p className="text-[11px] text-teal-100/80 mt-1">
                  MultinomialNB Classifier trained on 254 Disease Profiles & 163,000 records.
                </p>
              </div>

              {/* Symptom Selection Tags */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 block">Select Symptoms:</span>
                <div className="flex flex-wrap gap-1.5">
                  {quickSymptoms.map((sym) => {
                    const isSel = selectedSymptoms.includes(sym);
                    return (
                      <button
                        key={sym}
                        onClick={() => {
                          if (isSel) {
                            setSelectedSymptoms(selectedSymptoms.filter((s) => s !== sym));
                          } else {
                            setSelectedSymptoms([...selectedSymptoms, sym]);
                          }
                        }}
                        className={`px-2.5 py-1.5 rounded-lg font-semibold capitalize transition-all cursor-pointer text-xs ${
                          isSel
                            ? 'bg-teal-700 text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:border-teal-400'
                        }`}
                      >
                        {isSel ? '✓ ' : '+ '} {sym}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Symptom Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={symptomInput}
                  onChange={(e) => setSymptomInput(e.target.value)}
                  placeholder="Or type custom symptom (e.g., ear pain)..."
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-teal-500"
                />
                <button
                  onClick={() => {
                    if (symptomInput.trim() && !selectedSymptoms.includes(symptomInput.trim())) {
                      setSelectedSymptoms([...selectedSymptoms, symptomInput.trim()]);
                      setSymptomInput('');
                    }
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold cursor-pointer"
                >
                  Add
                </button>
              </div>

              {/* Run Prediction Button */}
              <Button
                onClick={handleRunMlPrediction}
                disabled={selectedSymptoms.length === 0 || mlLoading}
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold h-10 rounded-xl gap-2 shadow-xs"
              >
                {mlLoading ? (
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Run ML Model Inference ({selectedSymptoms.length} symptoms)
              </Button>

              {/* ML Results Display */}
              {mlResults && mlResults.top_predictions && (
                <div className="space-y-2 pt-2 animate-in fade-in-50 duration-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      Top Predictions ({mlResults.inference_time_ms}ms)
                    </span>
                    <span className="bg-teal-100 text-teal-900 text-[10px] font-black px-2 py-0.5 rounded">
                      {mlResults.overall_urgency}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {mlResults.top_predictions.map((pred: any, idx: number) => (
                      <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 capitalize text-sm">
                            {idx + 1}. {pred.disease}
                          </span>
                          <span className="font-extrabold text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-xs">
                            {pred.confidence_percent}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Matched: {pred.matched_symptoms?.join(', ')}
                        </p>
                        {pred.precautions && pred.precautions.length > 0 && (
                          <p className="text-[10px] text-slate-600 mt-1.5 italic bg-slate-50 p-1.5 rounded">
                            {pred.precautions[0]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};
