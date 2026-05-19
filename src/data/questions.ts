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

const distribution: Record<string, number> = {
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
  // Exclude questions that have been attempted in previous tests
  let attemptedIds: Set<string> = new Set();
  try {
    const raw = localStorage.getItem('pta_attempted_questions');
    if (raw) {
      const parsed = JSON.parse(raw) as string[];
      attemptedIds = new Set(parsed);
    }
  } catch {
    attemptedIds = new Set();
  }

  buildQuestionBanks.forEach(bank => {
    const count = distribution[bank.topicId] || 0;
    const available = bank.questions.filter(q => !attemptedIds.has(q.id));
    const bankQuestions = shuffleArray(available).slice(0, count).map(shuffleQuestionWithOptions);
    selected.push(...bankQuestions);
  });

  // Keep topic-wise grouping (no overall shuffle) and cap to 60
  return selected.slice(0, 60);
};
