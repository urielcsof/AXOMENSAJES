import React, { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Download,
  Sparkles,
  RotateCcw,
  Mic,
  Sliders,
  Radio,
  Copy,
  Check,
  Zap,
  Flame,
  Clock,
  AudioLines,
  Smile,
  Layers,
  AlertCircle,
  Undo2,
  Headphones,
  CheckCircle2,
  Heart
} from 'lucide-react';

interface AudioRecord {
  id: string;
  timestamp: string;
  audioUrl: string;
  blobData: string;
  textSnippet: string;
  voiceName: string;
  gender: 'femenina' | 'masculina';
  style: string;
  duration: number;
}

interface VoiceConfig {
  id: string;
  name: string;
  gender: 'femenina' | 'masculina';
  badge: string;
  description: string;
  sampleText: string;
  gradient: string;
  glow: string;
}

const VOICES: VoiceConfig[] = [
  // Femeninas
  {
    id: 'Kore',
    name: 'Kore',
    gender: 'femenina',
    badge: 'Alegre & Efusiva',
    description: 'Enérgica, magnética y chispeante. Ideal para ganchos virales, ventas y anuncios de alto impacto.',
    sampleText: '¡Hola! Soy Kore. ¡Prepárate para transformar tus ventas con pura energía!',
    gradient: 'from-[#FF1E79] to-[#FF65A3]',
    glow: 'rgba(255, 30, 121, 0.4)',
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    gender: 'femenina',
    badge: 'Cálida & Sofisticada',
    description: 'Moderna, envolvente y de gran autoridad. Perfecta para storytelling conductual y marcas premium.',
    sampleText: 'Soy Zephyr. La persuasión real no empuja, conecta con lo que tu cliente más valora.',
    gradient: 'from-[#D946EF] to-[#EC4899]',
    glow: 'rgba(217, 70, 239, 0.4)',
  },
  // Masculinas
  {
    id: 'Puck',
    name: 'Puck',
    gender: 'masculina',
    badge: 'Entusiasta & Dinámico',
    description: 'Juguetón, veloz y sumamente fresco. Excelente para Reels, TikTok y llamadas a la acción vivaces.',
    sampleText: '¡Ey, qué tal! Soy Puck. Vamos a atrapar la atención de tu audiencia en los primeros tres segundos.',
    gradient: 'from-[#06B6D4] to-[#3B82F6]',
    glow: 'rgba(6, 182, 212, 0.4)',
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    gender: 'masculina',
    badge: 'Profundo & Persuasivo',
    description: 'Voz con peso, resonancia y firmeza. Ideal para neuroventas, B2B y ofertas de alto valor.',
    sampleText: 'Soy Fenrir. Deja de vender características y empieza a resolver el dolor que no los deja dormir.',
    gradient: 'from-[#10B981] to-[#059669]',
    glow: 'rgba(16, 185, 129, 0.4)',
  },
  {
    id: 'Charon',
    name: 'Charon',
    gender: 'masculina',
    badge: 'Analítico & Sobrio',
    description: 'Tono cerebral, calmado y de gran credibilidad. Perfecto para explicar psicología del consumidor.',
    sampleText: 'Soy Charon. El cerebro humano siempre prioriza evitar una pérdida antes que buscar una ganancia.',
    gradient: 'from-[#8B5CF6] to-[#6366F1]',
    glow: 'rgba(139, 92, 246, 0.4)',
  },
];

const FEMALE_STYLE_PRESETS = [
  {
    label: '💖 Alegre, Dinámica y Efusiva',
    prompt: 'Voz femenina, alegre, muy dinámica y efusiva, con tono apasionado, fresco y persuasivo de marketing viral',
  },
  {
    label: '🔥 Ultra Viral (TikTok / Reels)',
    prompt: 'Voz femenina juvenil, sumamente entusiasta, rápida, magnética, con inflexiones sonrientes y ritmo acelerado',
  },
  {
    label: '🧠 Conductual Axomania (Dolor y Pérdida)',
    prompt: 'Voz femenina cautivadora, segura, perspicaz, con énfasis estratégico en el dolor que el cliente quiere evitar',
  },
  {
    label: '🎙️ Conversacional & Cercana',
    prompt: 'Voz femenina cercana, chispeante, como una amiga experta compartiendo un secreto brutal de negocios',
  },
  {
    label: '⚡ Urgencia y Revelación',
    prompt: 'Voz femenina enérgica, reveladora, con tono de impacto y suspenso que explota en convicción',
  },
];

const MALE_STYLE_PRESETS = [
  {
    label: '⚡ Enérgico, Alegre y Dinámico',
    prompt: 'Voz masculina, enérgica, alegre, dinámica y persuasiva, con tono apasionado de marketing viral y creativo',
  },
  {
    label: '🔥 Pitch Viral de Alto Impacto',
    prompt: 'Voz masculina rápida, magnética, con ritmo constante, seguridad arrolladora y remate contundente',
  },
  {
    label: '🧠 Neuroventas Conductual Axomania',
    prompt: 'Voz masculina profunda, reveladora, enfatizando la aversión a la pérdida y la psicología del comprador',
  },
  {
    label: '🎙️ Locutor Directo & Amigable',
    prompt: 'Voz masculina fresca, natural, conversacional, como un mentor de marketing explicando un hack poderoso',
  },
  {
    label: '💼 Autoridad y Cierre de Ventas',
    prompt: 'Voz masculina segura, imponente, con pausas de peso y tono de certeza absoluta',
  },
];

const DEFAULT_SCRIPT = `Hack de marketing: deja de decirle a tu cliente lo bueno que es tu producto. Dile qué problema dejará de tener cuando lo compre. El cerebro presta más atención a evitar una pérdida o resolver una amenaza que a una lista de características. No vendas lo que haces. Vende lo que cambia.

¡No es para todos y es por eso que funciona!`;

export default function App() {
  // Voice & Gender state
  const [selectedGender, setSelectedGender] = useState<'femenina' | 'masculina'>('femenina');
  const [selectedVoice, setSelectedVoice] = useState<string>('Kore');
  const [stylePrompt, setStylePrompt] = useState<string>(FEMALE_STYLE_PRESETS[0].prompt);

  // Script state
  const [script, setScript] = useState<string>(DEFAULT_SCRIPT);
  const [previousScript, setPreviousScript] = useState<string | null>(null);

  // Loading & Generation states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [refineActionName, setRefineActionName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [lastInsertedCue, setLastInsertedCue] = useState<string | null>(null);

  // Audio Playback state
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [history, setHistory] = useState<AudioRecord[]>([]);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Filter voices by selected gender
  const currentVoiceList = VOICES.filter((v) => v.gender === selectedGender);
  const currentPresets = selectedGender === 'femenina' ? FEMALE_STYLE_PRESETS : MALE_STYLE_PRESETS;

  // Sync default voice and prompt when switching gender
  const handleGenderSwitch = (gender: 'femenina' | 'masculina') => {
    if (gender === selectedGender) return;
    setSelectedGender(gender);
    if (gender === 'femenina') {
      setSelectedVoice('Kore');
      setStylePrompt(FEMALE_STYLE_PRESETS[0].prompt);
    } else {
      setSelectedVoice('Puck');
      setStylePrompt(MALE_STYLE_PRESETS[0].prompt);
    }
  };

  // Audio element setup
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Sync playback speed and volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [playbackSpeed, volume, isMuted]);

  // Waveform canvas animation in Axomania Neon Pink & Glow
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const renderWave = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const numBars = 52;
      const barWidth = width / numBars - 2;

      for (let i = 0; i < numBars; i++) {
        let barHeight = 4;
        if (isPlaying) {
          const progressRel = duration > 0 ? currentTime / duration : 0;
          const isActive = i / numBars <= progressRel;
          const waveFactor = Math.sin(i * 0.38 + phase) * 0.5 + 0.5;
          const secondaryWave = Math.cos(i * 0.22 - phase * 1.8) * 0.35 + 0.65;
          barHeight = Math.max(6, waveFactor * secondaryWave * (height - 10));

          if (isActive) {
            // Intense Axomania Neon Pink
            ctx.fillStyle = '#FF1E79';
            ctx.shadowColor = '#FF1E79';
            ctx.shadowBlur = 8;
          } else {
            // Coral violet secondary
            ctx.fillStyle = '#EC4899';
            ctx.shadowColor = '#EC4899';
            ctx.shadowBlur = 3;
          }
        } else {
          ctx.shadowBlur = 0;
          const pseudoStatic = Math.sin(i * 0.35) * 0.25 + 0.35;
          barHeight = Math.max(4, pseudoStatic * (height * 0.55));
          ctx.fillStyle = 'rgba(255, 30, 121, 0.25)';
        }

        const x = i * (barWidth + 2);
        const y = (height - barHeight) / 2;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2.5);
        ctx.fill();
      }

      phase += isPlaying ? 0.16 : 0.02;
      animationFrameRef.current = requestAnimationFrame(renderWave);
    };

    renderWave();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, currentTime, duration]);

  // Insert vocal cue tag at cursor position
  const insertCue = (cue: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setScript((prev) => prev + ' ' + cue);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextScript = script.substring(0, start) + ' ' + cue + ' ' + script.substring(end);
    setScript(nextScript);
    setLastInsertedCue(cue);
    setTimeout(() => setLastInsertedCue(null), 1800);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cue.length + 2, start + cue.length + 2);
    }, 15);
  };

  // Generate Audio via Server-Side Gemini 3.8 Flash TTS
  const handleGenerateAudio = async (overrideText?: string, overrideVoice?: string, overrideStyle?: string) => {
    const textToVoice = overrideText || script;
    const voiceToUse = overrideVoice || selectedVoice;
    const styleToUse = overrideStyle || stylePrompt;

    if (!textToVoice.trim()) {
      setErrorMsg('Por favor escribe o pega un guión antes de generar el audio.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToVoice,
          voiceName: voiceToUse,
          stylePrompt: styleToUse,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.audio) {
        throw new Error(data.error || 'Error al generar la locución con Gemini 3.8 Flash TTS.');
      }

      // Convert base64 to Blob URL
      const byteCharacters = atob(data.audio);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const audioBlob = new Blob([byteArray], { type: data.mimeType || 'audio/wav' });
      const newUrl = URL.createObjectURL(audioBlob);

      setAudioUrl(newUrl);

      if (audioRef.current) {
        audioRef.current.src = newUrl;
        audioRef.current.load();
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((e) => console.log('Autoplay handled:', e));
      }

      // Find gender of voice
      const voiceObj = VOICES.find((v) => v.id === voiceToUse);

      const newRecord: AudioRecord = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        audioUrl: newUrl,
        blobData: data.audio,
        textSnippet: textToVoice.slice(0, 90) + (textToVoice.length > 90 ? '...' : ''),
        voiceName: voiceToUse,
        gender: voiceObj?.gender || selectedGender,
        style: styleToUse,
        duration: 0,
      };

      setHistory((prev) => [newRecord, ...prev.slice(0, 8)]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Hubo un inconveniente al generar la voz.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Instant 3-second sample test for individual voice cards
  const handlePreviewVoice = async (voice: VoiceConfig) => {
    if (previewingVoice) return;
    setPreviewingVoice(voice.id);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: voice.sampleText,
          voiceName: voice.id,
          stylePrompt: voice.gender === 'femenina'
            ? 'Voz femenina alegre, dinámica y efusiva, sumamente amigable'
            : 'Voz masculina enérgica, alegre, dinámica y convincente',
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.audio) {
        throw new Error(data.error || 'No se pudo generar la muestra de voz.');
      }

      const byteCharacters = atob(data.audio);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const audioBlob = new Blob([byteArray], { type: data.mimeType || 'audio/wav' });
      const sampleUrl = URL.createObjectURL(audioBlob);

      const sampleAudio = new Audio(sampleUrl);
      sampleAudio.play();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`No se pudo previsualizar a ${voice.name}: ${err.message}`);
    } finally {
      setPreviewingVoice(null);
    }
  };

  // Play / Pause toggle
  const togglePlayPause = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      });
    }
  };

  // Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  // Download WAV file
  const handleDownload = (customUrl?: string, customName?: string) => {
    const url = customUrl || audioUrl;
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${customName || `axomania-${selectedVoice.toLowerCase()}`}-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Gemini Behavioral & Copywriting Enhancer
  const handleAIEnhance = async (action: string, actionLabel: string) => {
    setIsRefining(true);
    setRefineActionName(actionLabel);
    setErrorMsg(null);
    setPreviousScript(script);

    try {
      const response = await fetch('/api/marketing/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: script,
          action,
          gender: selectedGender,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar el guión.');
      }

      if (data.resultText) {
        setScript(data.resultText);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al optimizar con Gemini.');
    } finally {
      setIsRefining(false);
      setRefineActionName('');
    }
  };

  const undoLastEnhance = () => {
    if (previousScript !== null) {
      setScript(previousScript);
      setPreviousScript(null);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = script.trim().split(/\s+/).filter(Boolean).length;
  const estimatedSeconds = Math.max(3, Math.round((wordCount / 140) * 60));

  return (
    <div className="min-h-screen bg-[#090212] text-slate-100 flex flex-col font-sans selection:bg-[#FF1E79] selection:text-white">
      {/* Axomania Ambient Background Lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[#FF1E79]/15 rounded-full blur-[160px]" />
        <div className="absolute top-1/3 -right-32 w-[650px] h-[650px] bg-[#9333EA]/15 rounded-full blur-[170px]" />
        <div className="absolute -bottom-32 left-1/4 w-[700px] h-[700px] bg-[#FF007A]/10 rounded-full blur-[180px]" />
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #FF1E79 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Axomania Header with Mascot & Branding */}
      <header className="relative z-10 border-b border-[#FF1E79]/20 bg-[#0E031A]/85 backdrop-blur-xl px-4 md:px-8 py-3.5 shadow-xl shadow-[#FF1E79]/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Identity */}
          <div className="flex items-center gap-4">
            {/* Mascot Icon Container */}
            <div className="relative group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF1E79] via-[#FF007A] to-[#D946EF] p-[2px] shadow-lg shadow-[#FF1E79]/40 group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-[#120422] rounded-[14px] flex items-center justify-center overflow-hidden relative">
                  {/* Glowing neon Axolotl mascot SVG */}
                  <svg viewBox="0 0 100 100" className="w-12 h-12">
                    <defs>
                      <linearGradient id="axoPink" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFA6CB" />
                        <stop offset="100%" stopColor="#FF3E91" />
                      </linearGradient>
                      <linearGradient id="axoGill" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF1E79" />
                        <stop offset="100%" stopColor="#8A0D40" />
                      </linearGradient>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#FF1E79" floodOpacity="0.8" />
                      </filter>
                    </defs>

                    {/* Gill frills (left) */}
                    <path d="M 28 36 Q 8 20 18 10 Q 28 20 32 30" fill="url(#axoGill)" />
                    <path d="M 24 48 Q 4 40 10 30 Q 22 34 28 42" fill="url(#axoGill)" />
                    <path d="M 28 60 Q 10 65 16 52 Q 25 52 30 54" fill="url(#axoGill)" />

                    {/* Gill frills (right) */}
                    <path d="M 72 36 Q 92 20 82 10 Q 72 20 68 30" fill="url(#axoGill)" />
                    <path d="M 76 48 Q 96 40 90 30 Q 78 34 72 42" fill="url(#axoGill)" />
                    <path d="M 72 60 Q 90 65 84 52 Q 75 52 70 54" fill="url(#axoGill)" />

                    {/* Head */}
                    <ellipse cx="50" cy="50" rx="27" ry="24" fill="url(#axoPink)" />

                    {/* Cheeks blush */}
                    <circle cx="33" cy="54" r="5" fill="#FF1E79" opacity="0.4" />
                    <circle cx="67" cy="54" r="5" fill="#FF1E79" opacity="0.4" />

                    {/* Big anime eyes with sparkles */}
                    <ellipse cx="38" cy="46" rx="5" ry="6.5" fill="#180424" />
                    <circle cx="36" cy="43.5" r="2.2" fill="#FFFFFF" />
                    <circle cx="39.5" cy="48" r="1.1" fill="#FFFFFF" />

                    <ellipse cx="62" cy="46" rx="5" ry="6.5" fill="#180424" />
                    <circle cx="60" cy="43.5" r="2.2" fill="#FFFFFF" />
                    <circle cx="63.5" cy="48" r="1.1" fill="#FFFFFF" />

                    {/* Happy open smile */}
                    <path d="M 44 54 Q 50 63 56 54 Z" fill="#99003E" />
                    <path d="M 46 58 Q 50 62 54 58 Z" fill="#FF70A6" />

                    {/* Cute paws resting on bottom border */}
                    <ellipse cx="32" cy="74" rx="6" ry="4" fill="url(#axoPink)" />
                    <ellipse cx="68" cy="74" rx="6" ry="4" fill="url(#axoPink)" />
                  </svg>
                </div>
              </div>
              {/* Pulsing online badge */}
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#FF1E79] rounded-full border-2 border-[#120422] flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              </span>
            </div>

            {/* Axomania Wordmark & Slogan */}
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-extrabold text-2xl tracking-wider text-white flex items-center">
                  AX<span className="text-[#FF1E79]">O</span>MANIA
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#FF1E79]/20 text-[#FF65A3] border border-[#FF1E79]/40 shadow-sm shadow-[#FF1E79]/20">
                  TTS Voice Studio
                </span>
              </div>
              <p className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-300">
                Behavioral Creative Studio
              </p>
              <p className="text-[11px] text-[#FF85B3] italic font-medium">
                ¡No es para todos y es por eso que funciona!
              </p>
            </div>
          </div>

          {/* Quick Stats / Direct Action */}
          <div className="flex items-center gap-3">
            {/* Active Voice Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#18052B] border border-[#FF1E79]/30 text-xs">
              <span className="text-slate-400">Voz Activa:</span>
              <span className="font-bold text-[#FF65A3] flex items-center gap-1">
                {selectedGender === 'femenina' ? '👩' : '👨'} {selectedVoice}
              </span>
              <span className="text-[10px] text-slate-500">({selectedGender})</span>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => handleGenerateAudio()}
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#FF1E79] via-[#FF007A] to-[#D946EF] hover:from-[#FF0066] hover:to-[#C026D3] text-white shadow-lg shadow-[#FF1E79]/30 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Locutando con Gemini TTS...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>Locutar con {selectedVoice}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Script Editor, Vocal Cues & AI Enhancers (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Main Script Editor Card */}
          <div className="bg-[#120422]/90 border border-[#FF1E79]/25 rounded-2xl p-5 shadow-2xl backdrop-blur-md flex flex-col gap-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#FF1E79]/15">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FF1E79]/20 border border-[#FF1E79]/40 flex items-center justify-center">
                  <Mic className="w-3.5 h-3.5 text-[#FF1E79]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-100">Guión de Copywriting & Locución</h2>
                  <p className="text-[11px] text-slate-400">Axomania Behavioral Framework</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {previousScript && (
                  <button
                    onClick={undoLastEnhance}
                    className="flex items-center gap-1 text-xs text-amber-300 hover:text-amber-200 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 transition cursor-pointer"
                    title="Deshacer última optimización"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>Deshacer cambio</span>
                  </button>
                )}
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded-md hover:bg-white/5 transition cursor-pointer"
                  title="Copiar texto"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
                <button
                  onClick={() => setScript(DEFAULT_SCRIPT)}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#FF85B3] px-2 py-1 rounded-md hover:bg-white/5 transition cursor-pointer"
                  title="Restaurar guión original"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar</span>
                </button>
              </div>
            </div>

            {/* Script Textarea */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={script}
                onChange={(e) => setScript(e.target.value)}
                rows={7}
                placeholder="Escribe o pega aquí el guión que deseas transformar en locución profesional..."
                className="w-full bg-[#090212]/90 border border-[#FF1E79]/30 focus:border-[#FF1E79] focus:ring-1 focus:ring-[#FF1E79] rounded-xl p-4 text-slate-100 text-sm md:text-base leading-relaxed resize-y transition outline-none shadow-inner"
              />
              <div className="flex items-center justify-between text-xs text-slate-400 mt-2 px-1">
                <div className="flex items-center gap-3">
                  <span>
                    <strong className="text-slate-200">{wordCount}</strong> palabras
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-slate-200">{script.length}</strong> caracteres
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-[#FF85B3] font-medium">
                    <Clock className="w-3 h-3" /> ~{estimatedSeconds}s de locución
                  </span>
                </div>
                {lastInsertedCue && (
                  <span className="text-[11px] text-[#FF1E79] font-mono animate-bounce">
                    Etiqueta {lastInsertedCue} insertada ✓
                  </span>
                )}
              </div>
            </div>

            {/* Vocal Expressions & Pauses (Supported by Gemini 3.8 Flash TTS) */}
            <div className="bg-[#18062D]/80 border border-[#FF1E79]/20 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-200 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF1E79]" />
                  <span>Micro-expresiones de voz humana (clic para insertar en el cursor):</span>
                </div>
                <span className="text-[10px] text-slate-400 hidden sm:inline">Modelo: gemini-3.8-flash-tts</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { tag: '<breath>', label: '🌬️ <breath> Respiración', desc: 'Inhalación natural' },
                  { tag: '<laugh>', label: '😄 <laugh> Risita/Sonrisa', desc: 'Tono risueño alegre' },
                  { tag: '<gasp>', label: '😲 <gasp> Jadeo de asombro', desc: 'Sorpresa publicitaria' },
                  { tag: '...', label: '⏸️ (...) Pausa dramática', desc: 'Silencio de tensión' },
                  { tag: '|yeah|', label: '🗣️ |yeah| Backchannel', desc: 'Asentimiento enérgico' },
                  { tag: '|mhm|', label: '👌 |mhm| Confirmación', desc: 'Validación sutil' },
                ].map((item) => (
                  <button
                    key={item.tag}
                    onClick={() => insertCue(item.tag)}
                    title={item.desc}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-[#23093F] hover:bg-[#FF1E79]/20 hover:text-[#FF85B3] hover:border-[#FF1E79]/60 border border-[#FF1E79]/25 text-slate-200 transition active:scale-95 cursor-pointer font-mono shadow-sm"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Behavioral AI Enhancers (Gemini 3.8 Flash) */}
            <div className="border-t border-[#FF1E79]/20 pt-3">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#FF1E79]" />
                  Optimizador Conductual Axomania (Gemini 3.8 Flash)
                </span>
                {isRefining && (
                  <span className="text-xs text-[#FF65A3] animate-pulse flex items-center gap-1.5 font-medium">
                    <div className="w-3 h-3 border-2 border-[#FF1E79] border-t-transparent rounded-full animate-spin" />
                    {refineActionName}...
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {/* 1. Axomania Official Style */}
                <button
                  onClick={() => handleAIEnhance('axomania-style', 'Aplicando identidad Axomania')}
                  disabled={isRefining}
                  className="flex flex-col items-start p-2.5 rounded-xl bg-gradient-to-br from-[#FF1E79]/15 to-[#9333EA]/15 hover:from-[#FF1E79]/25 hover:to-[#9333EA]/25 border border-[#FF1E79]/40 hover:border-[#FF1E79] text-left transition group disabled:opacity-50 cursor-pointer shadow-md shadow-[#FF1E79]/5"
                >
                  <span className="text-xs font-bold text-slate-100 group-hover:text-[#FF85B3] flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-[#FF1E79]" />
                    Sello Axomania
                  </span>
                  <span className="text-[11px] text-slate-300 mt-0.5">
                    Psicología conductual + lema oficial
                  </span>
                </button>

                {/* 2. Humanize / Add Cues */}
                <button
                  onClick={() => handleAIEnhance('add-cues', 'Humanizando con pausas y aire')}
                  disabled={isRefining}
                  className="flex flex-col items-start p-2.5 rounded-xl bg-[#1A062F] hover:bg-[#250942] border border-[#FF1E79]/25 hover:border-[#FF1E79]/60 text-left transition group disabled:opacity-50 cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-200 group-hover:text-[#FF85B3] flex items-center gap-1">
                    <Smile className="w-3.5 h-3.5 text-[#FF65A3]" />
                    Humanizar Voz
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Pausas (...) y respiraciones naturales
                  </span>
                </button>

                {/* 3. TikTok / Reels Hook */}
                <button
                  onClick={() => handleAIEnhance('tiktok-hook', 'Optimizando gancho viral 15s')}
                  disabled={isRefining}
                  className="flex flex-col items-start p-2.5 rounded-xl bg-[#1A062F] hover:bg-[#250942] border border-[#FF1E79]/25 hover:border-[#FF1E79]/60 text-left transition group disabled:opacity-50 cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-200 group-hover:text-[#FF85B3] flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    Gancho Viral 15s
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Velocidad y magnetismo para redes
                  </span>
                </button>

                {/* 4. Loss Aversion */}
                <button
                  onClick={() => handleAIEnhance('loss-aversion', 'Maximizando aversión a pérdida')}
                  disabled={isRefining}
                  className="flex flex-col items-start p-2.5 rounded-xl bg-[#1A062F] hover:bg-[#250942] border border-[#FF1E79]/25 hover:border-[#FF1E79]/60 text-left transition group disabled:opacity-50 cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-200 group-hover:text-[#FF85B3] flex items-center gap-1">
                    <Headphones className="w-3.5 h-3.5 text-emerald-400" />
                    Aversión a Pérdida
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Enfoca el dolor del consumidor
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Voice Switcher & Personality Direction (Female <-> Male & Back) */}
          <div className="bg-[#120422]/90 border border-[#FF1E79]/25 rounded-2xl p-5 shadow-2xl backdrop-blur-md flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#FF1E79]/15">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#FF1E79]" />
                <h3 className="text-sm font-bold text-slate-100">Control de Voces & Género</h3>
              </div>
              <span className="text-xs text-[#FF85B3] font-medium">
                Cambia libremente entre voces femeninas y masculinas
              </span>
            </div>

            {/* Gender Toggle: FEMALE vs MALE */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-2 block">
                Selecciona Género de Locución:
              </label>
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#090212] border border-[#FF1E79]/30 rounded-xl">
                <button
                  onClick={() => handleGenderSwitch('femenina')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-xs md:text-sm transition-all cursor-pointer ${
                    selectedGender === 'femenina'
                      ? 'bg-gradient-to-r from-[#FF1E79] to-[#D946EF] text-white shadow-lg shadow-[#FF1E79]/40 scale-[1.01]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-base">👩</span>
                  <span>Voces Femeninas</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 text-white/90">2 Voces</span>
                </button>

                <button
                  onClick={() => handleGenderSwitch('masculina')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-xs md:text-sm transition-all cursor-pointer ${
                    selectedGender === 'masculina'
                      ? 'bg-gradient-to-r from-[#06B6D4] via-[#3B82F6] to-[#8B5CF6] text-white shadow-lg shadow-blue-500/40 scale-[1.01]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-base">👨</span>
                  <span>Voces Masculinas</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 text-white/90">3 Voces</span>
                </button>
              </div>
            </div>

            {/* Individual Voice Cards */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300">
                  Voces {selectedGender === 'femenina' ? 'Femeninas' : 'Masculinas'} Disponibles:
                </label>
                <span className="text-[11px] text-slate-400">
                  Usa <strong className="text-[#FF85B3]">"Probar"</strong> para escuchar una muestra
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {currentVoiceList.map((voice) => {
                  const isSelected = selectedVoice === voice.id;
                  const isPreviewingThis = previewingVoice === voice.id;

                  return (
                    <div
                      key={voice.id}
                      onClick={() => setSelectedVoice(voice.id)}
                      className={`relative p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                        isSelected
                          ? selectedGender === 'femenina'
                            ? 'bg-[#FF1E79]/15 border-[#FF1E79] shadow-lg shadow-[#FF1E79]/20'
                            : 'bg-blue-500/15 border-blue-400 shadow-lg shadow-blue-500/20'
                          : 'bg-[#18052B]/70 border-[#FF1E79]/20 hover:border-[#FF1E79]/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-base text-white">{voice.name}</span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                selectedGender === 'femenina'
                                  ? 'bg-[#FF1E79]/20 text-[#FF85B3] border border-[#FF1E79]/40'
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              }`}
                            >
                              {voice.badge}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            Voz {voice.gender === 'femenina' ? 'Femenina' : 'Masculina'} de Gemini 3.8
                          </span>
                        </div>

                        {isSelected && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#FF1E79] shadow-[0_0_8px_#FF1E79] animate-pulse" />
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-snug line-clamp-2">{voice.description}</p>

                      <div className="flex items-center justify-between pt-1.5 border-t border-white/10">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreviewVoice(voice);
                          }}
                          disabled={isPreviewingThis}
                          className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-200 transition active:scale-95 cursor-pointer"
                        >
                          {isPreviewingThis ? (
                            <>
                              <div className="w-2.5 h-2.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Reproduciendo...</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 fill-current text-[#FF1E79]" />
                              <span>Probar Muestra</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedVoice(voice.id)}
                          className={`text-[11px] font-semibold ${
                            isSelected ? 'text-[#FF85B3]' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {isSelected ? '✓ Seleccionada' : 'Seleccionar'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Adaptive Style Presets for Current Gender */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Estilo & Entonación de {selectedGender === 'femenina' ? 'la Locutora' : 'el Locutor'}:
                </label>
                <span className="text-[10px] text-slate-400">Adapta el tono de voz para el algoritmo</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {currentPresets.map((preset) => {
                  const isActive = stylePrompt === preset.prompt;
                  return (
                    <button
                      key={preset.label}
                      onClick={() => setStylePrompt(preset.prompt)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                        isActive
                          ? 'bg-[#FF1E79]/25 border-[#FF1E79] text-white font-bold shadow-md shadow-[#FF1E79]/20'
                          : 'bg-[#18052B] border-[#FF1E79]/20 text-slate-300 hover:text-white hover:border-[#FF1E79]/50'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {/* Custom prompt editable */}
              <input
                type="text"
                value={stylePrompt}
                onChange={(e) => setStylePrompt(e.target.value)}
                placeholder="Describe la emoción y estilo de locución..."
                className="w-full bg-[#090212]/90 border border-[#FF1E79]/30 focus:border-[#FF1E79] focus:ring-1 focus:ring-[#FF1E79] rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Audio Master Deck, Waveform & History (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Audio Master Deck in Axomania Colors */}
          <div className="bg-gradient-to-b from-[#16052A] to-[#0D0218] border border-[#FF1E79]/30 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 relative overflow-hidden">
            {/* Top Glowing Axomania Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF1E79] via-[#FF007A] to-[#D946EF]" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#FF1E79] animate-pulse" />
                <h3 className="text-sm font-bold text-slate-100">Master Deck • Axomania Studio</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FF1E79]/20 text-[#FF85B3] border border-[#FF1E79]/40">
                24kHz Studio WAV
              </span>
            </div>

            {/* Waveform Canvas */}
            <div className="bg-[#090212] border border-[#FF1E79]/25 rounded-xl p-3 flex flex-col items-center justify-center shadow-inner">
              <canvas ref={canvasRef} width={380} height={75} className="w-full h-[75px] rounded-lg" />
              <div className="flex items-center justify-between w-full text-[11px] text-slate-400 px-1 mt-1 font-mono">
                <span>{Math.floor(currentTime)}s</span>
                <span className="text-[#FF85B3] font-bold">
                  {isPlaying ? '● Reproduciendo' : audioUrl ? 'Pausa' : 'Listo para locutar'}
                </span>
                <span>{Math.floor(duration)}s</span>
              </div>
            </div>

            {/* Scrubber */}
            <div className="flex flex-col gap-1">
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.05"
                value={currentTime}
                disabled={!audioUrl}
                onChange={handleSeek}
                className="w-full accent-[#FF1E79] h-1.5 bg-[#250942] rounded-lg cursor-pointer"
              />
            </div>

            {/* Playback Controls & Velocity */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlayPause}
                  disabled={!audioUrl || isGenerating}
                  className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#FF1E79] via-[#FF007A] to-[#D946EF] hover:from-[#FF0066] hover:to-[#C026D3] active:scale-95 text-white flex items-center justify-center shadow-lg shadow-[#FF1E79]/35 transition disabled:opacity-40 disabled:scale-100 cursor-pointer"
                  title={isPlaying ? 'Pausar' : 'Reproducir'}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  )}
                </button>

                <div>
                  <p className="text-xs font-bold text-slate-100">
                    {audioUrl ? `Voz: ${selectedVoice} (${selectedGender})` : 'Sin audio aún'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {audioUrl
                      ? isPlaying
                        ? 'Reproducción activa'
                        : 'Pausado • Presiona Play'
                      : 'Presiona "Locutar" para generar'}
                  </p>
                </div>
              </div>

              {/* Controls: Mute & Speed */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 rounded-lg bg-[#250942] hover:bg-[#FF1E79]/20 text-slate-300 hover:text-white transition cursor-pointer"
                  title={isMuted ? 'Activar sonido' : 'Silenciar'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <div className="flex items-center gap-1 bg-[#090212] border border-[#FF1E79]/25 rounded-lg p-1 text-xs">
                  {[0.8, 1.0, 1.25, 1.5].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                        playbackSpeed === spd
                          ? 'bg-[#FF1E79] text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons: Generate & Download */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#FF1E79]/20">
              <button
                onClick={() => handleGenerateAudio()}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#FF1E79]/20 hover:bg-[#FF1E79]/30 text-[#FF85B3] border border-[#FF1E79]/50 text-xs font-bold active:scale-98 transition disabled:opacity-50 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-[#FF1E79] border-t-transparent rounded-full animate-spin" />
                    <span>Locutando...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>Regenerar Audio</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleDownload()}
                disabled={!audioUrl}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#250942] hover:bg-[#320C58] text-white border border-[#FF1E79]/30 text-xs font-bold active:scale-98 transition disabled:opacity-40 cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#FF1E79]" />
                <span>Descargar WAV</span>
              </button>
            </div>

            {/* Error Message banner */}
            {errorMsg && (
              <div className="bg-rose-950/70 border border-rose-600/70 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Aviso de Axomania Studio:</p>
                  <p className="text-rose-300 mt-0.5">{errorMsg}</p>
                </div>
              </div>
            )}
          </div>

          {/* Behavioral Strategy Card - Axomania Core Framework */}
          <div className="bg-[#120422]/90 border border-[#FF1E79]/25 rounded-2xl p-5 shadow-2xl backdrop-blur-md flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#FF1E79]/20 flex items-center justify-center">
                <Heart className="w-3.5 h-3.5 text-[#FF1E79]" />
              </div>
              <h3 className="text-sm font-bold text-slate-100">Filosofía Conductual Axomania</h3>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#090212]/80 border border-[#FF1E79]/20">
                <span className="font-bold text-[#FF85B3] block mb-1">
                  🧠 El Sesgo de Aversión a la Pérdida (Loss Aversion):
                </span>
                <p className="text-slate-300 leading-relaxed">
                  "El dolor de perder algo pesa el doble que el placer de ganarlo. Por eso en Axomania no vendemos
                  características técnicas: vendemos el alivio urgente del dolor que tu cliente no quiere seguir tolerando."
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#090212]/80 border border-[#FF1E79]/20">
                <span className="font-bold text-cyan-300 block mb-1">
                  🎯 Polarización & Validación de Estatus:
                </span>
                <p className="text-slate-300 leading-relaxed">
                  <em className="text-white">"¡No es para todos y es por eso que funciona!"</em> no es sólo un slogan: es un
                  filtro psicológico que atrae clientes de alto valor y excluye a los curiosos.
                </p>
              </div>
            </div>
          </div>

          {/* Takes History */}
          <div className="bg-[#120422]/90 border border-[#FF1E79]/25 rounded-2xl p-5 shadow-2xl backdrop-blur-md flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#FF1E79]" />
                <h3 className="text-sm font-bold text-slate-100">Tomas Grabadas en esta Sesión</h3>
              </div>
              <span className="text-xs text-slate-400 font-semibold">{history.length} tomas</span>
            </div>

            {history.length === 0 ? (
              <div className="p-4 text-center rounded-xl bg-[#090212]/50 border border-white/5 text-xs text-slate-500">
                Aún no has generado tomas. Presiona{' '}
                <strong className="text-[#FF85B3]">"Locutar con {selectedVoice}"</strong> para crear tu primer archivo WAV.
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[230px] overflow-y-auto pr-1">
                {history.map((take) => (
                  <div
                    key={take.id}
                    className="p-3 rounded-xl bg-[#090212]/80 border border-[#FF1E79]/20 hover:border-[#FF1E79]/60 flex items-center justify-between transition gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-white flex items-center gap-1">
                          {take.gender === 'femenina' ? '👩' : '👨'} {take.voiceName}
                        </span>
                        <span className="text-[10px] text-slate-500">{take.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{take.textSnippet}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setAudioUrl(take.audioUrl);
                          if (audioRef.current) {
                            audioRef.current.src = take.audioUrl;
                            audioRef.current.load();
                            audioRef.current.play().then(() => setIsPlaying(true));
                          }
                        }}
                        className="p-1.5 rounded-lg bg-[#250942] hover:bg-[#FF1E79] text-slate-200 hover:text-white transition cursor-pointer"
                        title="Escuchar esta toma"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>

                      <button
                        onClick={() => handleDownload(take.audioUrl, `axomania-${take.voiceName.toLowerCase()}`)}
                        className="p-1.5 rounded-lg bg-[#250942] hover:bg-[#320C58] text-slate-200 hover:text-white transition cursor-pointer"
                        title="Descargar WAV"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Axomania Footer */}
      <footer className="relative z-10 border-t border-[#FF1E79]/20 bg-[#0E031A]/85 backdrop-blur-xl px-6 py-4 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-slate-100">AXOMANIA</span>
          <span>• Behavioral Creative Studio</span>
          <span className="text-[#FF85B3] italic hidden md:inline">
            — "¡No es para todos y es por eso que funciona!"
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-500 text-[11px]">
          <span>Modelo: gemini-3.8-flash-tts</span>
          <span>•</span>
          <span>WAV 24kHz Studio Quality</span>
        </div>
      </footer>
    </div>
  );
}
