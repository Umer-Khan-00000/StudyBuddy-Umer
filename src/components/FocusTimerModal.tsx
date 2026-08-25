import React from 'react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Timer, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Bell,
  Coffee,
  Brain
} from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';

interface FocusTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  secondsRemaining: number;
  isActive: boolean;
  onToggleTimer: () => void;
  onResetTimer: (minutes: number) => void;
  currentMode: 'focus' | 'short_break' | 'long_break';
  onChangeMode: (mode: 'focus' | 'short_break' | 'long_break') => void;
  ambientSound: string;
  onChangeAmbientSound: (sound: string) => void;
  ambientVolume: number;
  onChangeAmbientVolume: (vol: number) => void;
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  isOpen,
  onClose,
  secondsRemaining,
  isActive,
  onToggleTimer,
  onResetTimer,
  currentMode,
  onChangeMode,
  ambientSound,
  onChangeAmbientSound,
  ambientVolume,
  onChangeAmbientVolume,
}) => {
  if (!isOpen) return null;

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const formattedTime = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

  const totalModeSeconds = currentMode === 'focus' ? 25 * 60 : currentMode === 'short_break' ? 5 * 60 : 15 * 60;
  const progressPercent = ((totalModeSeconds - secondsRemaining) / totalModeSeconds) * 100;

  const soundOptions = [
    { id: 'off', label: 'Mute' },
    { id: 'binaural', label: 'Binaural Focus (10Hz)' },
    { id: 'rain', label: 'Soft Rain' },
    { id: 'white_noise', label: 'Brown Noise' },
    { id: 'waves', label: 'Ocean Waves' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white/[0.09] backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl max-w-md w-full space-y-6 relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-indigo-300" />
            <h3 className="text-lg font-bold text-white drop-shadow-sm">Pomodoro Focus Timer</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-white/[0.05] p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
          {[
            { id: 'focus', label: 'Focus (25m)', icon: Brain },
            { id: 'short_break', label: 'Short Break (5m)', icon: Coffee },
            { id: 'long_break', label: 'Long Break (15m)', icon: Sparkles },
          ].map((mode) => {
            const Icon = mode.icon;
            const isSel = currentMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => onChangeMode(mode.id as any)}
                className={`py-2 px-1 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  isSel
                    ? 'bg-white/25 text-white border border-white/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[11px] whitespace-nowrap">{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Circular Countdown Ring Display */}
        <div className="flex flex-col items-center justify-center py-4 relative">
          <div className="relative w-52 h-52 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="currentColor"
                strokeWidth="6"
                className="text-white/10"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="currentColor"
                strokeWidth="6"
                className="text-indigo-400 transition-all duration-300 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]"
                fill="none"
                strokeDasharray={276.46}
                strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                strokeLinecap="round"
              />
            </svg>

            {/* Time Center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-black tracking-tight text-white font-mono drop-shadow-sm">
                {formattedTime}
              </span>
              <span className="text-xs font-bold text-indigo-300 mt-1 uppercase tracking-wider">
                {currentMode.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Timer Play / Pause / Reset Action Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => onResetTimer(currentMode === 'focus' ? 25 : currentMode === 'short_break' ? 5 : 15)}
            title="Reset Timer"
            className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 backdrop-blur-md transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          
          <button
            id="toggle-pomodoro-timer-action-btn"
            onClick={onToggleTimer}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600/90 to-purple-600/90 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm flex items-center gap-2 shadow-2xl shadow-indigo-600/30 border border-white/20 backdrop-blur-md transition-all hover:scale-105"
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5 fill-white" /> Pause Focus
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" /> Start Focus
              </>
            )}
          </button>
        </div>

        {/* Ambient Soundscape Controller */}
        <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/12 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-emerald-300" /> Ambient Focus Audio:
            </span>
            <span className="text-slate-300 capitalize font-medium">{ambientSound}</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {soundOptions.map((snd) => (
              <button
                key={snd.id}
                onClick={() => onChangeAmbientSound(snd.id)}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition-all backdrop-blur-sm ${
                  ambientSound === snd.id
                    ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400/40 shadow-sm'
                    : 'bg-white/[0.04] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                {snd.label}
              </button>
            ))}
          </div>

          {ambientSound !== 'off' && (
            <div className="pt-2 flex items-center gap-3">
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="range"
                min={0.05}
                max={0.8}
                step={0.05}
                value={ambientVolume}
                onChange={(e) => onChangeAmbientVolume(parseFloat(e.target.value))}
                className="w-full h-1.5 rounded-lg bg-white/20 accent-indigo-400 cursor-pointer"
              />
              <Volume2 className="w-3.5 h-3.5 text-slate-300" />
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
