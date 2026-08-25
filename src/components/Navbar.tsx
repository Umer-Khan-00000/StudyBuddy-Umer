import React, { useState } from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  FileText, 
  MessageSquareQuote, 
  HelpCircle, 
  Layers, 
  History, 
  Timer, 
  Volume2, 
  VolumeX, 
  Flame,
  Palette,
  Check
} from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';
import { ThemeId, THEMES } from '../utils/theme';

interface NavbarProps {
  activeTab: 'dashboard' | 'notes' | 'rag_chat' | 'quiz' | 'flashcards' | 'history';
  setActiveTab: (tab: 'dashboard' | 'notes' | 'rag_chat' | 'quiz' | 'flashcards' | 'history') => void;
  streakDays: number;
  openFocusTimer: () => void;
  ambientSound: string;
  setAmbientSound: (sound: string) => void;
  timerActive: boolean;
  timerRemainingFormatted: string;
  currentTheme: ThemeId;
  onChangeTheme: (theme: ThemeId) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  streakDays,
  openFocusTimer,
  ambientSound,
  setAmbientSound,
  timerActive,
  timerRemainingFormatted,
  currentTheme,
  onChangeTheme
}) => {
  const [showThemePicker, setShowThemePicker] = useState(false);

  const toggleAmbientSound = () => {
    if (ambientSound !== 'off') {
      audioSynth.stop();
      setAmbientSound('off');
    } else {
      audioSynth.playSoundtrack('binaural', 0.25);
      setAmbientSound('binaural');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'notes', label: 'Notes & Ingestion', icon: FileText },
    { id: 'rag_chat', label: 'RAG Study Tutor', icon: MessageSquareQuote },
    { id: 'quiz', label: 'Quiz Arena', icon: HelpCircle },
    { id: 'flashcards', label: 'Flashcards (SRS)', icon: Layers },
    { id: 'history', label: 'Quiz History', icon: History },
  ] as const;

  const currentThemeObj = THEMES[currentTheme];

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-slate-950/60 backdrop-blur-3xl border-b border-white/15 text-slate-100 shadow-2xl shadow-black/30">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 py-3 sm:py-3.5">
        <div className="flex items-center justify-between min-h-[72px] sm:min-h-[80px] gap-4 sm:gap-6 flex-wrap xl:flex-nowrap">
          
          {/* Logo & Brand - Larger & More Prominent */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div 
              id="brand-logo"
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-3.5 sm:gap-4 cursor-pointer group"
            >
              <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl bg-gradient-to-tr ${currentThemeObj.previewGradient} flex items-center justify-center shadow-2xl ${currentThemeObj.glowShadow} group-hover:scale-105 group-hover:rotate-1 transition-all duration-300 border-2 border-white/30`}>
                <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-md" />
              </div>
              <div>
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <span className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
                    Study Buddy
                  </span>
                  <span className="text-xs font-black px-3 py-1 rounded-full bg-white/20 backdrop-blur-xl text-white border border-white/30 shadow-inner tracking-wider">
                    AI RAG
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-medium tracking-wide mt-0.5">
                  Interactive Learning & Adaptive Mastery
                </p>
              </div>
            </div>
          </div>

          {/* Center Navigation Tabs - Spacious, Large, High Readability */}
          <nav className="hidden xl:flex items-center space-x-2 bg-white/[0.07] backdrop-blur-2xl p-2 rounded-2xl sm:rounded-3xl border border-white/15 shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2.5 px-4.5 py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-white/25 backdrop-blur-2xl text-white border border-white/40 shadow-xl shadow-black/20 scale-[1.03]'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.12]'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools: Interactive Theme Selector, Streak, Ambient Audio, Focus Timer */}
          <div className="flex items-center gap-3 sm:gap-3.5 flex-wrap sm:flex-nowrap">
            
            {/* Interactive Theme Palette Selector */}
            <div className="relative">
              <button
                id="theme-palette-toggle-btn"
                onClick={() => setShowThemePicker(!showThemePicker)}
                title="Change Color Theme & Atmosphere"
                className="flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 rounded-2xl bg-white/[0.09] hover:bg-white/[0.18] border border-white/20 text-xs sm:text-sm font-bold backdrop-blur-md transition-all text-slate-200 hover:text-white shadow-md hover:scale-105 cursor-pointer"
              >
                <div className={`w-4 h-4 rounded-full bg-gradient-to-tr ${currentThemeObj.previewGradient} ring-2 ring-white/40 shadow-sm`} />
                <span className="hidden md:inline font-semibold">{currentThemeObj.name}</span>
                <Palette className="w-4 h-4 text-slate-300" />
              </button>

              {/* Theme Picker Dropdown Menu */}
              {showThemePicker && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowThemePicker(false)} 
                  />
                  <div className="absolute right-0 mt-3 w-80 p-3.5 bg-slate-900/95 backdrop-blur-3xl rounded-3xl border border-white/20 shadow-2xl z-50 space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-white/10 pb-2.5">
                      <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <Palette className="w-4 h-4 text-indigo-400" /> Study Atmosphere
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">5 Color Palettes</span>
                    </div>

                    <div className="space-y-2 pt-1">
                      {Object.values(THEMES).map((theme) => {
                        const isSelected = currentTheme === theme.id;
                        return (
                          <button
                            key={theme.id}
                            onClick={() => {
                              onChangeTheme(theme.id);
                              setShowThemePicker(false);
                            }}
                            className={`w-full p-3 rounded-2xl text-left flex items-center justify-between transition-all backdrop-blur-md cursor-pointer ${
                              isSelected
                                ? 'bg-white/20 border border-white/30 text-white shadow-lg scale-[1.02]'
                                : 'bg-white/[0.04] hover:bg-white/[0.12] border border-white/10 text-slate-300 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full bg-gradient-to-tr ${theme.previewGradient} ring-2 ring-white/40 flex-shrink-0 flex items-center justify-center text-xs shadow-sm`}>
                                <span>{theme.icon}</span>
                              </div>
                              <div>
                                <div className="text-xs sm:text-sm font-bold leading-tight">{theme.name}</div>
                                <div className="text-[11px] text-slate-400 leading-tight mt-0.5">{theme.subtitle}</div>
                              </div>
                            </div>
                            {isSelected && <Check className="w-5 h-5 text-emerald-300 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Streak Counter */}
            <div 
              id="streak-badge"
              title="Daily Study Streak"
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/15 backdrop-blur-md border border-amber-400/30 text-amber-200 text-xs sm:text-sm font-bold shadow-md"
            >
              <Flame className="w-4.5 h-4.5 text-amber-400 fill-amber-400 animate-pulse" />
              <span>{streakDays}d Streak</span>
            </div>

            {/* Ambient Audio Toggle */}
            <button
              id="audio-synth-toggle-btn"
              onClick={toggleAmbientSound}
              title={ambientSound !== 'off' ? `Ambient focus sound playing (${ambientSound})` : 'Turn on ambient focus audio'}
              className={`px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all backdrop-blur-md shadow-md hover:scale-105 cursor-pointer ${
                ambientSound !== 'off'
                  ? 'bg-emerald-500/25 border-emerald-400/40 text-emerald-200 shadow-emerald-900/30'
                  : 'bg-white/[0.09] border-white/15 text-slate-200 hover:bg-white/[0.18] hover:text-white'
              }`}
            >
              {ambientSound !== 'off' ? (
                <>
                  <Volume2 className="w-4.5 h-4.5 text-emerald-300 animate-bounce" />
                  <span className="hidden sm:inline capitalize">{ambientSound}</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4.5 h-4.5 text-slate-400" />
                  <span className="hidden sm:inline">Focus Audio</span>
                </>
              )}
            </button>

            {/* Focus Pomodoro Timer Button */}
            <button
              id="open-pomodoro-timer-btn"
              onClick={openFocusTimer}
              className={`flex items-center gap-2.5 px-4.5 py-2.5 rounded-2xl border text-xs sm:text-sm font-bold transition-all backdrop-blur-md shadow-md hover:scale-105 cursor-pointer ${
                timerActive
                  ? 'bg-indigo-500/30 border-indigo-400/50 text-indigo-200 shadow-indigo-900/40 animate-pulse'
                  : 'bg-white/[0.09] border-white/15 text-slate-200 hover:bg-white/[0.18] hover:text-white'
              }`}
            >
              <Timer className="w-4.5 h-4.5 text-indigo-300" />
              <span>{timerActive ? timerRemainingFormatted : 'Pomodoro'}</span>
            </button>
          </div>
        </div>

        {/* Medium & Mobile Tabs - Large, Touch-Friendly, Horizontal Scrollable */}
        <div className="flex xl:hidden overflow-x-auto pt-3 pb-1 gap-2 border-t border-white/10 no-scrollbar mt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={`m-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2.5 px-4.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all backdrop-blur-md cursor-pointer ${
                  isActive
                    ? 'bg-white/25 border border-white/40 text-white shadow-lg scale-[1.02]'
                    : 'text-slate-300 hover:text-white bg-white/[0.06] border border-white/10'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

