export type TeachingMode = 'feynman' | 'eli5' | 'deep_dive' | 'mnemonics' | 'direct';

export interface KeyTerm {
  term: string;
  definition: string;
  significance?: string;
}

export interface NoteFlashcard {
  id: string;
  front: string;
  back: string;
  category?: string;
}

export interface Note {
  id: string;
  title: string;
  category: string;
  content: string;
  summaryBullets: string[];
  keyTerms: KeyTerm[];
  flashcards: NoteFlashcard[];
  potentialExamQuestions?: string[];
  complexityLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  colorTag: string;
}

export interface QnACitation {
  noteId: string;
  noteTitle: string;
  quoteSnippet: string;
  relevance?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  mode?: TeachingMode;
  citations?: QnACitation[];
  followUpChecks?: string[];
  timestamp: string;
  isLoading?: boolean;
}

export type QuizQuestionType = 'multiple_choice' | 'true_false' | 'fill_blank' | 'conceptual';

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  acceptableAnswers?: string[];
  explanation: string;
  conceptTested: string;
  hint?: string;
}

export interface Quiz {
  id: string;
  title: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedMinutes: number;
  summary: string;
  questions: QuizQuestion[];
  sourceNoteId?: string;
  createdAt: string;
}

export interface StudentAnswerRecord {
  questionId: string;
  questionType: QuizQuestionType;
  questionText: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  scorePercent: number;
  explanation: string;
  conceptTested: string;
  aiFeedback?: {
    score: number;
    feedback: string;
    keyStrengths: string[];
    missingPoints: string[];
    suggestedModelAnswer?: string;
  };
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  topic: string;
  difficulty: string;
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  timeSpentSeconds: number;
  completedAt: string;
  questionResults: StudentAnswerRecord[];
}

export interface Flashcard {
  id: string;
  noteId?: string;
  noteTitle?: string;
  category: string;
  front: string;
  back: string;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  lastReviewed?: string;
  nextReview?: string;
  status: 'new' | 'learning' | 'mastered';
}

export interface SubjectMastery {
  subject: string;
  totalQuizzes: number;
  avgScore: number;
  masteredCards: number;
  notesCount: number;
  status: 'Mastered' | 'In Progress' | 'Needs Review';
}

export interface UserStudyStats {
  totalSessions: number;
  totalMinutesStudied: number;
  totalQuestionsAttempted: number;
  totalQuestionsCorrect: number;
  overallAccuracy: number;
  currentStreakDays: number;
  lastStudyDate: string;
  masteryPoints: number;
  dailyGoalMinutes: number;
  todayMinutes: number;
}
