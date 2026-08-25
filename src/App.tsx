import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { NotesManager } from './components/NotesManager';
import { RagChat } from './components/RagChat';
import { QuizArena } from './components/QuizArena';
import { FlashcardsDeck } from './components/FlashcardsDeck';
import { QuizHistoryView } from './components/QuizHistoryView';
import { FocusTimerModal } from './components/FocusTimerModal';

import { Note, QuizAttempt, Flashcard, UserStudyStats } from './types';
import { 
  getStoredNotes, 
  saveStoredNotes, 
  getActiveNoteId, 
  setActiveNoteId,
  getStoredQuizHistory, 
  saveQuizAttempt, 
  getStoredFlashcards, 
  saveStoredFlashcards, 
  getStoredUserStats, 
  saveStoredUserStats, 
  computeSubjectMastery 
} from './utils/storage';
import { audioSynth } from './utils/audioSynth';
import { ThemeId, THEMES, getStoredTheme, saveStoredTheme } from './utils/theme';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'notes' | 'rag_chat' | 'quiz' | 'flashcards' | 'history'>('dashboard');
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(getStoredTheme());
  
  // Data State
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteIdState] = useState<string | null>(null);
  const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [userStats, setUserStats] = useState<UserStudyStats>(getStoredUserStats());

  // Deep link helpers
  const [preselectedTopicForQuiz, setPreselectedTopicForQuiz] = useState<string | null>(null);
  const [preselectedAttemptForReview, setPreselectedAttemptForReview] = useState<string | null>(null);

  // Focus Pomodoro Timer State
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [timerMode, setTimerMode] = useState<'focus' | 'short_break' | 'long_break'>('focus');
  const [timerSecondsRemaining, setTimerSecondsRemaining] = useState(25 * 60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [ambientSound, setAmbientSound] = useState<string>('off');
  const [ambientVolume, setAmbientVolume] = useState<number>(0.25);

  const handleThemeChange = (newTheme: ThemeId) => {
    setCurrentTheme(newTheme);
    saveStoredTheme(newTheme);
  };

  // Initial Data Load
  useEffect(() => {
    const loadedNotes = getStoredNotes();
    setNotes(loadedNotes);

    const storedActiveId = getActiveNoteId() || (loadedNotes[0]?.id ?? null);
    setActiveNoteIdState(storedActiveId);

    const loadedHistory = getStoredQuizHistory();
    setQuizHistory(loadedHistory);

    const loadedCards = getStoredFlashcards();
    setFlashcards(loadedCards);

    const loadedStats = getStoredUserStats();
    setUserStats(loadedStats);
  }, []);

  // Timer Tick
  useEffect(() => {
    let timer: any = null;
    if (isTimerActive && timerSecondsRemaining > 0) {
      timer = setInterval(() => {
        setTimerSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsTimerActive(false);
            audioSynth.playChime();
            // Increment today's studied minutes in stats
            const durationMins = timerMode === 'focus' ? 25 : timerMode === 'short_break' ? 5 : 15;
            setUserStats((prevStats) => {
              const updated = {
                ...prevStats,
                totalMinutesStudied: prevStats.totalMinutesStudied + durationMins,
                todayMinutes: prevStats.todayMinutes + durationMins,
                totalSessions: prevStats.totalSessions + 1,
              };
              saveStoredUserStats(updated);
              return updated;
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerActive, timerSecondsRemaining, timerMode]);

  // Handle Note Selection
  const handleSelectNote = (id: string) => {
    setActiveNoteIdState(id);
    setActiveNoteId(id);
  };

  // Handle Note Save / Update
  const handleSaveNote = (updatedNote: Note) => {
    setNotes((prevNotes) => {
      const existingIndex = prevNotes.findIndex((n) => n.id === updatedNote.id);
      let updatedList: Note[];
      if (existingIndex >= 0) {
        updatedList = [...prevNotes];
        updatedList[existingIndex] = updatedNote;
      } else {
        updatedList = [updatedNote, ...prevNotes];
      }
      saveStoredNotes(updatedList);
      return updatedList;
    });
  };

  // Handle Note Deletion
  const handleDeleteNote = (noteId: string) => {
    setNotes((prevNotes) => {
      const filtered = prevNotes.filter((n) => n.id !== noteId);
      saveStoredNotes(filtered);
      if (activeNoteId === noteId) {
        const nextId = filtered[0]?.id || null;
        setActiveNoteIdState(nextId);
        if (nextId) setActiveNoteId(nextId);
      }
      return filtered;
    });
  };

  // Handle Quiz Attempt Saving
  const handleSaveQuizAttempt = (attempt: QuizAttempt) => {
    setQuizHistory((prev) => [attempt, ...prev]);
    saveQuizAttempt(attempt);
    setUserStats(getStoredUserStats());
  };

  // Handle Flashcards Update
  const handleUpdateFlashcard = (card: Flashcard) => {
    setFlashcards((prev) => {
      const updated = prev.map((c) => (c.id === card.id ? card : c));
      saveStoredFlashcards(updated);
      return updated;
    });
  };

  const handleAddFlashcard = (card: Flashcard) => {
    setFlashcards((prev) => {
      const updated = [card, ...prev];
      saveStoredFlashcards(updated);
      return updated;
    });
  };

  const handleAddBatchFlashcards = (newCards: Flashcard[]) => {
    setFlashcards((prev) => {
      const existingIds = new Set(prev.map((c) => c.id));
      const filteredNew = newCards.filter((c) => !existingIds.has(c.id));
      const updated = [...filteredNew, ...prev];
      saveStoredFlashcards(updated);
      return updated;
    });
  };

  // Timer controls
  const handleToggleTimer = () => {
    setIsTimerActive((prev) => !prev);
  };

  const handleResetTimer = (minutes: number) => {
    setIsTimerActive(false);
    setTimerSecondsRemaining(minutes * 60);
  };

  const handleChangeTimerMode = (mode: 'focus' | 'short_break' | 'long_break') => {
    setTimerMode(mode);
    setIsTimerActive(false);
    const mins = mode === 'focus' ? 25 : mode === 'short_break' ? 5 : 15;
    setTimerSecondsRemaining(mins * 60);
  };

  const handleChangeAmbientSound = (snd: string) => {
    setAmbientSound(snd);
    if (snd === 'off') {
      audioSynth.stop();
    } else {
      audioSynth.playSoundtrack(snd as any, ambientVolume);
    }
  };

  const handleChangeAmbientVolume = (vol: number) => {
    setAmbientVolume(vol);
    audioSynth.setVolume(vol);
  };

  const subjectMastery = computeSubjectMastery(notes, quizHistory, flashcards);

  const mins = Math.floor(timerSecondsRemaining / 60);
  const secs = timerSecondsRemaining % 60;
  const formattedTimer = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

  const currentThemeObj = THEMES[currentTheme];

  return (
    <div id="study-buddy-app" className={`min-h-screen bg-gradient-to-br ${currentThemeObj.bgGradient} text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden`}>
      
      {/* Luminous Ambient Frosted Glow Orbs with Theme Adaptation */}
      <div className={`fixed top-[-10%] left-[-5%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-br ${currentThemeObj.orb1} blur-[120px] pointer-events-none z-0`} />
      <div className={`fixed bottom-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tl ${currentThemeObj.orb2} blur-[140px] pointer-events-none z-0`} />
      <div className={`fixed top-[40%] right-[15%] w-[30vw] h-[30vw] rounded-full bg-gradient-to-bl ${currentThemeObj.orb3} blur-[100px] pointer-events-none z-0`} />

      {/* Top Main Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        streakDays={userStats.currentStreakDays}
        openFocusTimer={() => setIsTimerModalOpen(true)}
        ambientSound={ambientSound}
        setAmbientSound={handleChangeAmbientSound}
        timerActive={isTimerActive}
        timerRemainingFormatted={formattedTimer}
        currentTheme={currentTheme}
        onChangeTheme={handleThemeChange}
      />

      {/* Main Content View Switcher with Comfortable Spacious Width */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-12 pt-8 pb-16 relative z-10">
        {activeTab === 'dashboard' && (
          <Dashboard
            stats={userStats}
            notes={notes}
            quizHistory={quizHistory}
            flashcards={flashcards}
            subjectMastery={subjectMastery}
            onNavigate={(tab) => setActiveTab(tab)}
            onSelectQuizToReview={(attempt) => {
              setPreselectedAttemptForReview(attempt.id);
              setActiveTab('history');
            }}
            onStartQuizForTopic={(topic) => {
              setPreselectedTopicForQuiz(topic);
              setActiveTab('quiz');
            }}
          />
        )}

        {activeTab === 'notes' && (
          <NotesManager
            notes={notes}
            activeNoteId={activeNoteId}
            onSelectActiveNote={handleSelectNote}
            onSaveNote={handleSaveNote}
            onDeleteNote={handleDeleteNote}
            onAddFlashcards={handleAddBatchFlashcards}
            onNavigateToQnA={(noteId) => {
              handleSelectNote(noteId);
              setActiveTab('rag_chat');
            }}
            onNavigateToQuiz={(noteId) => {
              handleSelectNote(noteId);
              const note = notes.find((n) => n.id === noteId);
              if (note) setPreselectedTopicForQuiz(note.title);
              setActiveTab('quiz');
            }}
          />
        )}

        {activeTab === 'rag_chat' && (
          <RagChat
            notes={notes}
            activeNoteId={activeNoteId}
            onSelectActiveNote={handleSelectNote}
            onLaunchQuizFromConcept={(concept) => {
              setPreselectedTopicForQuiz(concept);
              setActiveTab('quiz');
            }}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizArena
            notes={notes}
            activeNoteId={activeNoteId}
            onSaveQuizAttempt={handleSaveQuizAttempt}
            preselectedTopic={preselectedTopicForQuiz}
            onClearPreselectedTopic={() => setPreselectedTopicForQuiz(null)}
          />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardsDeck
            flashcards={flashcards}
            notes={notes}
            onUpdateFlashcard={handleUpdateFlashcard}
            onAddFlashcard={handleAddFlashcard}
          />
        )}

        {activeTab === 'history' && (
          <QuizHistoryView
            quizHistory={quizHistory}
            preselectedAttemptId={preselectedAttemptForReview}
            onRetakeTopic={(topic) => {
              setPreselectedTopicForQuiz(topic);
              setActiveTab('quiz');
            }}
          />
        )}
      </main>

      {/* Focus Timer Modal Dialog */}
      <FocusTimerModal
        isOpen={isTimerModalOpen}
        onClose={() => setIsTimerModalOpen(false)}
        secondsRemaining={timerSecondsRemaining}
        isActive={isTimerActive}
        onToggleTimer={handleToggleTimer}
        onResetTimer={handleResetTimer}
        currentMode={timerMode}
        onChangeMode={handleChangeTimerMode}
        ambientSound={ambientSound}
        onChangeAmbientSound={handleChangeAmbientSound}
        ambientVolume={ambientVolume}
        onChangeAmbientVolume={handleChangeAmbientVolume}
      />

    </div>
  );
}
