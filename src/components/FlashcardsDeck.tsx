import React, { useState } from 'react';
import { 
  Layers, 
  RotateCw, 
  Check, 
  X, 
  Sparkles, 
  Plus, 
  ArrowLeft, 
  ArrowRight, 
  Shuffle, 
  Award,
  BookOpen,
  HelpCircle
} from 'lucide-react';
import { Flashcard, Note } from '../types';
import { rateFlashcard } from '../utils/storage';

interface FlashcardsDeckProps {
  flashcards: Flashcard[];
  notes: Note[];
  onUpdateFlashcard: (card: Flashcard) => void;
  onAddFlashcard: (card: Flashcard) => void;
}

export const FlashcardsDeck: React.FC<FlashcardsDeckProps> = ({
  flashcards,
  notes,
  onUpdateFlashcard,
  onAddFlashcard,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New card form
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newCat, setNewCat] = useState('Biology');

  const categories = ['All', ...Array.from(new Set(flashcards.map(f => f.category)))];

  const filteredCards = flashcards.filter(c => 
    selectedCategory === 'All' || c.category === selectedCategory
  );

  const currentCard = filteredCards[currentIndex] || filteredCards[0];

  const handleFlip = () => {
    setIsFlipped(prev => !prev);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev + 1) % Math.max(1, filteredCards.length));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 + filteredCards.length) % Math.max(1, filteredCards.length));
  };

  const handleRate = (quality: number) => {
    if (!currentCard) return;
    const updated = rateFlashcard(currentCard, quality);
    onUpdateFlashcard(updated);
    handleNext();
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setCurrentIndex(Math.floor(Math.random() * Math.max(1, filteredCards.length)));
  };

  const handleCreateCustomCard = () => {
    if (!newFront.trim() || !newBack.trim()) return;

    const card: Flashcard = {
      id: `fc-custom-${Date.now()}`,
      category: newCat,
      front: newFront.trim(),
      back: newBack.trim(),
      intervalDays: 1,
      easeFactor: 2.5,
      repetitions: 0,
      status: 'learning',
      nextReview: new Date().toISOString(),
    };

    onAddFlashcard(card);
    setNewFront('');
    setNewBack('');
    setShowAddModal(false);
  };

  const masteredCount = filteredCards.filter(c => c.status === 'mastered').length;
  const learningCount = filteredCards.filter(c => c.status === 'learning').length;

  return (
    <div id="flashcards-deck-view" className="space-y-8 pb-16 max-w-4xl mx-auto">
      
      {/* Header Bar */}
      <div className="bg-white/[0.08] backdrop-blur-2xl p-6 rounded-3xl border border-white/20 shadow-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 backdrop-blur-md shadow-sm">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Spaced Repetition Flashcards (SRS)</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Scientifically scheduled intervals (SM-2 algorithm) for maximum long-term memory retention.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-xl shadow-indigo-600/30 border border-white/20 backdrop-blur-md transition-all hover:scale-105 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Card
          </button>
        </div>
      </div>

      {/* Category Pills & Progress Counter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`text-xs sm:text-sm font-bold px-4 py-2 rounded-2xl transition-all backdrop-blur-md ${
                selectedCategory === cat
                  ? 'bg-white/25 text-white border border-white/40 shadow-md scale-105'
                  : 'bg-white/[0.05] text-slate-300 hover:text-white hover:bg-white/[0.12] border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 text-xs sm:text-sm font-bold">
          <span className="text-emerald-300 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/20 backdrop-blur-sm">
            <Award className="w-4 h-4" /> {masteredCount} Mastered
          </span>
          <span className="text-amber-300 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/20 backdrop-blur-sm">
            <Sparkles className="w-4 h-4" /> {learningCount} Learning
          </span>
        </div>
      </div>

      {filteredCards.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.05] rounded-3xl border border-white/12 backdrop-blur-xl text-slate-300 space-y-4 shadow-2xl p-8">
          <Layers className="w-12 h-12 mx-auto text-slate-400 opacity-60" />
          <p className="text-base font-semibold">No flashcards found in this category.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 rounded-2xl bg-indigo-600/90 text-white text-xs sm:text-sm font-bold border border-white/20 backdrop-blur-md shadow-lg shadow-indigo-900/30"
          >
            Create First Flashcard
          </button>
        </div>
      ) : currentCard ? (
        /* Active Flashcard 3D Interactive Card */
        <div className="space-y-8">
          
          {/* Card Counter & Shuffle */}
          <div className="flex items-center justify-between text-xs sm:text-sm text-slate-300 font-medium">
            <span>
              Card {currentIndex + 1} of {filteredCards.length}
            </span>
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 rounded-full bg-white/10 text-slate-200 border border-white/15 font-bold backdrop-blur-sm shadow-inner">
                {currentCard.category}
              </span>
              <button
                onClick={handleShuffle}
                title="Shuffle Deck"
                className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 backdrop-blur-md transition-all hover:scale-105"
              >
                <Shuffle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Flip Card Container */}
          <div
            onClick={handleFlip}
            className="min-h-[340px] sm:min-h-[400px] rounded-3xl p-8 sm:p-14 cursor-pointer transition-all duration-300 select-none flex flex-col justify-between shadow-2xl relative overflow-hidden bg-gradient-to-br from-white/[0.1] via-indigo-500/[0.14] to-purple-500/[0.1] backdrop-blur-2xl border-2 border-white/25 hover:border-indigo-400/70 group hover:shadow-indigo-500/20"
          >
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold uppercase tracking-wider text-indigo-300">
              <span className="flex items-center gap-2">
                {isFlipped ? '💡 Explanation / Answer' : '❓ Prompt / Question'}
              </span>
              <span className="text-xs text-slate-300 group-hover:text-white transition-colors bg-white/10 px-3 py-1 rounded-full border border-white/15">
                Click anywhere to flip ⟳
              </span>
            </div>

            <div className="my-auto py-8 text-center">
              <h3 className="text-xl sm:text-3xl font-black text-white leading-relaxed drop-shadow-md">
                {isFlipped ? currentCard.back : currentCard.front}
              </h3>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300 border-t border-white/15 pt-4">
              <span>Repetitions: <strong className="text-white">{currentCard.repetitions}</strong></span>
              <span>Interval: <strong className="text-white">{currentCard.intervalDays} day(s)</strong></span>
              <span className={`font-bold px-3 py-0.5 rounded-full ${currentCard.status === 'mastered' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'}`}>
                {currentCard.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Spaced Repetition Grading Controls */}
          {isFlipped ? (
            <div className="space-y-3 bg-white/[0.06] p-5 rounded-3xl border border-white/15 backdrop-blur-xl">
              <span className="text-xs sm:text-sm font-bold text-slate-200 block text-center">
                How well did you recall this answer?
              </span>
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => handleRate(1)}
                  className="p-4 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-rose-200 font-bold text-xs sm:text-sm flex flex-col items-center gap-1 backdrop-blur-md transition-all shadow-md hover:scale-105 cursor-pointer"
                >
                  <span>Again</span>
                  <span className="text-[11px] font-normal opacity-80">&lt; 1 day</span>
                </button>
                <button
                  onClick={() => handleRate(2)}
                  className="p-4 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-200 font-bold text-xs sm:text-sm flex flex-col items-center gap-1 backdrop-blur-md transition-all shadow-md hover:scale-105 cursor-pointer"
                >
                  <span>Hard</span>
                  <span className="text-[11px] font-normal opacity-80">1 day</span>
                </button>
                <button
                  onClick={() => handleRate(3)}
                  className="p-4 rounded-2xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 font-bold text-xs sm:text-sm flex flex-col items-center gap-1 backdrop-blur-md transition-all shadow-md hover:scale-105 cursor-pointer"
                >
                  <span>Good</span>
                  <span className="text-[11px] font-normal opacity-80">3 days</span>
                </button>
                <button
                  onClick={() => handleRate(4)}
                  className="p-4 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-200 font-bold text-xs sm:text-sm flex flex-col items-center gap-1 backdrop-blur-md transition-all shadow-md hover:scale-105 cursor-pointer"
                >
                  <span>Easy</span>
                  <span className="text-[11px] font-normal opacity-80">7+ days</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handlePrev}
                className="flex-1 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-slate-100 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 backdrop-blur-md transition-all hover:scale-[1.02] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Previous Card
              </button>
              <button
                onClick={handleFlip}
                className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xl shadow-indigo-900/30 border border-white/20 backdrop-blur-md transition-all hover:scale-[1.02] cursor-pointer"
              >
                <RotateCw className="w-4 h-4" /> Flip & Reveal Answer
              </button>
              <button
                onClick={handleNext}
                className="flex-1 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-slate-100 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 backdrop-blur-md transition-all hover:scale-[1.02] cursor-pointer"
              >
                Next Card <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      ) : null}

      {/* Add Custom Flashcard Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white/[0.09] backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl max-w-lg w-full space-y-4">
            <h3 className="text-lg font-bold text-white">Add Custom Flashcard</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Category / Subject</label>
                <input
                  type="text"
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  placeholder="e.g. Biology, Economics"
                  className="w-full mt-1 p-2.5 rounded-2xl bg-white/[0.05] border border-white/15 text-xs text-white focus:outline-none focus:border-indigo-400 backdrop-blur-md placeholder-slate-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Front (Question or Term)</label>
                <textarea
                  rows={2}
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder="e.g. What is the role of ATP Synthase?"
                  className="w-full mt-1 p-2.5 rounded-2xl bg-white/[0.05] border border-white/15 text-xs text-white focus:outline-none focus:border-indigo-400 backdrop-blur-md placeholder-slate-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Back (Answer or Concept)</label>
                <textarea
                  rows={3}
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  placeholder="e.g. Converts ADP and Pi into ATP using the proton electrochemical gradient."
                  className="w-full mt-1 p-2.5 rounded-2xl bg-white/[0.05] border border-white/15 text-xs text-white focus:outline-none focus:border-indigo-400 backdrop-blur-md placeholder-slate-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-2xl text-xs text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomCard}
                className="px-4 py-2 rounded-2xl bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 border border-white/20 backdrop-blur-md"
              >
                Save Flashcard
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
