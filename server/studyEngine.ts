export interface QuizQuestionData {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'conceptual';
  question: string;
  options?: string[];
  correctAnswer: string;
  acceptableAnswers?: string[];
  explanation: string;
  conceptTested: string;
  hint?: string;
}

export interface QuizData {
  quizTitle: string;
  topic: string;
  difficulty: string;
  estimatedMinutes: number;
  summary: string;
  questions: QuizQuestionData[];
}

/**
 * Extracts term-definition pairs and key factual statements from student notes text
 */
function extractKnowledgeFromNotes(notesText: string): {
  terms: { term: string; definition: string }[];
  facts: string[];
  headings: string[];
} {
  const terms: { term: string; definition: string }[] = [];
  const facts: string[] = [];
  const headings: string[] = [];

  const lines = notesText.split('\n').map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    if (line.startsWith('#') || line.startsWith('===')) {
      headings.push(line.replace(/^[#=\-\s]+/, '').trim());
      continue;
    }

    // Check for "Term: Definition" or "**Term**: Definition" or "Term - Definition"
    const termDefMatch = line.match(/^(\*\*?[A-Za-z0-9\s\-–']+\*\*?)\s*(?:[:\-–—]|is defined as|refers to|means)\s*(.+)$/i);
    if (termDefMatch) {
      const rawTerm = termDefMatch[1].replace(/[\*\_]/g, '').trim();
      const rawDef = termDefMatch[2].trim();
      if (rawTerm.length >= 2 && rawDef.length >= 5 && rawTerm.split(' ').length <= 6) {
        terms.push({ term: rawTerm, definition: rawDef });
        continue;
      }
    }

    // Check for bullet points or statements
    const cleanedLine = line.replace(/^[\*\-\•\d+\.\s]+/, '').trim();
    if (cleanedLine.length >= 20 && cleanedLine.includes(' ')) {
      facts.push(cleanedLine);
    }
  }

  return { terms, facts, headings };
}

/**
 * Robust, high-yield fallback quiz generator grounded in notes or topic domain
 */
export function generateQuizFallback(
  notesText: string,
  topic: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  questionCount: number = 5,
  questionTypes: string[] = ['multiple_choice', 'true_false', 'fill_blank', 'conceptual']
): QuizData {
  const { terms, facts } = extractKnowledgeFromNotes(notesText);
  const questions: QuizQuestionData[] = [];
  const activeTypes = questionTypes.length > 0 ? questionTypes : ['multiple_choice', 'true_false', 'fill_blank', 'conceptual'];

  const effectiveTopic = topic || (terms[0]?.term ? `Mastery of ${terms[0].term}` : 'Comprehensive Study Assessment');

  // Generic backup pool if notes are very brief
  const defaultDistractors = [
    'Static equilibrium condition',
    'Heuristic approximation parameter',
    'Exothermic activation threshold',
    'Stochastic convergence rate',
    'Empirical baseline measure',
    'Linear extrapolation principle',
    'Dynamic variance factor',
    'Thermodynamic dissipation constant'
  ];

  let qIndex = 1;

  // 1. Generate questions from extracted terms
  for (let i = 0; i < terms.length && questions.length < questionCount; i++) {
    const current = terms[i];
    const type = activeTypes[(qIndex - 1) % activeTypes.length] as any;

    if (type === 'multiple_choice') {
      const otherTerms = terms.filter(t => t.term !== current.term).map(t => t.definition);
      const distractors = otherTerms.length >= 3 
        ? otherTerms.slice(0, 3) 
        : defaultDistractors.slice(0, 3);
      
      const allOptions = [current.definition, ...distractors].sort(() => Math.random() - 0.5);

      questions.push({
        id: `q${qIndex++}`,
        type: 'multiple_choice',
        question: `Which of the following best defines or characterizes "${current.term}"?`,
        options: allOptions,
        correctAnswer: current.definition,
        explanation: `"${current.term}" is defined as: ${current.definition}. Understanding this core definition is essential for applying related concepts.`,
        conceptTested: current.term,
        hint: `Focus on the primary mechanism and standard academic definition of ${current.term}.`
      });
    } else if (type === 'true_false') {
      const isTrue = Math.random() > 0.4;
      let stmt = '';
      let explanation = '';

      if (isTrue) {
        stmt = `According to the study material, ${current.term} refers to: "${current.definition}".`;
        explanation = `Correct! This accurately represents the foundational definition of ${current.term}.`;
      } else {
        const fakeDef = terms[(i + 1) % terms.length]?.definition || 'a process that solely operates without energy transfer';
        stmt = `According to the study material, ${current.term} refers to: "${fakeDef}".`;
        explanation = `False. ${current.term} actually refers to "${current.definition}", not the stated definition.`;
      }

      questions.push({
        id: `q${qIndex++}`,
        type: 'true_false',
        question: stmt,
        options: ['True', 'False'],
        correctAnswer: isTrue ? 'True' : 'False',
        explanation,
        conceptTested: current.term,
        hint: `Evaluate whether the relationship stated matches your notes on ${current.term}.`
      });
    } else if (type === 'fill_blank') {
      const words = current.definition.split(' ');
      let blankWord = current.term;
      let prompt = `Complete the statement: The term for "${current.definition}" is _______.`;

      questions.push({
        id: `q${qIndex++}`,
        type: 'fill_blank',
        question: prompt,
        correctAnswer: blankWord,
        acceptableAnswers: [blankWord.toLowerCase(), blankWord.toUpperCase(), blankWord],
        explanation: `The correct term is "${blankWord}". It corresponds directly to: ${current.definition}.`,
        conceptTested: current.term,
        hint: `Name the specific scientific or academic concept described in the prompt.`
      });
    } else if (type === 'conceptual') {
      questions.push({
        id: `q${qIndex++}`,
        type: 'conceptual',
        question: `Explain the practical significance of ${current.term} and how it connects to broader systems in ${effectiveTopic}.`,
        correctAnswer: `${current.term} is critical because ${current.definition}. It enables key processes to function effectively and provides stability within the overall conceptual framework.`,
        explanation: `Mastering ${current.term} requires both recalling its definition (${current.definition}) and applying it to solve real-world problems.`,
        conceptTested: `Analytical Application of ${current.term}`,
        hint: `Mention the definition, its functional purpose, and at least one direct outcome.`
      });
    }
  }

  // 2. Generate questions from extracted factual sentences
  for (let i = 0; i < facts.length && questions.length < questionCount; i++) {
    const fact = facts[i];
    const type = activeTypes[(qIndex - 1) % activeTypes.length] as any;

    if (type === 'true_false') {
      questions.push({
        id: `q${qIndex++}`,
        type: 'true_false',
        question: `Statement: "${fact}"`,
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: `This statement is directly verified by the study material: "${fact}".`,
        conceptTested: `Key Fact Verification in ${effectiveTopic}`,
        hint: `Recall the core principles covered in this section.`
      });
    } else if (type === 'multiple_choice') {
      const words = fact.split(' ');
      const keySegment = words.length > 5 ? words.slice(0, Math.min(6, words.length)).join(' ') : fact;
      
      questions.push({
        id: `q${qIndex++}`,
        type: 'multiple_choice',
        question: `Which of the following principles is explicitly highlighted in the notes regarding ${effectiveTopic}?`,
        options: [
          fact,
          'The mechanism operates independently of standard boundary constraints',
          'Results indicate inverse exponential deceleration under baseline loads',
          'Variables remain unchanged throughout successive iterations'
        ].sort(() => Math.random() - 0.5),
        correctAnswer: fact,
        explanation: `The notes confirm: "${fact}". The other options present unrelated or fabricated claims.`,
        conceptTested: `Factual synthesis in ${effectiveTopic}`,
        hint: `Look for the statement that aligns directly with your recorded lecture notes.`
      });
    } else {
      questions.push({
        id: `q${qIndex++}`,
        type: 'conceptual',
        question: `How does the following principle impact outcomes in ${effectiveTopic}: "${fact}"?`,
        correctAnswer: `This principle dictates that ${fact}. As a consequence, systems adhering to this rule maintain predictability and optimize performance.`,
        explanation: `Connecting this fact to underlying causes demonstrates deep comprehension rather than rote memory.`,
        conceptTested: `Systemic Understanding of ${effectiveTopic}`,
        hint: `Explain cause and effect based on the statement.`
      });
    }
  }

  // 3. Fill any remaining questions with structured domain questions
  while (questions.length < questionCount) {
    const type = activeTypes[(qIndex - 1) % activeTypes.length] as any;
    if (type === 'true_false') {
      questions.push({
        id: `q${qIndex++}`,
        type: 'true_false',
        question: `In the study of ${effectiveTopic}, foundational definitions must be validated against empirical evidence.`,
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: `Valid scientific and academic inquiry requires claims to be supported by empirical evidence and established theories.`,
        conceptTested: `Scientific Method in ${effectiveTopic}`,
        hint: `Consider the role of evidence in academic rigor.`
      });
    } else if (type === 'multiple_choice') {
      questions.push({
        id: `q${qIndex++}`,
        type: 'multiple_choice',
        question: `What is the primary objective when studying and applying ${effectiveTopic}?`,
        options: [
          'To understand underlying mechanisms and accurately solve domain problems',
          'To memorize superficial terms without contextual understanding',
          'To ignore theoretical assumptions during practical application',
          'To assume constant output regardless of changing inputs'
        ],
        correctAnswer: 'To understand underlying mechanisms and accurately solve domain problems',
        explanation: `Pedagogical mastery focuses on grasping core mechanisms and transferring that knowledge to diverse problem scenarios.`,
        conceptTested: `Core Purpose of ${effectiveTopic}`,
        hint: `Select the option that emphasizes deep conceptual understanding.`
      });
    } else {
      questions.push({
        id: `q${qIndex++}`,
        type: 'conceptual',
        question: `Describe the step-by-step problem-solving strategy you would use when encountering an unfamiliar scenario in ${effectiveTopic}.`,
        correctAnswer: `1. Identify given parameters and constraints. 2. Recall governing laws and formulas. 3. Formulate a hypothesis or mathematical relation. 4. Execute the solution and sanity-check the result against physical or logical realities.`,
        explanation: `A structured 4-step framework ensures robust problem solving and minimizes cognitive errors.`,
        conceptTested: `Problem-Solving Methodology in ${effectiveTopic}`,
        hint: `List your analysis steps from initial intake to final verification.`
      });
    }
  }

  return {
    quizTitle: `${effectiveTopic} Mastery Assessment`,
    topic: effectiveTopic,
    difficulty,
    estimatedMinutes: Math.ceil(questions.length * 1.5),
    summary: `A ${difficulty}-level active recall test containing ${questions.length} questions on ${effectiveTopic}.`,
    questions: questions.slice(0, questionCount),
  };
}

/**
 * Intelligent fallback for grading open-ended conceptual responses
 */
export function gradeAnswerFallback(
  question: string,
  idealAnswer: string,
  studentAnswer: string,
  conceptTested: string
) {
  const cleanStudent = studentAnswer.toLowerCase().trim();
  const cleanIdeal = (idealAnswer || '').toLowerCase().trim();

  const idealWords = cleanIdeal.split(/\W+/).filter(w => w.length > 3);
  const studentWords = new Set(cleanStudent.split(/\W+/).filter(w => w.length > 3));

  let matchCount = 0;
  for (const word of idealWords) {
    if (studentWords.has(word)) {
      matchCount++;
    }
  }

  const keywordRatio = idealWords.length > 0 ? matchCount / idealWords.length : 0.5;
  const lengthScore = Math.min(1, cleanStudent.length / 80);
  
  let score = Math.round((keywordRatio * 0.65 + lengthScore * 0.35) * 100);
  score = Math.max(30, Math.min(98, score));

  const isPass = score >= 60;

  return {
    score,
    isPass,
    feedback: isPass
      ? `Great job! Your answer demonstrates a solid grasp of ${conceptTested || 'the topic'}. You articulated key mechanisms clearly.`
      : `Good effort. While you touched on important aspects of ${conceptTested || 'the topic'}, expanding on the underlying causes and specific terminology will strengthen your answer.`,
    keyStrengths: [
      `Addressed the core prompt directly`,
      `Engaged with the conceptual theme of ${conceptTested || 'the subject'}`
    ],
    missingPoints: !isPass
      ? [`Incorporate explicit definitions and direct system outcomes`, `Provide concrete examples to substantiate your points`]
      : [`Consider noting edge cases or secondary applications`],
    suggestedModelAnswer: idealAnswer || `An ideal response explains the core definition, the functional mechanism, and its measurable consequence in context.`
  };
}

/**
 * Intelligent fallback for analyzing uploaded notes
 */
export function analyzeNotesFallback(notesText: string, title: string) {
  const { terms, facts } = extractKnowledgeFromNotes(notesText);

  const wordCount = notesText.split(/\s+/).length;
  const estimatedReadTimeMins = Math.max(1, Math.ceil(wordCount / 180));

  const summaryBullets = facts.slice(0, 4);
  if (summaryBullets.length === 0) {
    summaryBullets.push(
      `Covers essential foundations and principles of ${title || 'the study topic'}.`,
      `Synthesizes critical definitions and practical problem-solving rules.`,
      `Provides structured reference material for active recall and spaced repetition.`
    );
  }

  const keyTerms = terms.slice(0, 8).map(t => ({
    term: t.term,
    definition: t.definition,
    significance: `Foundational concept in ${title || 'this subject'}.`
  }));

  if (keyTerms.length === 0) {
    keyTerms.push({
      term: title || 'Core Concept',
      definition: 'Primary study topic covered in this document.',
      significance: 'Essential foundation.'
    });
  }

  const flashcards = terms.slice(0, 6).map(t => ({
    front: `What is ${t.term}?`,
    back: t.definition,
    category: title || 'General'
  }));

  if (flashcards.length === 0) {
    flashcards.push({
      front: `What is the main theme of ${title || 'these notes'}?`,
      back: `Comprehensive review of key concepts and principles documented in this study note.`,
      category: title || 'General'
    });
  }

  return {
    title: title || 'Study Notes Analysis',
    category: 'Academic Study',
    complexityLevel: wordCount > 500 ? 'Intermediate' : 'Beginner',
    estimatedReadTimeMins,
    summaryBullets,
    keyTerms,
    flashcards,
    potentialExamQuestions: [
      `Explain the fundamental mechanisms governing ${title || 'the main concept'}.`,
      `Compare and contrast key terms and their practical applications.`,
      `How do changes in initial conditions impact the overall system outcome?`
    ]
  };
}

/**
 * Intelligent fallback for RAG tutoring queries
 */
export function askTutorFallback(
  question: string,
  notesContext: string,
  mode: string = 'feynman'
) {
  const { terms, facts } = extractKnowledgeFromNotes(notesContext);
  
  // Find relevant terms or facts matching question
  const cleanQ = question.toLowerCase();
  const matchedTerms = terms.filter(t => cleanQ.includes(t.term.toLowerCase()) || t.definition.toLowerCase().includes(cleanQ));
  const matchedFacts = facts.filter(f => cleanQ.split(' ').some(w => w.length > 3 && f.toLowerCase().includes(w)));

  let contextSnippet = '';
  if (matchedTerms.length > 0) {
    contextSnippet = `\n\n> **Grounding from Your Notes:**\n> **${matchedTerms[0].term}**: ${matchedTerms[0].definition}\n`;
  } else if (matchedFacts.length > 0) {
    contextSnippet = `\n\n> **From Your Notes:**\n> "${matchedFacts[0]}"\n`;
  }

  let explanation = '';
  if (mode === 'feynman') {
    explanation = `### 🧠 Feynman Technique Explanation\n\nImagine you are explaining this to a curious friend over coffee:\n\n1. **The Core Intuition**: At its heart, **${question.replace(/[\?\.]/g, '')}** works just like a real-world system where cause directly shapes effect.\n2. **The Analogy**: Think of it like an orchestra where each player needs to stay in sync—when one section changes tempo, the whole piece adapts to maintain harmony.\n3. **Why it matters**: Understanding the underlying mechanism lets you solve exam questions from first principles rather than relying on memorization.${contextSnippet}\n\n---\n### 💡 Active Recall Knowledge Checks:\n- *Can you explain this concept in 10 words or less without looking?*\n- *What would happen if the primary variable was doubled?*`;
  } else if (mode === 'eli5') {
    explanation = `### 🧸 Explain Like I'm 5 (ELI5)\n\nHere is the simple, super clear version:\n\nImagine you have a magic toy box. Whenever you put something in, a set of clear rules decides what comes out! **${question.replace(/[\?\.]/g, '')}** is just the rulebook that tells everything where to go so nothing gets lost.${contextSnippet}\n\n---\n### 💡 Quick Check:\n- *What is the most important part of this rule?*`;
  } else if (mode === 'deep_dive') {
    explanation = `### 🔬 Deep Dive & Academic Analysis\n\nLet's examine **${question}** rigorously:\n\n- **Theoretical Framework**: Governed by established academic principles and state transitions.\n- **Mechanism & Dynamics**: Variables interact predictably under standard boundary constraints.\n- **Common Exam Traps**: Watch out for confusing correlated phenomena with direct causation.${contextSnippet}\n\n---\n### 💡 Self-Test Challenge:\n- *How do boundary constraints alter edge-case behaviors here?*`;
  } else {
    explanation = `### 🎯 Targeted Study Guidance\n\nRegarding **${question}**:\n\n- **Core Concept**: Systematically addresses the prompt based on verified academic principles.\n- **Application**: Directly connects to your course goals and review milestones.${contextSnippet}\n\n---\n### 💡 Knowledge Check:\n- *How does this connect to your upcoming quiz?*`;
  }

  return {
    answer: explanation,
    mode,
    timestamp: new Date().toISOString()
  };
}
