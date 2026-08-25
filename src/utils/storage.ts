import { Note, QuizAttempt, Flashcard, UserStudyStats, SubjectMastery } from '../types';
import { SAMPLE_NOTES } from '../data/sampleNotes';

const STORAGE_KEYS = {
  NOTES: 'studybuddy_notes_v1',
  QUIZ_HISTORY: 'studybuddy_quiz_history_v1',
  FLASHCARDS: 'studybuddy_flashcards_v1',
  USER_STATS: 'studybuddy_user_stats_v1',
  ACTIVE_NOTE_ID: 'studybuddy_active_note_id_v1',
};

const DEFAULT_STATS: UserStudyStats = {
  totalSessions: 12,
  totalMinutesStudied: 195,
  totalQuestionsAttempted: 45,
  totalQuestionsCorrect: 39,
  overallAccuracy: 86.6,
  currentStreakDays: 4,
  lastStudyDate: new Date().toISOString().split('T')[0],
  masteryPoints: 840,
  dailyGoalMinutes: 30,
  todayMinutes: 25,
};

const SAMPLE_QUIZ_ATTEMPTS: QuizAttempt[] = [
  {
    id: 'attempt-1',
    quizId: 'quiz-sample-1',
    quizTitle: 'Cellular Respiration Mastery Quiz',
    topic: 'Biology',
    difficulty: 'medium',
    totalQuestions: 4,
    correctCount: 4,
    scorePercentage: 100,
    timeSpentSeconds: 142,
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    questionResults: [
      {
        questionId: 'q1',
        questionType: 'multiple_choice',
        questionText: 'Where does Glycolysis take place in a eukaryotic cell?',
        studentAnswer: 'Cytoplasm / Cytosol',
        correctAnswer: 'Cytoplasm / Cytosol',
        isCorrect: true,
        scorePercent: 100,
        explanation: 'Glycolysis is an anaerobic pathway occurring entirely in the cytosol.',
        conceptTested: 'Glycolysis Localization'
      },
      {
        questionId: 'q2',
        questionType: 'multiple_choice',
        questionText: 'What is the terminal electron acceptor in the electron transport chain?',
        studentAnswer: 'Oxygen (O2)',
        correctAnswer: 'Oxygen (O2)',
        isCorrect: true,
        scorePercent: 100,
        explanation: 'Oxygen binds with protons and electrons at Complex IV to form water.',
        conceptTested: 'Electron Transport Chain'
      },
      {
        questionId: 'q3',
        questionType: 'true_false',
        questionText: 'ATP Synthase operates via chemiosmosis driven by a proton gradient.',
        studentAnswer: 'True',
        correctAnswer: 'True',
        isCorrect: true,
        scorePercent: 100,
        explanation: 'The electrochemical gradient across the inner membrane rotates the ATP synthase rotor.',
        conceptTested: 'Chemiosmosis'
      },
      {
        questionId: 'q4',
        questionType: 'fill_blank',
        questionText: 'The stage of cellular respiration that produces the majority of ATP is called ________.',
        studentAnswer: 'Oxidative Phosphorylation',
        correctAnswer: 'Oxidative Phosphorylation',
        isCorrect: true,
        scorePercent: 100,
        explanation: 'Oxidative phosphorylation generates roughly 28-30 ATP of the total 32 ATP yield.',
        conceptTested: 'ATP Yield Breakdown'
      }
    ]
  },
  {
    id: 'attempt-2',
    quizId: 'quiz-sample-2',
    quizTitle: 'Concurrency & Deadlock Fundamentals',
    topic: 'Computer Science',
    difficulty: 'hard',
    totalQuestions: 4,
    correctCount: 3,
    scorePercentage: 75,
    timeSpentSeconds: 210,
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    questionResults: [
      {
        questionId: 'q1',
        questionType: 'multiple_choice',
        questionText: 'Which of the following is NOT one of the 4 Coffman conditions for deadlocks?',
        studentAnswer: 'Priority Inversion',
        correctAnswer: 'Priority Inversion',
        isCorrect: true,
        scorePercent: 100,
        explanation: 'The four Coffman conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.',
        conceptTested: 'Coffman Conditions'
      },
      {
        questionId: 'q2',
        questionType: 'multiple_choice',
        questionText: 'What is the primary difference between a Mutex and a Counting Semaphore?',
        studentAnswer: 'Mutex is faster, Semaphore is slower',
        correctAnswer: 'Mutex is exclusive to 1 thread, Semaphore allows N concurrent threads',
        isCorrect: false,
        scorePercent: 0,
        explanation: 'Mutex has strict ownership (1 thread), whereas a Counting Semaphore tracks N units of available resources.',
        conceptTested: 'Mutex vs Semaphore'
      },
      {
        questionId: 'q3',
        questionType: 'true_false',
        questionText: 'Eliminating the circular wait condition by imposing resource ordering prevents deadlocks.',
        studentAnswer: 'True',
        correctAnswer: 'True',
        isCorrect: true,
        scorePercent: 100,
        explanation: 'Ordering all resource requests numerically prevents circular dependencies.',
        conceptTested: 'Deadlock Prevention'
      },
      {
        questionId: 'q4',
        questionType: 'conceptual',
        questionText: 'Explain how Banker\'s algorithm avoids deadlocks.',
        studentAnswer: 'It tests if allocating resources leaves the system in a safe state before granting requests.',
        correctAnswer: 'It simulates max resource allocation to ensure at least one execution path can finish without deadlock.',
        isCorrect: true,
        scorePercent: 90,
        explanation: 'Good comprehension of safe state evaluation.',
        conceptTested: 'Banker\'s Algorithm',
        aiFeedback: {
          score: 90,
          feedback: 'Accurate and concise! You correctly identified safe state testing before granting resource allocations.',
          keyStrengths: ['Mentioned safe state validation', 'Understood preventive check before granting allocation'],
          missingPoints: ['Could mention Dijkstra or worst-case maximum claims']
        }
      }
    ]
  }
];

export function getStoredNotes(): Note[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(SAMPLE_NOTES));
      return SAMPLE_NOTES;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Error loading notes from storage:', e);
    return SAMPLE_NOTES;
  }
}

export function saveStoredNotes(notes: Note[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  } catch (e) {
    console.error('Error saving notes:', e);
  }
}

export function getActiveNoteId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_NOTE_ID);
}

export function setActiveNoteId(id: string): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_NOTE_ID, id);
}

export function getStoredQuizHistory(): QuizAttempt[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.QUIZ_HISTORY);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(SAMPLE_QUIZ_ATTEMPTS));
      return SAMPLE_QUIZ_ATTEMPTS;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Error loading quiz history:', e);
    return SAMPLE_QUIZ_ATTEMPTS;
  }
}

export function saveQuizAttempt(attempt: QuizAttempt): void {
  try {
    const current = getStoredQuizHistory();
    const updated = [attempt, ...current];
    localStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(updated));

    // Update stats automatically
    const stats = getStoredUserStats();
    stats.totalQuestionsAttempted += attempt.totalQuestions;
    stats.totalQuestionsCorrect += attempt.correctCount;
    stats.overallAccuracy = Math.round((stats.totalQuestionsCorrect / Math.max(1, stats.totalQuestionsAttempted)) * 1000) / 10;
    stats.totalMinutesStudied += Math.ceil(attempt.timeSpentSeconds / 60);
    stats.masteryPoints += Math.round(attempt.scorePercentage * (attempt.totalQuestions * 10) / 100);
    stats.totalSessions += 1;
    saveStoredUserStats(stats);
  } catch (e) {
    console.error('Error saving quiz attempt:', e);
  }
}

export function getStoredFlashcards(): Flashcard[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FLASHCARDS);
    if (!data) {
      // Seed from initial sample notes
      const initialCards: Flashcard[] = [];
      SAMPLE_NOTES.forEach(note => {
        note.flashcards.forEach(fc => {
          initialCards.push({
            id: fc.id,
            noteId: note.id,
            noteTitle: note.title,
            category: note.category,
            front: fc.front,
            back: fc.back,
            intervalDays: 1,
            easeFactor: 2.5,
            repetitions: 0,
            status: 'learning',
            nextReview: new Date().toISOString()
          });
        });
      });
      localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(initialCards));
      return initialCards;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Error loading flashcards:', e);
    return [];
  }
}

export function saveStoredFlashcards(cards: Flashcard[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(cards));
  } catch (e) {
    console.error('Error saving flashcards:', e);
  }
}

/**
 * SuperMemo SM-2 Spaced Repetition Algorithm rating updater
 * quality: 0 = Blackout, 1 = Incorrect, 2 = Hard, 3 = Good, 4 = Easy
 */
export function rateFlashcard(card: Flashcard, quality: number): Flashcard {
  const updated = { ...card };
  updated.lastReviewed = new Date().toISOString();

  if (quality < 2) {
    updated.repetitions = 0;
    updated.intervalDays = 1;
    updated.status = 'learning';
  } else {
    if (updated.repetitions === 0) {
      updated.intervalDays = 1;
    } else if (updated.repetitions === 1) {
      updated.intervalDays = 3;
    } else {
      updated.intervalDays = Math.round(updated.intervalDays * updated.easeFactor);
    }
    updated.repetitions += 1;

    if (updated.repetitions >= 3 && updated.intervalDays >= 7) {
      updated.status = 'mastered';
    } else {
      updated.status = 'learning';
    }
  }

  // Update ease factor: EF' = EF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  const newEF = updated.easeFactor + (0.1 - (4 - quality) * (0.08 + (4 - quality) * 0.02));
  updated.easeFactor = Math.max(1.3, Math.min(3.0, newEF));

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + updated.intervalDays);
  updated.nextReview = nextDate.toISOString();

  return updated;
}

export function getStoredUserStats(): UserStudyStats {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_STATS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(DEFAULT_STATS));
      return DEFAULT_STATS;
    }
    const parsed = JSON.parse(data);
    return { ...DEFAULT_STATS, ...parsed };
  } catch (e) {
    console.error('Error loading user stats:', e);
    return DEFAULT_STATS;
  }
}

export function saveStoredUserStats(stats: UserStudyStats): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(stats));
  } catch (e) {
    console.error('Error saving user stats:', e);
  }
}

export function computeSubjectMastery(notes: Note[], history: QuizAttempt[], flashcards: Flashcard[]): SubjectMastery[] {
  const subjectsMap: Record<string, { totalQuizzes: number; totalScore: number; masteredCards: number; notesCount: number }> = {};

  // Initialize from notes
  notes.forEach(note => {
    if (!subjectsMap[note.category]) {
      subjectsMap[note.category] = { totalQuizzes: 0, totalScore: 0, masteredCards: 0, notesCount: 0 };
    }
    subjectsMap[note.category].notesCount += 1;
  });

  // Calculate quiz attempts per topic
  history.forEach(attempt => {
    const topic = attempt.topic || 'General';
    if (!subjectsMap[topic]) {
      subjectsMap[topic] = { totalQuizzes: 0, totalScore: 0, masteredCards: 0, notesCount: 0 };
    }
    subjectsMap[topic].totalQuizzes += 1;
    subjectsMap[topic].totalScore += attempt.scorePercentage;
  });

  // Mastered flashcards
  flashcards.forEach(card => {
    const cat = card.category || 'General';
    if (!subjectsMap[cat]) {
      subjectsMap[cat] = { totalQuizzes: 0, totalScore: 0, masteredCards: 0, notesCount: 0 };
    }
    if (card.status === 'mastered') {
      subjectsMap[cat].masteredCards += 1;
    }
  });

  return Object.entries(subjectsMap).map(([subject, data]) => {
    const avgScore = data.totalQuizzes > 0 ? Math.round(data.totalScore / data.totalQuizzes) : 75;
    let status: 'Mastered' | 'In Progress' | 'Needs Review' = 'In Progress';
    if (avgScore >= 85 && (data.totalQuizzes >= 1 || data.masteredCards >= 2)) {
      status = 'Mastered';
    } else if (avgScore < 70) {
      status = 'Needs Review';
    }
    return {
      subject,
      totalQuizzes: data.totalQuizzes,
      avgScore,
      masteredCards: data.masteredCards,
      notesCount: data.notesCount,
      status
    };
  });
}
