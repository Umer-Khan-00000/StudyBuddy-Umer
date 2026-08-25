import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Sparkles, 
  Plus, 
  Trash2, 
  Check, 
  Search, 
  Layers, 
  BookOpen, 
  HelpCircle, 
  Download, 
  ArrowRight,
  RefreshCw,
  Clock,
  Tag,
  AlertCircle
} from 'lucide-react';
import { Note, Flashcard } from '../types';
import { SAMPLE_NOTES } from '../data/sampleNotes';

interface NotesManagerProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectActiveNote: (noteId: string) => void;
  onSaveNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onAddFlashcards: (cards: Flashcard[]) => void;
  onNavigateToQnA: (noteId: string) => void;
  onNavigateToQuiz: (noteId: string) => void;
}

export const NotesManager: React.FC<NotesManagerProps> = ({
  notes,
  activeNoteId,
  onSelectActiveNote,
  onSaveNote,
  onDeleteNote,
  onAddFlashcards,
  onNavigateToQnA,
  onNavigateToQuiz,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isEditing, setIsEditing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Form states
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('General');
  const [editContent, setEditContent] = useState('');
  const [editColor, setEditColor] = useState('indigo');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const activeNote = notes.find(n => n.id === activeNoteId) || notes[0];

  const categories = ['All', ...Array.from(new Set(notes.map(n => n.category)))];

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          n.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || n.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleStartCreate = () => {
    setEditTitle('');
    setEditCategory('General');
    setEditContent('');
    setEditColor('indigo');
    setIsEditing(true);
  };

  const handleStartEdit = (note: Note) => {
    setEditTitle(note.title);
    setEditCategory(note.category);
    setEditContent(note.content);
    setEditColor(note.colorTag || 'indigo');
    setIsEditing(true);
  };

  const handleSaveForm = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      alert('Please enter both a title and notes content.');
      return;
    }

    const wordCount = editContent.trim().split(/\s+/).length;
    const existing = notes.find(n => n.id === activeNoteId);

    const noteToSave: Note = {
      id: existing && isEditing && existing.title === editTitle ? existing.id : `note-${Date.now()}`,
      title: editTitle.trim(),
      category: editCategory.trim() || 'General',
      content: editContent.trim(),
      colorTag: editColor,
      summaryBullets: existing?.summaryBullets || [],
      keyTerms: existing?.keyTerms || [],
      flashcards: existing?.flashcards || [],
      potentialExamQuestions: existing?.potentialExamQuestions || [],
      complexityLevel: existing?.complexityLevel || 'Intermediate',
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      wordCount,
    };

    onSaveNote(noteToSave);
    onSelectActiveNote(noteToSave.id);
    setIsEditing(false);

    // Prompt for AI analysis if no summary yet
    if (noteToSave.summaryBullets.length === 0 && noteToSave.content.length > 50) {
      handleAnalyzeNote(noteToSave);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    try {
      const text = await file.text();
      const title = file.name.replace(/\.[^/.]+$/, '');
      const wordCount = text.trim().split(/\s+/).length;

      const newNote: Note = {
        id: `note-${Date.now()}`,
        title: title || 'Uploaded Study Notes',
        category: 'Uploaded',
        content: text,
        colorTag: 'emerald',
        summaryBullets: [],
        keyTerms: [],
        flashcards: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        wordCount,
      };

      onSaveNote(newNote);
      onSelectActiveNote(newNote.id);
      handleAnalyzeNote(newNote);
    } catch (e: any) {
      alert('Could not read text file: ' + e.message);
    }
  };

  const handleAnalyzeNote = async (targetNote?: Note) => {
    const note = targetNote || activeNote;
    if (!note || !note.content) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch('/api/study/analyze-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notesText: note.content,
          title: note.title,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();

      const updatedNote: Note = {
        ...note,
        category: data.category || note.category,
        complexityLevel: data.complexityLevel || 'Intermediate',
        summaryBullets: data.summaryBullets || [],
        keyTerms: data.keyTerms || [],
        flashcards: (data.flashcards || []).map((fc: any, i: number) => ({
          id: `fc-${note.id}-${i}`,
          front: fc.front,
          back: fc.back,
          category: data.category || note.category,
        })),
        potentialExamQuestions: data.potentialExamQuestions || [],
        updatedAt: new Date().toISOString(),
      };

      onSaveNote(updatedNote);

      // Also push extracted flashcards into user's SRS deck
      if (updatedNote.flashcards.length > 0) {
        const newFlashcards: Flashcard[] = updatedNote.flashcards.map(fc => ({
          id: fc.id,
          noteId: updatedNote.id,
          noteTitle: updatedNote.title,
          category: updatedNote.category,
          front: fc.front,
          back: fc.back,
          intervalDays: 1,
          easeFactor: 2.5,
          repetitions: 0,
          status: 'learning',
          nextReview: new Date().toISOString(),
        }));
        onAddFlashcards(newFlashcards);
      }
    } catch (err: any) {
      console.error('Note analysis error:', err);
      setAnalysisError(err.message || 'Failed to extract AI insights.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadNote = (note: Note) => {
    const markdown = `# ${note.title}\n**Subject:** ${note.category} | **Complexity:** ${note.complexityLevel || 'Intermediate'}\n\n## Summary\n${note.summaryBullets.map(b => `- ${b}`).join('\n')}\n\n## Content\n${note.content}\n\n## Key Terms\n${note.keyTerms.map(k => `### ${k.term}\n${k.definition}`).join('\n\n')}`;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.toLowerCase().replace(/\s+/g, '_')}_study_guide.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="notes-manager-view" className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/[0.07] backdrop-blur-2xl p-5 rounded-3xl border border-white/15 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-300" />
            Study Notes & RAG Knowledge Ingestion
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Upload text files or write notes. AI automatically chunks, indexes, generates summaries, flashcards & exam questions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileUpload(e.target.files)}
            accept=".txt,.md,.json,.csv,.text"
            className="hidden"
          />
          <button
            id="upload-notes-file-btn"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-100 border border-white/20 text-xs font-semibold backdrop-blur-md transition-all shadow-sm"
          >
            <Upload className="w-4 h-4 text-indigo-300" />
            Upload File (.txt, .md)
          </button>
          <button
            id="create-new-note-btn"
            onClick={handleStartCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 backdrop-blur-md border border-white/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Write Note
          </button>
        </div>
      </div>

      {/* Main 2-Column Split: Notes Explorer vs Selected Note Detail / Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (4 cols): Notes List & Search */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Search & Category Filter */}
          <div className="bg-white/[0.06] backdrop-blur-2xl rounded-3xl p-4 border border-white/15 shadow-xl space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                id="notes-search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search notes, terms, concepts..."
                className="w-full pl-9 pr-3 py-1.5 rounded-2xl bg-white/[0.05] border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 backdrop-blur-md"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl transition-all backdrop-blur-md ${
                    selectedCategory === cat
                      ? 'bg-white/25 text-white border border-white/35 shadow-sm'
                      : 'bg-white/[0.05] text-slate-300 hover:bg-white/[0.12] hover:text-white border border-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Notes List */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-10 bg-white/[0.04] rounded-3xl border border-white/10 backdrop-blur-md text-slate-400 text-xs">
                No notes found matching your search.
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isSelected = activeNote?.id === note.id;
                return (
                  <div
                    key={note.id}
                    id={`note-card-${note.id}`}
                    onClick={() => {
                      onSelectActiveNote(note.id);
                      setIsEditing(false);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer backdrop-blur-xl ${
                      isSelected
                        ? 'bg-white/15 border-indigo-400/60 shadow-lg shadow-indigo-900/30'
                        : 'bg-white/[0.05] border-white/10 hover:border-white/25 hover:bg-white/[0.09]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`text-xs sm:text-sm font-bold line-clamp-1 ${isSelected ? 'text-indigo-200' : 'text-white'}`}>
                        {note.title}
                      </h4>
                      <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/15 whitespace-nowrap backdrop-blur-sm">
                        {note.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 mt-1.5 leading-relaxed">
                      {note.content.slice(0, 140)}...
                    </p>

                    <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400 font-medium">
                      <span>{note.wordCount} words</span>
                      <span>{note.flashcards.length} flashcards</span>
                      <span>{note.complexityLevel || 'Standard'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFileUpload(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`p-5 rounded-3xl border-2 border-dashed text-center cursor-pointer transition-all backdrop-blur-md ${
              isDragging
                ? 'border-indigo-400 bg-indigo-500/15'
                : 'border-white/15 hover:border-white/30 bg-white/[0.03]'
            }`}
          >
            <Upload className="w-5 h-5 mx-auto text-indigo-300 mb-1.5" />
            <p className="text-xs font-semibold text-slate-200">Drop your study notes here</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Supports .txt, .md, text files</p>
          </div>

        </div>

        {/* Right Column (8 cols): Active Note Content & AI Deep Analysis */}
        <div className="lg:col-span-8 space-y-6">
          
          {isEditing ? (
            /* Note Editor Form */
            <div className="bg-white/[0.08] backdrop-blur-2xl rounded-3xl p-6 border border-white/20 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-lg font-bold text-white">
                  {editTitle ? 'Edit Study Note' : 'Create New Study Note'}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveForm}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-2xl bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 border border-white/20 backdrop-blur-md"
                  >
                    <Check className="w-4 h-4" />
                    Save & Index
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Note Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="e.g. Molecular Genetics & DNA Replication"
                    className="w-full px-3.5 py-2 rounded-2xl bg-white/[0.05] border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-400 backdrop-blur-md placeholder-slate-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Subject Category</label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    placeholder="e.g. Biology, Chemistry, History"
                    className="w-full px-3.5 py-2 rounded-2xl bg-white/[0.05] border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-400 backdrop-blur-md placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Notes Content (Markdown supported)</label>
                <textarea
                  rows={14}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Paste lecture notes, study outlines, textbook chapters, or definitions here..."
                  className="w-full p-4 rounded-2xl bg-white/[0.05] border border-white/15 text-xs sm:text-sm text-slate-100 font-mono leading-relaxed focus:outline-none focus:border-indigo-400 backdrop-blur-md placeholder-slate-400"
                />
              </div>
            </div>
          ) : activeNote ? (
            /* Active Note Viewer & AI Insights */
            <div className="space-y-6">
              
              {/* Note Action Toolbar */}
              <div className="bg-white/[0.07] backdrop-blur-2xl rounded-3xl p-5 border border-white/15 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 backdrop-blur-sm">
                      {activeNote.category}
                    </span>
                    <span className="text-xs text-slate-300">• {activeNote.complexityLevel || 'Intermediate'}</span>
                    <span className="text-xs text-slate-300">• {activeNote.wordCount} words</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1.5 drop-shadow-sm">
                    {activeNote.title}
                  </h2>
                </div>

                {/* Primary Actions: Q&A, Quiz, AI Analysis */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    id="analyze-note-btn"
                    onClick={() => handleAnalyzeNote()}
                    disabled={isAnalyzing}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-purple-600/90 to-indigo-600/90 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/30 transition-all disabled:opacity-50 border border-white/20 backdrop-blur-md"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    {isAnalyzing ? 'Extracting AI Insights...' : '✨ AI Note Insights'}
                  </button>

                  <button
                    id="ask-from-this-note-btn"
                    onClick={() => onNavigateToQnA(activeNote.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-900/30 transition-all border border-white/20 backdrop-blur-md"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Ask RAG Q&A
                  </button>

                  <button
                    id="quiz-from-this-note-btn"
                    onClick={() => onNavigateToQuiz(activeNote.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-900/30 transition-all border border-white/20 backdrop-blur-md"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    Quiz Note
                  </button>

                  <button
                    onClick={() => handleStartEdit(activeNote)}
                    className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-medium border border-white/15 backdrop-blur-md transition-colors"
                    title="Edit Note"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDownloadNote(activeNote)}
                    className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-medium border border-white/15 backdrop-blur-md transition-colors"
                    title="Export Markdown Study Guide"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete note "${activeNote.title}"?`)) {
                        onDeleteNote(activeNote.id);
                      }
                    }}
                    className="p-2 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-400/30 text-xs backdrop-blur-md transition-colors"
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {analysisError && (
                <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-400/30 text-rose-200 text-xs flex items-center gap-2 backdrop-blur-md">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{analysisError}</span>
                </div>
              )}

              {/* AI Key Insights Summary Box (if present) */}
              {activeNote.summaryBullets && activeNote.summaryBullets.length > 0 && (
                <div className="bg-gradient-to-br from-indigo-500/[0.12] via-purple-500/[0.08] to-white/[0.04] backdrop-blur-2xl rounded-3xl p-6 border border-indigo-400/30 shadow-xl space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-300" />
                    <h3 className="text-sm font-bold text-indigo-200">Executive Study Summary</h3>
                  </div>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {activeNote.summaryBullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0 shadow-sm" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key Definitions & Terms Grid */}
              {activeNote.keyTerms && activeNote.keyTerms.length > 0 && (
                <div className="bg-white/[0.07] backdrop-blur-2xl rounded-3xl p-6 border border-white/15 shadow-xl space-y-4">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">Core Key Terms & Terminology</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeNote.keyTerms.map((term, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/10 space-y-1">
                        <span className="text-xs font-bold text-emerald-300">{term.term}</span>
                        <p className="text-xs text-slate-300 leading-relaxed">{term.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Note Raw Content View */}
              <div className="bg-white/[0.07] backdrop-blur-2xl rounded-3xl p-6 border border-white/15 shadow-xl space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-300" />
                  Full Note Material
                </h3>
                <div className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed whitespace-pre-wrap bg-white/[0.03] backdrop-blur-md p-5 rounded-2xl border border-white/10 max-h-[500px] overflow-y-auto">
                  {activeNote.content}
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-16 bg-white/[0.05] rounded-3xl border border-white/10 backdrop-blur-xl text-slate-300 space-y-3 shadow-lg">
              <BookOpen className="w-8 h-8 mx-auto text-slate-400" />
              <p className="text-sm font-medium">Select a study note from the left or create a new one to begin.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
