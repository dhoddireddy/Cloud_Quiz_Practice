import javaData from './Java_MCQs.json';
import jsNodeData from './JavaScript_NodeJS_MCQs.json';
import tsData from './TypeScript_MCQs.json';
import reactData from './React_MCQs.json';
import angularData from './Angular_MCQs.json';
import htmlCssData from './HTML_CSS_mcqs.json';
import nodeData from './NodeJS_MCQs.json';
import mongoData from './MongoDB_MCQs.json';
import springData from './Spring_Core_Spring_Boot_MCQs.json';
import devOpsData from './DevOps_MCQs.json';

export interface TestQuestion {
  id: string;
  topic: string;
  topicId: string;
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TestAnswer {
  questionId: string;
  selectedIndex: number | null;
  correct: boolean;
  timedOut: boolean;
  timeTaken: number;
}

export interface TestResult {
  questions: TestQuestion[];
  answers: TestAnswer[];
  totalCorrect: number;
  totalQuestions: number;
  percentage: number;
  timedOutCount: number;
  tabSwitchCount: number;
  timeTakenSeconds: number;
  perTopic: Record<string, {
    name: string;
    category: string;
    total: number;
    correct: number;
    wrong: number;
    timedOut: number;
    percentage: number;
  }>;
  startedAt: number;
  endedAt: number;
  terminatedReason?: string;
}

interface RawQuestion {
  question: string;
  options: string[];
  correct: string;
}

interface SourceBank {
  topicId: string;
  topic: string;
  category: string;
  source: RawQuestion[];
}

const sourceBanks: SourceBank[] = [
  { topicId: 'java', topic: 'Java Mastery', category: 'Backend', source: javaData },
  { topicId: 'js-node', topic: 'JS & Node.js', category: 'Fullstack', source: jsNodeData },
  { topicId: 'ts', topic: 'TypeScript', category: 'Frontend', source: tsData },
  { topicId: 'react', topic: 'React', category: 'Frontend', source: reactData },
  { topicId: 'angular', topic: 'Angular', category: 'Frontend', source: angularData },
  { topicId: 'html-css', topic: 'HTML & CSS', category: 'Frontend', source: htmlCssData },
  { topicId: 'nodejs', topic: 'Node.js', category: 'Backend', source: nodeData },
  { topicId: 'mongo', topic: 'MongoDB', category: 'Database', source: mongoData },
  { topicId: 'spring', topic: 'Spring Boot', category: 'Backend', source: springData },
  { topicId: 'devops', topic: 'DevOps & Git', category: 'DevOps', source: devOpsData },
];

export const testDistribution: Record<string, number> = {
  java: 6,
  'js-node': 6,
  ts: 6,
  react: 6,
  angular: 6,
  'html-css': 6,
  nodejs: 6,
  mongo: 6,
  spring: 6,
  devops: 6,
};

export const testPlusDistribution: Record<string, number> = {
  java: 8,          // Cloud Microservices - Java
  'html-css': 6,    // Cloud Microservices - HTML5 CSS and Bootstrap
  'js-node': 7,     // Cloud Microservices - JavaScript
  angular: 8,       // Cloud Microservices - Angular
  react: 7,         // Cloud Microservices - React
  mongo: 7,         // Cloud Microservices - MongoDB
  spring: 15,       // Cloud Microservices - Spring Core/AOP/Testing + DAO/Hibernate/JPA + Boot/REST + Microservices
  devops: 2,        // Cloud Microservices - DevOps
};

const shuffleArray = <T,>(items: T[]) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const normalizeQuestions = (bank: SourceBank): TestQuestion[] => {
  return bank.source.map((item, index) => {
    const options = Array.isArray(item.options) ? [...item.options] : [];
    const correctIndex = options.findIndex(opt => String(opt).trim() === String(item.correct).trim());

    return {
      id: `${bank.topicId}-${index}`,
      topic: bank.topic,
      topicId: bank.topicId,
      category: bank.category,
      question: item.question || 'Question text is missing',
      options,
      correctIndex: correctIndex !== -1 ? correctIndex : 0,
      explanation: `Correct answer: ${String(item.correct).trim()}. Use this concept to verify your understanding and revisit the topic if needed.`,
    };
  });
};

const buildQuestionBanks = sourceBanks.map(bank => ({
  topicId: bank.topicId,
  topic: bank.topic,
  category: bank.category,
  questions: normalizeQuestions(bank),
}));

const getAttemptedQuestionIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem('pta_attempted_questions');
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
};

const shuffleQuestionWithOptions = (question: TestQuestion): TestQuestion => {
  const shuffledOptions = shuffleArray(question.options);
  const correctText = question.options[question.correctIndex];
  const correctIndex = shuffledOptions.findIndex(option => option === correctText);
  return {
    ...question,
    options: shuffledOptions,
    correctIndex: correctIndex !== -1 ? correctIndex : 0,
  };
};

export const createTestQuestionSet = (): TestQuestion[] => {
  const selected: TestQuestion[] = [];
  const selectedIds = new Set<string>();
  const attemptedIds = getAttemptedQuestionIds();
  const bankStates = buildQuestionBanks.map(bank => ({
    bank,
    unused: shuffleArray(bank.questions.filter(q => !attemptedIds.has(q.id))),
    reuseIndex: 0,
  }));

  // Desired order: Java, Spring, Node, then other topics
  const order = [
    'java',
    'spring',
    'nodejs',
    'js-node',
    'ts',
    'react',
    'angular',
    'html-css',
    'mongo',
    'devops',
  ];

  let anyAdded = true;
  while (selected.length < 60 && anyAdded) {
    anyAdded = false;
    for (const topicId of order) {
      if (selected.length >= 60) break;
      const state = bankStates.find(s => s.bank.topicId === topicId);
      if (!state) continue;

      let nextQuestion: TestQuestion | undefined;
      if (state.unused.length > 0) {
        nextQuestion = state.unused.shift();
      } else {
        while (state.reuseIndex < state.bank.questions.length && selectedIds.has(state.bank.questions[state.reuseIndex].id)) {
          state.reuseIndex += 1;
        }
        if (state.reuseIndex < state.bank.questions.length) {
          nextQuestion = state.bank.questions[state.reuseIndex];
          state.reuseIndex += 1;
        }
      }

      if (!nextQuestion) {
        continue;
      }

      selected.push(shuffleQuestionWithOptions(nextQuestion));
      selectedIds.add(nextQuestion.id);
      anyAdded = true;
    }
  }

  return selected.slice(0, 60);
};

export const createTestPlusQuestionSet = (): TestQuestion[] => {
  const selected: TestQuestion[] = [];
  const selectedIds = new Set<string>();
  const attemptedIds = getAttemptedQuestionIds();

  buildQuestionBanks.forEach(bank => {
    const count = testPlusDistribution[bank.topicId] || 0;
    if (count <= 0) return;

    const bankSelected: TestQuestion[] = [];
    const unused = shuffleArray(bank.questions.filter(q => !attemptedIds.has(q.id)));
    let reuseIndex = 0;

    while (bankSelected.length < count) {
      let next: TestQuestion | undefined;
      if (unused.length > 0) {
        next = unused.shift();
      } else {
        while (reuseIndex < bank.questions.length && selectedIds.has(bank.questions[reuseIndex].id)) {
          reuseIndex += 1;
        }
        if (reuseIndex < bank.questions.length) {
          next = bank.questions[reuseIndex];
          reuseIndex += 1;
        }
      }

      if (!next) {
        break;
      }

      bankSelected.push(next);
      selectedIds.add(next.id);
    }

    selected.push(...bankSelected.map(shuffleQuestionWithOptions));
  });

  return selected.slice(0, 60);
};
