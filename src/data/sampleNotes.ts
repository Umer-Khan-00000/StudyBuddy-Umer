import { Note } from '../types';

export const SAMPLE_NOTES: Note[] = [
  {
    id: 'note-bio-atp',
    title: 'Cellular Respiration & ATP Synthesis',
    category: 'Biology',
    colorTag: 'emerald',
    complexityLevel: 'Intermediate',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    wordCount: 420,
    summaryBullets: [
      'Cellular respiration converts glucose into usable ATP energy via four distinct stages: Glycolysis, Pyruvate Oxidation, Citric Acid Cycle, and Oxidative Phosphorylation.',
      'Glycolysis occurs anaerobically in the cytosol, generating a net yield of 2 ATP and 2 NADH per glucose molecule.',
      'Oxidative phosphorylation (Electron Transport Chain + Chemiosmosis) occurs on the inner mitochondrial cristae and produces the majority of ATP (~28–32 ATP).',
      'The proton-motive force drives ATP Synthase, which acts as a molecular rotor converting ADP and Pi into ATP.'
    ],
    keyTerms: [
      {
        term: 'ATP Synthase',
        definition: 'A multi-subunit enzyme embedded in the inner mitochondrial membrane that utilizes the electrochemical proton gradient to phosphorylate ADP into ATP.'
      },
      {
        term: 'Glycolysis',
        definition: 'The 10-step metabolic pathway occurring in the cytosol that splits 1 glucose molecule (6 carbons) into 2 pyruvate molecules (3 carbons) with a net yield of 2 ATP.'
      },
      {
        term: 'Chemiosmosis',
        definition: 'The movement of hydrogen ions (protons) across a semipermeable membrane down their electrochemical gradient to generate metabolic energy.'
      },
      {
        term: 'Final Electron Acceptor',
        definition: 'Oxygen (O2) acts as the terminal electron acceptor in aerobic respiration, combining with electrons and protons to form water (H2O).'
      }
    ],
    flashcards: [
      {
        id: 'fc-bio-1',
        front: 'Where does Glycolysis take place in a eukaryotic cell, and does it require oxygen?',
        back: 'In the cytosol (cytoplasm); it is anaerobic and does NOT require oxygen.',
        category: 'Biology'
      },
      {
        id: 'fc-bio-2',
        front: 'What is the theoretical maximum net ATP yield per glucose molecule during aerobic cellular respiration?',
        back: 'Approximately 30 to 32 ATP molecules (often rounded to 36–38 in classical models).',
        category: 'Biology'
      },
      {
        id: 'fc-bio-3',
        front: 'What acts as the terminal electron acceptor in the mitochondrial electron transport chain?',
        back: 'Molecular Oxygen (O2), which accepts electrons and protons to produce H2O.',
        category: 'Biology'
      },
      {
        id: 'fc-bio-4',
        front: 'Explain the mechanism of ATP Synthase in one sentence.',
        back: 'It harnesses the flow of protons passing down their electrochemical gradient from the intermembrane space into the matrix to rotate its catalytic head and synthesize ATP.',
        category: 'Biology'
      }
    ],
    potentialExamQuestions: [
      'Compare substrate-level phosphorylation with oxidative phosphorylation.',
      'What happens to the electron transport chain if oxygen is completely depleted?',
      'Why is the inner mitochondrial membrane highly folded into cristae?'
    ],
    content: `# Cellular Respiration & ATP Synthesis

## 1. Overview
Cellular respiration is the biochemical pathway by which cells harvest chemical energy from glucose molecules and store it in the high-energy phosphoanhydride bonds of Adenosine Triphosphate (ATP).
Overall Equation:
C6H12O6 + 6 O2 → 6 CO2 + 6 H2O + ~30-32 ATP + Heat

## 2. The Four Sequential Stages
1. **Glycolysis** (Cytoplasm):
   - Energy investment phase (costs 2 ATP).
   - Energy payoff phase (yields 4 ATP via substrate-level phosphorylation + 2 NADH).
   - Net gain: 2 ATP + 2 NADH + 2 Pyruvate.

2. **Pyruvate Oxidation** (Mitochondrial Matrix):
   - 2 Pyruvate are transported across mitochondrial membranes.
   - Each pyruvate is decarboxylated (releasing CO2) and coupled to Coenzyme A to form Acetyl-CoA + 1 NADH.

3. **Citric Acid (Krebs) Cycle** (Mitochondrial Matrix):
   - Acetyl-CoA combines with Oxaloacetate (4C) to form Citrate (6C).
   - Per glucose (2 turns of cycle): Yields 2 ATP/GTP, 6 NADH, 2 FADH2, and releases 4 CO2.

4. **Oxidative Phosphorylation** (Inner Mitochondrial Membrane):
   - **Electron Transport Chain (ETC)**: Complexes I, II, III, IV transfer electrons from NADH and FADH2 to Oxygen (terminal electron acceptor).
   - Protons (H+) are actively pumped from the matrix into the intermembrane space, building a steep electrochemical gradient (Proton-Motive Force).
   - **Chemiosmosis**: Protons rush back into the matrix through the channel of ATP Synthase. The mechanical rotation drives the phosphorylation of ADP + Pi → ATP.

## 3. Clinical & Biological Significance
- **Cyanide & Carbon Monoxide Inhibition**: Block Cytochrome c oxidase (Complex IV), immediately halting proton pumping and ATP production.
- **Uncoupling Proteins (UCP-1 / Thermogenin)**: Allow protons to leak back without synthesizing ATP, generating pure heat (essential in brown adipose tissue for thermoregulation).`
  },
  {
    id: 'note-cs-os',
    title: 'Operating Systems: Concurrency & Deadlocks',
    category: 'Computer Science',
    colorTag: 'blue',
    complexityLevel: 'Advanced',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    wordCount: 380,
    summaryBullets: [
      'Concurrency involves managing multiple threads of execution sharing CPU and memory resources safely.',
      'Race conditions occur when multiple processes manipulate shared state without proper synchronization, causing non-deterministic bugs.',
      'A deadlock occurs when a set of processes are permanently blocked because each holds a resource that another needs.',
      'The four Coffman conditions (Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait) are all required simultaneously for a deadlock to exist.'
    ],
    keyTerms: [
      {
        term: 'Deadlock',
        definition: 'A state in which two or more competing actions are each waiting for the other to finish, and thus neither ever does.'
      },
      {
        term: 'Mutex (Mutual Exclusion)',
        definition: 'A synchronization primitive that grants exclusive access to a shared critical section to only one thread at a time.'
      },
      {
        term: 'Semaphore',
        definition: 'A signaling mechanism and counter variable used to control access to a common resource by multiple concurrent threads.'
      },
      {
        term: 'Banker\'s Algorithm',
        definition: 'A deadlock avoidance algorithm developed by Edsger Dijkstra that tests for safety by simulating the allocation of predetermined maximum possible amounts of resources.'
      }
    ],
    flashcards: [
      {
        id: 'fc-cs-1',
        front: 'What are the 4 Coffman Conditions required for a Deadlock?',
        back: '1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, 4. Circular Wait.',
        category: 'Computer Science'
      },
      {
        id: 'fc-cs-2',
        front: 'What is the difference between a Mutex and a Counting Semaphore?',
        back: 'A Mutex is a locking mechanism with ownership (1 thread at a time), while a Counting Semaphore is a signaling counter allowing up to N concurrent threads.',
        category: 'Computer Science'
      },
      {
        id: 'fc-cs-3',
        front: 'How can you prevent the Circular Wait condition in software architecture?',
        back: 'Impose a global total ordering on all resources and require processes to request resources in strictly ascending numerical order.',
        category: 'Computer Science'
      }
    ],
    potentialExamQuestions: [
      'Given a Resource Allocation Graph, how do you determine if a deadlock exists?',
      'Why is Priority Inversion dangerous in real-time operating systems, and how does Priority Inheritance solve it?'
    ],
    content: `# Operating Systems: Concurrency & Deadlocks

## 1. Concurrency & Critical Sections
When multiple threads execute concurrently and share mutable state (e.g. global counters, linked lists), race conditions can occur.
A **Critical Section** is a segment of code where shared resources are accessed.
Requirements for valid synchronization:
1. **Mutual Exclusion**: Only one thread in critical section at any instant.
2. **Progress**: If no thread is in the critical section and some wish to enter, selection cannot be postponed indefinitely.
3. **Bounded Waiting**: There must be a limit on the number of times other threads can enter before a requesting thread is granted access.

## 2. Deadlocks & The 4 Coffman Conditions
For a deadlock to occur, ALL four of the following conditions must hold concurrently:
1. **Mutual Exclusion**: At least one resource must be held in a non-shareable mode.
2. **Hold and Wait**: A process is holding at least one resource and waiting to acquire additional resources held by other processes.
3. **No Preemption**: Resources cannot be preempted; they can only be released voluntarily by the process holding them.
4. **Circular Wait**: A closed chain of processes exists, where each process holds at least one resource needed by the next process in the chain (P0 → P1 → P2 → P0).

## 3. Deadlock Handling Strategies
- **Deadlock Prevention**: Invalidate at least one Coffman condition (e.g. eliminate circular wait by enforcing resource ordering).
- **Deadlock Avoidance**: The OS dynamically monitors resource state. Banker's Algorithm checks if granting a request leaves the system in a "Safe State".
- **Deadlock Detection & Recovery**: Allow deadlock to occur, periodically run cycle detection on the Wait-For Graph (WFG), and terminate processes or preempt resources to break cycles.
- **Ostrich Algorithm**: Ignore the problem if deadlocks occur rarely and prevention is computationally expensive.`
  },
  {
    id: 'note-econ-macro',
    title: 'Macroeconomics: Monetary Policy & Inflation',
    category: 'Economics',
    colorTag: 'amber',
    complexityLevel: 'Intermediate',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    wordCount: 360,
    summaryBullets: [
      'Central banks use monetary policy to achieve price stability, maximum employment, and moderate long-term interest rates.',
      'Contractionary monetary policy raises interest rates to curb inflation, while expansionary policy lowers rates to stimulate aggregate demand.',
      'The Phillips Curve illustrates the short-run inverse trade-off between inflation and unemployment.',
      'Quantitative Easing (QE) involves central banks purchasing long-term government securities to inject liquidity directly into commercial banking reserves.'
    ],
    keyTerms: [
      {
        term: 'Federal Funds Rate',
        definition: 'The benchmark interest rate at which commercial depository institutions lend reserve balances to other depository institutions overnight.'
      },
      {
        term: 'Open Market Operations (OMO)',
        definition: 'The buying and selling of government securities in the open market by a central bank to expand or contract money supply.'
      },
      {
        term: 'Demand-Pull Inflation',
        definition: 'Inflation that occurs when aggregate demand for goods and services outpaces aggregate supply in an economy.'
      },
      {
        term: 'Cost-Push Inflation',
        definition: 'Inflation caused by an increase in prices of inputs (e.g., energy, raw materials, wages), shifting the short-run aggregate supply curve leftward.'
      }
    ],
    flashcards: [
      {
        id: 'fc-econ-1',
        front: 'What are the three primary conventional tools of central bank monetary policy?',
        back: '1. Open Market Operations (buying/selling bonds), 2. The Discount/Policy Interest Rate, 3. Reserve Requirements.',
        category: 'Economics'
      },
      {
        id: 'fc-econ-2',
        front: 'If a central bank sells government bonds in open market operations, what happens to money supply and interest rates?',
        back: 'Money supply decreases (liquidity is absorbed), and interest rates increase.',
        category: 'Economics'
      },
      {
        id: 'fc-econ-3',
        front: 'What is Stagflation, and why is it difficult for central banks to manage?',
        back: 'A combination of stagnant economic growth/high unemployment AND high inflation; raising rates worsens unemployment while lowering rates accelerates inflation.',
        category: 'Economics'
      }
    ],
    potentialExamQuestions: [
      'Explain how the Taylor Rule guides interest rate adjustments based on inflation and output gaps.',
      'Why is the long-run Phillips Curve considered vertical at the Natural Rate of Unemployment (NAIRU)?'
    ],
    content: `# Macroeconomics: Monetary Policy & Inflation

## 1. Central Bank Objectives & Dual Mandate
Monetary policy refers to the actions undertaken by a nation's central bank (such as the Federal Reserve, ECB, or Bank of England) to manage the money supply and credit conditions.
Primary Objectives:
1. **Price Stability** (Typically targeted around 2.0% annual core inflation).
2. **Maximum Sustainable Employment**.

## 2. Monetary Policy Stances
- **Expansionary (Dovish)**:
  - Used during recessions or output contractions.
  - Central bank cuts policy rates and buys government bonds.
  - Lower borrowing costs stimulate business investment (I) and consumer spending (C), shifting Aggregate Demand (AD) rightward.
- **Contractionary (Hawkish)**:
  - Used when the economy is overheating and inflation is elevated.
  - Central bank raises rates and reduces balance sheet liquidity.
  - Slows credit creation and cools demand-pull inflation.

## 3. Inflation Mechanisms
- **Demand-Pull Inflation**: "Too much money chasing too few goods". AD shifts right beyond potential GDP (Y*).
- **Cost-Push Inflation**: Supply shock (e.g. oil supply embargo) shifts SRAS to the left, raising price levels while lowering real output (Stagflation).
- **Inflation Expectations**: If consumers and firms expect 5% inflation next year, workers demand higher wages and firms set higher prices, creating a self-fulfilling wage-price spiral.`
  }
];
