import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Trophy, 
  RotateCcw, 
  Lightbulb, 
  ArrowRight, 
  Play, 
  Award,
  BookOpen,
  Send,
  Save
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Note, Quiz, QuizQuestion, QuizAttempt, StudentAnswerRecord } from '../types';

interface QuizArenaProps {
  notes: Note[];
  activeNoteId: string | null;
  onSaveQuizAttempt: (attempt: QuizAttempt) => void;
  preselectedTopic?: string | null;
  onClearPreselectedTopic?: () => void;
}

export const QuizArena: React.FC<QuizArenaProps> = ({
  notes,
  activeNoteId,
  onSaveQuizAttempt,
  preselectedTopic,
  onClearPreselectedTopic,
}) => {
  // Setup Generator Form States
  const [selectedNoteId, setSelectedNoteId] = useState<string>(activeNoteId || (notes[0]?.id ?? 'all'));
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    'multiple_choice', 
    'true_false', 
    'fill_blank', 
    'conceptual'
  ]);
  const [customTopic, setCustomTopic] = useState<string>(preselectedTopic || '');

  // Active Quiz State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isGradingShortAnswer, setIsGradingShortAnswer] = useState<boolean>(false);
  const [shortAnswerEvaluations, setShortAnswerEvaluations] = useState<Record<string, any>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(0);
  const [quizTimerActive, setQuizTimerActive] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(0);

  // Completed Quiz Results State
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [finalAttempt, setFinalAttempt] = useState<QuizAttempt | null>(null);

  useEffect(() => {
    if (preselectedTopic) {
      setCustomTopic(preselectedTopic);
    }
  }, [preselectedTopic]);

  // Countdown timer for active quiz
  useEffect(() => {
    let interval: any = null;
    if (quizTimerActive && timeRemainingSeconds > 0 && !quizFinished) {
      interval = setInterval(() => {
        setTimeRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleFinishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizTimerActive, timeRemainingSeconds, quizFinished]);

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    let noteContent = '';
    let topicName = (customTopic || '').trim() || 'General Study Material';

    if (selectedNoteId !== 'all') {
      const targetNote = notes.find(n => n.id === selectedNoteId);
      if (targetNote) {
        noteContent = targetNote.content;
        if (!customTopic) topicName = targetNote.title;
      }
    } else if (notes.length > 0) {
      noteContent = notes.map(n => `--- ${n.title} ---\n${n.content}`).join('\n\n');
      if (!customTopic) topicName = notes[0]?.title ? `${notes[0].title} & Course Concepts` : 'Comprehensive Study Assessment';
    }

    const typesToUse = selectedTypes.length > 0 ? selectedTypes : ['multiple_choice', 'true_false', 'fill_blank', 'conceptual'];

    try {
      const response = await fetch('/api/study/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notesText: noteContent,
          topic: topicName,
          difficulty,
          questionCount,
          questionTypes: typesToUse,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const quizData: Quiz = await response.json();
      quizData.id = `quiz-${Date.now()}`;
      quizData.createdAt = new Date().toISOString();
      quizData.difficulty = difficulty;
      if (!quizData.questions || quizData.questions.length === 0) {
        throw new Error('No questions returned from quiz generator');
      }

      setActiveQuiz(quizData);
      setCurrentQuestionIndex(0);
      setStudentAnswers({});
      setShortAnswerEvaluations({});
      setShowHint(false);
      setQuizFinished(false);
      setFinalAttempt(null);

      // Start quiz timer: 1.5 mins per question
      const totalSeconds = (quizData.questions.length || 5) * 90;
      setTimeRemainingSeconds(totalSeconds);
      setQuizTimerActive(true);
      setStartTime(Date.now());
    } catch (err: any) {
      console.warn('Backend quiz generation warning, creating client-side assessment:', err);
      // Client-side emergency fallback
      const fallbackQuestions: QuizQuestion[] = [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: `What is the core pedagogical objective of studying ${topicName}?`,
          options: [
            `To master foundational principles and solve domain problems systematically`,
            `To memorize isolated facts without understanding cause and effect`,
            `To avoid empirical validation during hypothesis testing`,
            `To apply static assumptions across dynamic boundary variables`
          ],
          correctAnswer: `To master foundational principles and solve domain problems systematically`,
          explanation: `Academic mastery requires understanding underlying mechanisms and applying them to solve new problems.`,
          conceptTested: `Foundations of ${topicName}`,
          hint: `Choose the option that emphasizes deep conceptual understanding.`
        },
        {
          id: 'q2',
          type: 'true_false',
          question: `In ${topicName}, empirical validation and peer-reviewed verification are essential for establishing core principles.`,
          options: ['True', 'False'],
          correctAnswer: 'True',
          explanation: `True. Rigorous academic frameworks require claims to be grounded in observable facts and verified methodologies.`,
          conceptTested: `Scientific Rigor in ${topicName}`,
          hint: `Consider the fundamental role of evidence in learning.`
        },
        {
          id: 'q3',
          type: 'fill_blank',
          question: `The systematic review technique where students test themselves on active recall rather than passive reading is known as _______ practice.`,
          correctAnswer: 'retrieval',
          acceptableAnswers: ['retrieval', 'retrieval practice', 'active recall', 'active'],
          explanation: `Retrieval practice actively stimulates memory recall during the learning process, creating stronger neural pathways.`,
          conceptTested: `Active Recall Methodology`,
          hint: `Starts with 'retriev...' or describes active testing.`
        },
        {
          id: 'q4',
          type: 'conceptual',
          question: `Explain how you would apply the fundamental concepts of ${topicName} to solve a complex real-world case study.`,
          correctAnswer: `First, identify boundary constraints and initial variables. Next, apply governing laws and formulate a solution strategy. Finally, evaluate the outcome against physical and practical limits.`,
          explanation: `A structured analytical framework demonstrates deep conceptual understanding over rote memorization.`,
          conceptTested: `Practical Application of ${topicName}`,
          hint: `Walk through your systematic problem-solving steps.`
        },
        {
          id: 'q5',
          type: 'multiple_choice',
          question: `When analyzing complex relationships in ${topicName}, which approach prevents common cognitive biases?`,
          options: [
            `First-principles reasoning and controlled variable isolation`,
            `Relying purely on intuitive first impressions`,
            `Assuming correlation always implies direct causation`,
            `Disregarding anomalies and contradictory data points`
          ],
          correctAnswer: `First-principles reasoning and controlled variable isolation`,
          explanation: `Deconstructing a problem into its most fundamental truths and testing variables methodically prevents misinterpretation.`,
          conceptTested: `Critical Thinking & Problem Decomposition`,
          hint: `Select the method that uses rigorous logical deconstruction.`
        }
      ];

      const clientQuiz: Quiz = {
        id: `quiz-${Date.now()}`,
        title: `${topicName} Comprehensive Assessment`,
        topic: topicName,
        difficulty,
        estimatedMinutes: Math.ceil(fallbackQuestions.length * 1.5),
        summary: `A high-yield ${difficulty} assessment testing key concepts of ${topicName}.`,
        createdAt: new Date().toISOString(),
        questions: fallbackQuestions.slice(0, questionCount)
      };

      setActiveQuiz(clientQuiz);
      setCurrentQuestionIndex(0);
      setStudentAnswers({});
      setShortAnswerEvaluations({});
      setShowHint(false);
      setQuizFinished(false);
      setFinalAttempt(null);

      const totalSeconds = clientQuiz.questions.length * 90;
      setTimeRemainingSeconds(totalSeconds);
      setQuizTimerActive(true);
      setStartTime(Date.now());
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectAnswer = (questionId: string, answer: string) => {
    setStudentAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleEvaluateConceptualAnswer = async (q: QuizQuestion) => {
    const studentText = studentAnswers[q.id];
    if (!studentText || !studentText.trim() || isGradingShortAnswer) return;

    setIsGradingShortAnswer(true);
    try {
      const response = await fetch('/api/study/grade-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q.question,
          idealAnswer: q.correctAnswer,
          studentAnswer: studentText,
          conceptTested: q.conceptTested,
        }),
      });

      if (response.ok) {
        const feedback = await response.json();
        setShortAnswerEvaluations(prev => ({
          ...prev,
          [q.id]: feedback,
        }));
      }
    } catch (e) {
      console.error('Evaluation error:', e);
    } finally {
      setIsGradingShortAnswer(false);
    }
  };

  const handleFinishQuiz = async () => {
    if (!activeQuiz) return;
    setQuizTimerActive(false);

    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const questionResults: StudentAnswerRecord[] = [];
    let correctCount = 0;

    for (const q of activeQuiz.questions) {
      const submitted = (studentAnswers[q.id] || '').trim();
      let isCorrect = false;
      let scorePercent = 0;
      const aiFeedback = shortAnswerEvaluations[q.id];

      if (q.type === 'multiple_choice' || q.type === 'true_false') {
        isCorrect = submitted.toLowerCase() === q.correctAnswer.toLowerCase();
        scorePercent = isCorrect ? 100 : 0;
      } else if (q.type === 'fill_blank') {
        const acceptable = [q.correctAnswer, ...(q.acceptableAnswers || [])].map(a => a.toLowerCase().trim());
        isCorrect = acceptable.includes(submitted.toLowerCase());
        scorePercent = isCorrect ? 100 : 0;
      } else if (q.type === 'conceptual') {
        if (aiFeedback) {
          scorePercent = aiFeedback.score || 0;
          isCorrect = aiFeedback.isPass ?? scorePercent >= 65;
        } else {
          // Fallback if not evaluated live
          isCorrect = submitted.length > 15;
          scorePercent = isCorrect ? 80 : 20;
        }
      }

      if (isCorrect) correctCount += 1;

      questionResults.push({
        questionId: q.id,
        questionType: q.type,
        questionText: q.question,
        studentAnswer: submitted || '(No answer provided)',
        correctAnswer: q.correctAnswer,
        isCorrect,
        scorePercent,
        explanation: q.explanation,
        conceptTested: q.conceptTested,
        aiFeedback,
      });
    }

    const scorePercentage = Math.round((correctCount / activeQuiz.questions.length) * 100);

    const attempt: QuizAttempt = {
      id: `attempt-${Date.now()}`,
      quizId: activeQuiz.id,
      quizTitle: activeQuiz.title || `${activeQuiz.topic} Quiz`,
      topic: activeQuiz.topic,
      difficulty: activeQuiz.difficulty,
      totalQuestions: activeQuiz.questions.length,
      correctCount,
      scorePercentage,
      timeSpentSeconds: timeSpent,
      completedAt: new Date().toISOString(),
      questionResults,
    };

    setFinalAttempt(attempt);
    setQuizFinished(true);
    onSaveQuizAttempt(attempt);

    // Fire Confetti on high score!
    if (scorePercentage >= 80) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Ignore if confetti context unavailable
      }
    }
  };

  const currentQ = activeQuiz?.questions[currentQuestionIndex];

  // Helper formatting for seconds
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div id="quiz-arena-view" className="space-y-8 pb-12">
      
      {!activeQuiz || quizFinished ? (
        /* Setup / Results Screen */
        quizFinished && finalAttempt ? (
          /* Quiz Results Overview */
          <div className="bg-white/[0.07] backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl space-y-8 max-w-4xl mx-auto">
            
            {/* Header Score Card */}
            <div className="text-center space-y-3">
              <div className="inline-flex p-4 rounded-3xl bg-indigo-500/15 text-indigo-300 border border-indigo-400/20 backdrop-blur-md mb-2 shadow-lg">
                <Trophy className="w-12 h-12" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-sm">Quiz Completed!</h2>
              <p className="text-sm text-slate-300">
                You tested your knowledge on <span className="font-semibold text-indigo-200">{finalAttempt.topic}</span>
              </p>

              <div className="flex items-center justify-center gap-6 pt-3">
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-black text-emerald-300 drop-shadow-sm">{finalAttempt.scorePercentage}%</div>
                  <span className="text-xs text-slate-300 font-medium">Overall Score</span>
                </div>
                <div className="h-10 w-px bg-white/15" />
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white">
                    {finalAttempt.correctCount} / {finalAttempt.totalQuestions}
                  </div>
                  <span className="text-xs text-slate-300 font-medium">Correct Answers</span>
                </div>
                <div className="h-10 w-px bg-white/15" />
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-indigo-200">
                    {formatTime(finalAttempt.timeSpentSeconds)}
                  </div>
                  <span className="text-xs text-slate-300 font-medium">Time Taken</span>
                </div>
              </div>
            </div>

            {/* Question by Question Detailed Review */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h3 className="text-lg font-bold text-white">Question Review & Explanations</h3>

              <div className="space-y-4">
                {finalAttempt.questionResults.map((result, idx) => (
                  <div
                    key={result.questionId}
                    className={`p-5 rounded-3xl border backdrop-blur-xl space-y-3 shadow-lg ${
                      result.isCorrect
                        ? 'bg-emerald-500/[0.07] border-emerald-400/30'
                        : 'bg-rose-500/[0.07] border-rose-400/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-300">Question {idx + 1}</span>
                          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/15">
                            {result.conceptTested}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-white">{result.questionText}</h4>
                      </div>

                      {result.isCorrect ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold whitespace-nowrap backdrop-blur-sm">
                          <CheckCircle2 className="w-4 h-4" /> Correct
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30 text-xs font-bold whitespace-nowrap backdrop-blur-sm">
                          <XCircle className="w-4 h-4" /> Incorrect
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white/[0.04] p-3.5 rounded-2xl border border-white/10">
                      <div>
                        <span className="text-slate-400 font-medium">Your Submitted Answer:</span>
                        <p className={`font-semibold mt-0.5 ${result.isCorrect ? 'text-emerald-300' : 'text-rose-300'}`}>
                          {result.studentAnswer}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Target Benchmark Answer:</span>
                        <p className="font-semibold text-slate-200 mt-0.5">{result.correctAnswer}</p>
                      </div>
                    </div>

                    {result.aiFeedback && (
                      <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-400/20 text-xs space-y-1.5 backdrop-blur-md">
                        <div className="flex items-center justify-between text-purple-200 font-bold">
                          <span>AI Assessment Feedback (Score: {result.aiFeedback.score}/100)</span>
                        </div>
                        <p className="text-slate-200">{result.aiFeedback.feedback}</p>
                      </div>
                    )}

                    <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-400/20 text-xs text-indigo-200 space-y-1 backdrop-blur-md">
                      <span className="font-bold flex items-center gap-1.5 text-indigo-300">
                        <Lightbulb className="w-3.5 h-3.5" /> Conceptual Explanation:
                      </span>
                      <p className="text-slate-200 leading-relaxed">{result.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                id="retry-quiz-btn"
                onClick={() => {
                  setQuizFinished(false);
                  setActiveQuiz(null);
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600/90 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 border border-white/20 backdrop-blur-md transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Take Another Quiz
              </button>
            </div>

          </div>
        ) : (
          /* Quiz Generator Configuration Form */
          <div className="bg-white/[0.07] backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl space-y-6 max-w-3xl mx-auto">
            
            <div className="border-b border-white/10 pb-4 space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 text-xs font-semibold backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5" />
                Adaptive AI Exam Engine
              </div>
              <h2 className="text-2xl font-extrabold text-white drop-shadow-sm">Generate Custom Study Quiz</h2>
              <p className="text-xs text-slate-300">
                AI synthesizes multiple-choice, true/false, fill-in-the-blank, and open-ended conceptual reasoning questions directly from your notes.
              </p>
            </div>

            {/* Note Source Picker */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                1. Select Study Material / Topic
              </label>
              <select
                id="quiz-source-note-select"
                value={selectedNoteId}
                onChange={(e) => {
                  setSelectedNoteId(e.target.value);
                  if (e.target.value !== 'all') {
                    const found = notes.find(n => n.id === e.target.value);
                    if (found) setCustomTopic(found.title);
                  } else {
                    setCustomTopic('');
                  }
                }}
                className="w-full p-3.5 rounded-2xl bg-white/[0.06] border border-white/20 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-400 backdrop-blur-md"
              >
                <option value="all" className="bg-slate-900 text-white">📚 All Uploaded Notes Combined ({notes.length} notes)</option>
                {notes.map((n) => (
                  <option key={n.id} value={n.id} className="bg-slate-900 text-white">
                    📄 {n.title} ({n.category})
                  </option>
                ))}
              </select>

              <div className="pt-1">
                <input
                  id="quiz-custom-topic-input"
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Optional: Focus on specific topic or concept (e.g. Mitochondria, Derivatives, Key Formulas)..."
                  className="w-full px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/15 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 backdrop-blur-md"
                />
              </div>
            </div>

            {/* Difficulty Level */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                2. Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'easy', label: 'Foundational', desc: 'Core definitions & facts' },
                  { id: 'medium', label: 'Intermediate', desc: 'Application & synthesis' },
                  { id: 'hard', label: 'Master Exam', desc: 'Multi-step edge cases' },
                ].map((diff) => (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => setDifficulty(diff.id as any)}
                    className={`p-3.5 rounded-2xl border text-left transition-all backdrop-blur-md ${
                      difficulty === diff.id
                        ? 'bg-white/20 text-white border-white/40 shadow-lg shadow-indigo-900/30'
                        : 'bg-white/[0.04] border-white/10 text-slate-300 hover:border-white/25 hover:bg-white/[0.08]'
                    }`}
                  >
                    <div className="font-bold text-xs sm:text-sm">{diff.label}</div>
                    <div className="text-[11px] opacity-80 mt-0.5">{diff.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                3. Number of Questions
              </label>
              <div className="flex items-center gap-3">
                {[3, 5, 8, 10].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionCount(count)}
                    className={`flex-1 py-2.5 rounded-2xl text-xs font-bold border transition-all backdrop-blur-md ${
                      questionCount === count
                        ? 'bg-white/20 text-white border-white/40 shadow-md'
                        : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    {count} Questions
                  </button>
                ))}
              </div>
            </div>

            {/* Question Types */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                4. Question Types Included
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'multiple_choice', label: 'Multiple Choice' },
                  { id: 'true_false', label: 'True / False' },
                  { id: 'fill_blank', label: 'Fill in Blank' },
                  { id: 'conceptual', label: 'Short Answer (AI Graded)' },
                ].map((type) => {
                  const isChecked = selectedTypes.includes(type.id);
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => {
                        if (isChecked && selectedTypes.length > 1) {
                          setSelectedTypes(selectedTypes.filter(t => t !== type.id));
                        } else if (!isChecked) {
                          setSelectedTypes([...selectedTypes, type.id]);
                        }
                      }}
                      className={`p-3 rounded-2xl text-xs font-semibold border transition-all backdrop-blur-md ${
                        isChecked
                          ? 'bg-white/20 border-indigo-400/50 text-indigo-200 shadow-sm'
                          : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '} {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Generate CTA */}
            <button
              id="generate-quiz-submit-btn"
              onClick={handleGenerateQuiz}
              disabled={isGenerating}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600/90 to-indigo-600/90 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-2xl shadow-indigo-900/40 border border-white/20 backdrop-blur-md transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  Generating Adaptive Quiz from Notes...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-white" />
                  Launch Interactive Quiz
                </>
              )}
            </button>

          </div>
        )
      ) : (
        /* Active Interactive Quiz Player */
        currentQ && (
          <div className="bg-white/[0.07] backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl space-y-6 max-w-3xl mx-auto">
            
            {/* Top Bar: Question Index, Topic & Countdown Timer */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-bold uppercase text-indigo-300">
                  {activeQuiz.topic} • {activeQuiz.difficulty}
                </span>
                <h3 className="text-lg font-bold text-white">
                  Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}
                </h3>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/10 border border-white/15 text-xs font-mono font-bold text-indigo-200 backdrop-blur-md shadow-sm">
                <Clock className="w-4 h-4 text-indigo-300" />
                <span>{formatTime(timeRemainingSeconds)}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden border border-white/10">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300 shadow-sm"
                style={{ width: `${((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100}%` }}
              />
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-slate-200 text-[11px] font-semibold border border-white/15 backdrop-blur-sm">
                <span>Concept: {currentQ.conceptTested}</span>
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                {currentQ.question}
              </h4>
            </div>

            {/* Question Interaction Area based on Type */}
            <div className="space-y-3 pt-2">
              {currentQ.type === 'multiple_choice' || currentQ.type === 'true_false' ? (
                /* Multiple Choice Options */
                <div className="space-y-2.5">
                  {(currentQ.options || (currentQ.type === 'true_false' ? ['True', 'False'] : [])).map((option, idx) => {
                    const isSelected = studentAnswers[currentQ.id] === option;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectAnswer(currentQ.id, option)}
                        className={`w-full p-4 rounded-2xl text-left text-xs sm:text-sm font-medium border transition-all flex items-center justify-between backdrop-blur-md ${
                          isSelected
                            ? 'bg-indigo-600/90 text-white border-white/30 shadow-lg shadow-indigo-950/40'
                            : 'bg-white/[0.04] border-white/10 text-slate-200 hover:border-white/25 hover:bg-white/[0.08]'
                        }`}
                      >
                        <span>{option}</span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                          isSelected ? 'border-white bg-white text-indigo-600 font-bold' : 'border-white/30'
                        }`}>
                          {isSelected ? '✓' : ''}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : currentQ.type === 'fill_blank' ? (
                /* Fill in the Blank Input */
                <div className="space-y-2">
                  <label className="text-xs text-slate-300 font-medium">Type your answer:</label>
                  <input
                    type="text"
                    value={studentAnswers[currentQ.id] || ''}
                    onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                    placeholder="Enter missing term or phrase..."
                    className="w-full p-3.5 rounded-2xl bg-white/[0.05] border border-white/15 text-sm text-white focus:outline-none focus:border-indigo-400 backdrop-blur-md placeholder-slate-400"
                  />
                </div>
              ) : (
                /* Open-Ended Conceptual Short Answer */
                <div className="space-y-3">
                  <label className="text-xs text-slate-300 font-medium">
                    Type your reasoned explanation (AI evaluates your conceptual grasp):
                  </label>
                  <textarea
                    rows={4}
                    value={studentAnswers[currentQ.id] || ''}
                    onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                    placeholder="Explain the mechanism, causes, or reasoning in your own words..."
                    className="w-full p-3.5 rounded-2xl bg-white/[0.05] border border-white/15 text-sm text-white focus:outline-none focus:border-indigo-400 leading-relaxed backdrop-blur-md placeholder-slate-400"
                  />

                  {/* AI Instant Grade Preview Button */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleEvaluateConceptualAnswer(currentQ)}
                      disabled={!studentAnswers[currentQ.id]?.trim() || isGradingShortAnswer}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-400/30 text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md transition-all disabled:opacity-40"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isGradingShortAnswer ? 'animate-spin' : ''}`} />
                      {isGradingShortAnswer ? 'AI Grading Reasoning...' : '✨ Pre-Grade My Answer'}
                    </button>

                    {shortAnswerEvaluations[currentQ.id] && (
                      <span className="text-xs font-bold text-purple-200">
                        Score: {shortAnswerEvaluations[currentQ.id].score}/100
                      </span>
                    )}
                  </div>

                  {shortAnswerEvaluations[currentQ.id] && (
                    <div className="p-3.5 rounded-2xl bg-purple-500/15 border border-purple-400/30 text-xs text-purple-100 space-y-1 backdrop-blur-md">
                      <p className="font-semibold text-white">{shortAnswerEvaluations[currentQ.id].feedback}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Hint Box (Toggleable) */}
            {currentQ.hint && (
              <div className="pt-2">
                {showHint ? (
                  <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-xs text-amber-200 flex items-start gap-2 backdrop-blur-md">
                    <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Hint:</strong> {currentQ.hint}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowHint(true)}
                    className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1 font-medium"
                  >
                    <Lightbulb className="w-3.5 h-3.5" /> Reveal Hint
                  </button>
                )}
              </div>
            )}

            {/* Navigation & Submit Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  if (currentQuestionIndex > 0) {
                    setCurrentQuestionIndex(prev => prev - 1);
                    setShowHint(false);
                  }
                }}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold disabled:opacity-30 border border-white/15 backdrop-blur-md transition-colors"
              >
                Previous
              </button>

              {currentQuestionIndex < activeQuiz.questions.length - 1 ? (
                <button
                  onClick={() => {
                    setCurrentQuestionIndex(prev => prev + 1);
                    setShowHint(false);
                  }}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-2xl bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 border border-white/20 backdrop-blur-md transition-all"
                >
                  Next Question <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  id="submit-finish-quiz-btn"
                  onClick={handleFinishQuiz}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-2xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold shadow-xl shadow-emerald-600/30 border border-white/20 backdrop-blur-md transition-all"
                >
                  Submit & Score Quiz <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        )
      )}

    </div>
  );
};
