import React from 'react';
import { 
  Flame, 
  Target, 
  CheckCircle2, 
  BookOpen, 
  Trophy, 
  TrendingUp, 
  HelpCircle, 
  MessageSquareQuote, 
  Clock, 
  ArrowRight, 
  BrainCircuit, 
  Award, 
  AlertCircle,
  Play,
  RotateCcw
} from 'lucide-react';
import { Note, QuizAttempt, Flashcard, UserStudyStats, SubjectMastery } from '../types';

interface DashboardProps {
  stats: UserStudyStats;
  notes: Note[];
  quizHistory: QuizAttempt[];
  flashcards: Flashcard[];
  subjectMastery: SubjectMastery[];
  onNavigate: (tab: 'dashboard' | 'notes' | 'rag_chat' | 'quiz' | 'flashcards' | 'history') => void;
  onSelectQuizToReview: (attempt: QuizAttempt) => void;
  onStartQuizForTopic: (topic: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  notes,
  quizHistory,
  flashcards,
  subjectMastery,
  onNavigate,
  onSelectQuizToReview,
  onStartQuizForTopic,
}) => {
  const recentAttempts = quizHistory.slice(0, 4);

  // Identify weak spots (concepts or topics with score < 75%)
  const weakSpots: { topic: string; missedQuestionsCount: number; lastScore: number }[] = [];
  quizHistory.forEach(attempt => {
    if (attempt.scorePercentage < 75) {
      const missedCount = attempt.questionResults.filter(q => !q.isCorrect).length;
      const existing = weakSpots.find(w => w.topic === attempt.topic);
      if (!existing) {
        weakSpots.push({
          topic: attempt.topic,
          missedQuestionsCount: missedCount,
          lastScore: attempt.scorePercentage,
        });
      }
    }
  });

  const masteredCount = flashcards.filter(f => f.status === 'mastered').length;
  const learningCount = flashcards.filter(f => f.status === 'learning').length;

  return (
    <div id="student-dashboard" className="space-y-8 pb-12">
      
      {/* Welcome & Goal Banner */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-fuchsia-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold shadow-sm">
              <BrainCircuit className="w-4 h-4 text-indigo-300" />
              Active Study Session
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
              Welcome Back to Study Buddy
            </h1>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              Your RAG-powered knowledge base is indexed with <span className="font-semibold text-white">{notes.length} study guides</span>. 
              Review concepts with Feynman explanations, test your recall in the Quiz Arena, and level up your mastery.
            </p>
          </div>

          {/* Quick Start Study CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="cta-ask-question-btn"
              onClick={() => onNavigate('rag_chat')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/40 backdrop-blur-md border border-white/20 transition-all hover:scale-[1.02]"
            >
              <MessageSquareQuote className="w-4 h-4" />
              Ask Study Buddy
            </button>
            <button
              id="cta-start-quiz-btn"
              onClick={() => onNavigate('quiz')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-600/40 backdrop-blur-md border border-white/20 transition-all hover:scale-[1.02]"
            >
              <HelpCircle className="w-4 h-4" />
              Launch Quiz Arena
            </button>
          </div>
        </div>
      </div>

      {/* KPI Core Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Streak Metric */}
        <div className="bg-white/[0.07] backdrop-blur-xl rounded-2xl p-5 border border-white/15 shadow-lg hover:border-white/30 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Current Streak</span>
            <div className="p-2 rounded-xl bg-amber-500/20 backdrop-blur-md text-amber-300 border border-amber-400/30">
              <Flame className="w-5 h-5 fill-amber-400/30" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white drop-shadow-sm">{stats.currentStreakDays} Days</div>
            <p className="text-xs text-amber-200 mt-1 font-medium">Daily habit active</p>
          </div>
        </div>

        {/* Quiz Accuracy */}
        <div className="bg-white/[0.07] backdrop-blur-xl rounded-2xl p-5 border border-white/15 shadow-lg hover:border-white/30 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Quiz Accuracy</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-400/30">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-300 drop-shadow-sm">{stats.overallAccuracy}%</div>
            <p className="text-xs text-slate-300 mt-1">{stats.totalQuestionsCorrect} / {stats.totalQuestionsAttempted} answers correct</p>
          </div>
        </div>

        {/* Study Time / Sessions */}
        <div className="bg-white/[0.07] backdrop-blur-xl rounded-2xl p-5 border border-white/15 shadow-lg hover:border-white/30 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Study Time</span>
            <div className="p-2 rounded-xl bg-indigo-500/20 backdrop-blur-md text-indigo-300 border border-indigo-400/30">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white drop-shadow-sm">{stats.totalMinutesStudied} mins</div>
            <p className="text-xs text-slate-300 mt-1">{stats.totalSessions} study & quiz sessions</p>
          </div>
        </div>

        {/* Mastery Points */}
        <div className="bg-white/[0.07] backdrop-blur-xl rounded-2xl p-5 border border-white/15 shadow-lg hover:border-white/30 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Mastery Score</span>
            <div className="p-2 rounded-xl bg-purple-500/20 backdrop-blur-md text-purple-300 border border-purple-400/30">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-purple-200 drop-shadow-sm">{stats.masteryPoints} pts</div>
            <p className="text-xs text-slate-300 mt-1">{masteredCount} flashcards mastered</p>
          </div>
        </div>

      </div>

      {/* Main Grid: Subject Mastery & Weak Spots vs Recent History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Subject Mastery & Targeted Action */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Subject Mastery Progress Matrix */}
          <div className="bg-white/[0.07] backdrop-blur-2xl rounded-3xl p-6 border border-white/15 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-5 h-5 text-indigo-300" />
                <h2 className="text-base sm:text-lg font-bold text-white">Subject Mastery Progress</h2>
              </div>
              <button
                onClick={() => onNavigate('notes')}
                className="text-xs font-semibold text-indigo-300 hover:text-white flex items-center gap-1 transition-colors"
              >
                Manage Notes <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {subjectMastery.map((subj) => {
                const getStatusColor = (status: string) => {
                  if (status === 'Mastered') return 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40';
                  if (status === 'Needs Review') return 'bg-rose-500/20 text-rose-200 border-rose-400/40';
                  return 'bg-indigo-500/20 text-indigo-200 border-indigo-400/40';
                };

                const getBarColor = (score: number) => {
                  if (score >= 85) return 'bg-gradient-to-r from-emerald-500 to-teal-400';
                  if (score >= 70) return 'bg-gradient-to-r from-indigo-500 to-purple-500';
                  return 'bg-gradient-to-r from-rose-500 to-amber-500';
                };

                return (
                  <div 
                    key={subj.subject}
                    className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/10 hover:border-white/25 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-sm text-white">{subj.subject}</span>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-sm ${getStatusColor(subj.status)}`}>
                          {subj.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-300 font-medium">Avg Score:</span>
                        <span className="text-sm font-bold text-white">{subj.avgScore}%</span>
                        <button
                          onClick={() => onStartQuizForTopic(subj.subject)}
                          className="ml-2 text-xs font-medium px-2.5 py-1 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/35 text-indigo-200 border border-indigo-400/30 flex items-center gap-1 transition-all"
                        >
                          <Play className="w-3 h-3" /> Quiz
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden backdrop-blur-sm">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 shadow-sm ${getBarColor(subj.avgScore)}`}
                        style={{ width: `${Math.max(8, Math.min(100, subj.avgScore))}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>{subj.notesCount} note guides indexed</span>
                      <span>{subj.totalQuizzes} quiz attempts recorded</span>
                      <span>{subj.masteredCards} cards mastered</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weak Spots & Recommended Review */}
          {weakSpots.length > 0 && (
            <div className="bg-rose-500/[0.08] backdrop-blur-2xl rounded-3xl p-6 border border-rose-400/25 shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">Targeted Reinforcement Areas</h3>
              </div>
              <p className="text-xs text-slate-200">
                Concepts where recent quiz accuracy dipped below 75%. Strengthening these will maximize test readiness:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {weakSpots.map((spot, i) => (
                  <div 
                    key={i}
                    className="p-3.5 rounded-2xl bg-white/[0.05] backdrop-blur-md border border-rose-400/30 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-white">{spot.topic}</h4>
                      <p className="text-xs text-rose-300 mt-0.5">{spot.missedQuestionsCount} missed questions ({spot.lastScore}% score)</p>
                    </div>
                    <button
                      onClick={() => onStartQuizForTopic(spot.topic)}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1 transition-all whitespace-nowrap shadow-md shadow-rose-900/30 border border-white/20"
                    >
                      <RotateCcw className="w-3 h-3" /> Practice
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Spaced Repetition Flashcards Summary */}
          <div className="bg-white/[0.07] backdrop-blur-2xl rounded-3xl p-6 border border-white/15 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-300" />
                <h3 className="text-base font-bold text-white">Spaced Repetition Flashcards (SRS)</h3>
              </div>
              <p className="text-xs text-slate-300">
                You have <span className="font-semibold text-emerald-300">{masteredCount} mastered</span> and <span className="font-semibold text-amber-300">{learningCount} active learning</span> flashcards.
              </p>
            </div>
            <button
              onClick={() => onNavigate('flashcards')}
              className="px-4 py-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/25 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap backdrop-blur-md transition-all shadow-md"
            >
              Flip Cards Deck <ArrowRight className="w-4 h-4 text-indigo-300" />
            </button>
          </div>

        </div>

        {/* Right 1 Col: Saved Quiz History & Instant Review */}
        <div className="space-y-6">
          
          <div className="bg-white/[0.07] backdrop-blur-2xl rounded-3xl p-6 border border-white/15 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Recent Quiz History</h3>
              </div>
              <button
                onClick={() => onNavigate('history')}
                className="text-xs font-semibold text-indigo-300 hover:text-white flex items-center gap-0.5 transition-colors"
              >
                View All ({quizHistory.length})
              </button>
            </div>

            {recentAttempts.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No quiz history yet. Take your first quiz in the Quiz Arena!
              </div>
            ) : (
              <div className="space-y-3">
                {recentAttempts.map((attempt) => {
                  const isHigh = attempt.scorePercentage >= 80;
                  const isMid = attempt.scorePercentage >= 60 && attempt.scorePercentage < 80;
                  return (
                    <div
                      key={attempt.id}
                      onClick={() => onSelectQuizToReview(attempt)}
                      className="p-3.5 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/10 hover:border-indigo-400/40 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-white group-hover:text-indigo-200 transition-colors">
                          {attempt.quizTitle}
                        </span>
                        <span 
                          className={`text-xs font-extrabold px-2 py-0.5 rounded-lg backdrop-blur-sm ${
                            isHigh
                              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'
                              : isMid
                              ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40'
                              : 'bg-rose-500/20 text-rose-200 border border-rose-400/40'
                          }`}
                        >
                          {attempt.scorePercentage}%
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-300">
                        <span>{attempt.topic}</span>
                        <span>{attempt.correctCount}/{attempt.totalQuestions} correct</span>
                        <span>{new Date(attempt.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              id="dash-take-new-quiz-btn"
              onClick={() => onNavigate('quiz')}
              className="w-full py-2.5 rounded-2xl bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/40 backdrop-blur-md border border-white/20"
            >
              <HelpCircle className="w-4 h-4" />
              Generate Adaptive Quiz
            </button>
          </div>

          {/* Quick Study Tip Card */}
          <div className="p-5 rounded-3xl bg-indigo-500/[0.09] backdrop-blur-2xl border border-indigo-400/25 text-indigo-100 text-xs space-y-2 shadow-lg">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <BrainCircuit className="w-4 h-4 text-indigo-300" />
              Active Recall Strategy
            </div>
            <p className="text-slate-200 leading-relaxed">
              When studying notes, switch between the <strong>Feynman Explanation</strong> to grasp first principles and the <strong>Quiz Arena</strong> with open-ended reasoning to test retrieval strength.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
