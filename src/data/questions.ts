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
    const options = Array.isArray(item.options) ? item.options.map(o => String(o).trim()) : [];
    const correctIndex = options.findIndex(opt => opt === String(item.correct).trim());

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
  const correctText = String(question.options[question.correctIndex]).trim();
  const correctIndex = shuffledOptions.findIndex(option => String(option).trim() === correctText);
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

  for (const topicId of order) {
    if (selected.length >= 60) break;
    const bank = buildQuestionBanks.find(bankItem => bankItem.topicId === topicId);
    if (!bank) continue;

    const count = testDistribution[topicId] || 0;
    if (count <= 0) continue;

    const unused = shuffleArray(bank.questions.filter(q => !attemptedIds.has(q.id)));
    let reuseIndex = 0;
    let picked = 0;

    while (picked < count) {
      let nextQuestion: TestQuestion | undefined;
      if (unused.length > 0) {
        nextQuestion = unused.shift();
      } else {
        while (reuseIndex < bank.questions.length && selectedIds.has(bank.questions[reuseIndex].id)) {
          reuseIndex += 1;
        }
        if (reuseIndex < bank.questions.length) {
          nextQuestion = bank.questions[reuseIndex];
          reuseIndex += 1;
        }
      }

      if (!nextQuestion) {
        break;
      }

      if (selectedIds.has(nextQuestion.id)) {
        continue;
      }

      selected.push(shuffleQuestionWithOptions(nextQuestion));
      selectedIds.add(nextQuestion.id);
      picked += 1;
    }
  }

  return selected.slice(0, 60);
};

