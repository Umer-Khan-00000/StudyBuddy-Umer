import React, { useState } from 'react';
import { 
  History, 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  Download, 
  Search, 
  Calendar, 
  Clock, 
  Target, 
  HelpCircle,
  Lightbulb,
  Award
} from 'lucide-react';
import { QuizAttempt } from '../types';

interface QuizHistoryViewProps {
  quizHistory: QuizAttempt[];
  onRetakeTopic: (topic: string) => void;
  preselectedAttemptId?: string | null;
}

export const QuizHistoryView: React.FC<QuizHistoryViewProps> = ({
  quizHistory,
  onRetakeTopic,
  preselectedAttemptId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'perfect' | 'review'>('all');
  const [expandedAttemptId, setExpandedAttemptId] = useState<string | null>(
    preselectedAttemptId || (quizHistory[0]?.id ?? null)
  );

  const filteredHistory = quizHistory.filter(attempt => {
    const matchesSearch = attempt.quizTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          attempt.topic.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (selectedFilter === 'perfect') return attempt.scorePercentage >= 90;
    if (selectedFilter === 'review') return attempt.scorePercentage < 75;
    return true;
  });

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(quizHistory, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `studybuddy_quiz_history_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}m ${rem}s`;
  };

  return (
    <div id="quiz-history-view" className="space-y-8 pb-12">
      
      {/* Header Bar */}
      <div className="bg-white/[0.07] backdrop-blur-2xl p-5 rounded-3xl border border-white/15 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-300" />
            <h2 className="text-xl font-bold text-white">Saved Quiz History & Progress Logs</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Revisit past quiz attempts, review missed questions, analyze AI feedback, and retake tricky topics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 text-xs font-semibold backdrop-blur-md transition-all hover:text-white"
          >
            <Download className="w-4 h-4 text-indigo-300" /> Export JSON
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/[0.05] backdrop-blur-xl p-4 rounded-3xl border border-white/12">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-300 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search quiz topic or title..."
            className="w-full pl-9 pr-3 py-2 rounded-2xl bg-white/[0.06] border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 backdrop-blur-md"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: `All Attempts (${quizHistory.length})` },
            { id: 'perfect', label: 'Score ≥ 90%' },
            { id: 'review', label: 'Needs Review (<75%)' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id as any)}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all backdrop-blur-md ${
                selectedFilter === f.id
                  ? 'bg-white/25 text-white border border-white/40 shadow-sm'
                  : 'bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.1] border border-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quiz History List */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-16 bg-white/[0.05] rounded-3xl border border-white/10 backdrop-blur-xl text-slate-300 space-y-2">
            <HelpCircle className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-sm font-medium">No quiz attempts matching your filter.</p>
          </div>
        ) : (
          filteredHistory.map((attempt) => {
            const isExpanded = expandedAttemptId === attempt.id;
            const isHigh = attempt.scorePercentage >= 80;
            const isMid = attempt.scorePercentage >= 60 && attempt.scorePercentage < 80;

            return (
              <div
                key={attempt.id}
                className="bg-white/[0.07] backdrop-blur-2xl rounded-3xl border border-white/15 overflow-hidden shadow-xl transition-all"
              >
                {/* Header Row */}
                <div
                  onClick={() => setExpandedAttemptId(isExpanded ? null : attempt.id)}
                  className="p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-indigo-200 border border-white/15 backdrop-blur-sm">
                        {attempt.topic}
                      </span>
                      <span className="text-xs text-slate-300 font-medium capitalize">• {attempt.difficulty}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {attempt.quizTitle}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-slate-300 font-medium pt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(attempt.completedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTime(attempt.timeSpentSeconds)}
                      </span>
                    </div>
                  </div>

                  {/* Score Badge & Action */}
                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <div
                        className={`text-xl sm:text-2xl font-black drop-shadow-sm ${
                          isHigh ? 'text-emerald-300' : isMid ? 'text-amber-300' : 'text-rose-300'
                        }`}
                      >
                        {attempt.scorePercentage}%
                      </div>
                      <span className="text-[11px] text-slate-300">
                        {attempt.correctCount}/{attempt.totalQuestions} correct
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRetakeTopic(attempt.topic);
                      }}
                      className="px-3.5 py-1.5 rounded-2xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-xs font-semibold flex items-center gap-1 backdrop-blur-sm transition-all shadow-sm"
                    >
                      <RotateCcw className="w-3 h-3" /> Retake
                    </button>

                    <div className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 transition-colors">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Detailed Question Breakdown */}
                {isExpanded && (
                  <div className="border-t border-white/10 bg-black/20 p-5 sm:p-6 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Detailed Question-by-Question Breakdown
                    </h4>

                    <div className="space-y-3.5">
                      {attempt.questionResults.map((result, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-2xl border backdrop-blur-md space-y-2.5 ${
                            result.isCorrect
                              ? 'bg-emerald-500/[0.07] border-emerald-400/25'
                              : 'bg-rose-500/[0.07] border-rose-400/25'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <span className="text-[11px] font-bold text-slate-300">Question {idx + 1} ({result.conceptTested})</span>
                              <p className="text-xs sm:text-sm font-semibold text-white">{result.questionText}</p>
                            </div>

                            {result.isCorrect ? (
                              <span className="flex items-center gap-1 text-xs font-bold text-emerald-300 whitespace-nowrap bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs font-bold text-rose-300 whitespace-nowrap bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-400/30">
                                <XCircle className="w-3.5 h-3.5" /> Missed
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white/[0.04] p-3 rounded-xl border border-white/10">
                            <div>
                              <span className="text-slate-400">Submitted:</span>
                              <p className={`font-semibold ${result.isCorrect ? 'text-emerald-300' : 'text-rose-300'}`}>
                                {result.studentAnswer}
                              </p>
                            </div>
                            <div>
                              <span className="text-slate-400">Benchmark Correct:</span>
                              <p className="font-semibold text-slate-200">{result.correctAnswer}</p>
                            </div>
                          </div>

                          {result.aiFeedback && (
                            <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-400/25 text-xs text-purple-200 backdrop-blur-sm">
                              <span className="font-bold">AI Evaluator Feedback:</span> {result.aiFeedback.feedback}
                            </div>
                          )}

                          <div className="p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-400/25 text-xs text-indigo-200 flex items-start gap-2 backdrop-blur-sm">
                            <Lightbulb className="w-3.5 h-3.5 text-indigo-300 flex-shrink-0 mt-0.5" />
                            <span><strong>Explanation:</strong> {result.explanation}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
