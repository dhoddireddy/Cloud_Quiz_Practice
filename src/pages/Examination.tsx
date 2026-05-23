import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ShieldAlert, Clock3, XCircle } from 'lucide-react';
import { TestQuestion, TestResult } from '../data/questions';
import '../pages/TestPage.css';
import { useAppContext } from '../context/AppContext';
import dumpCloudFSD from '../previous_year_dumps_json/Cloud FSD Questions.json';

interface TestAnswer {
  questionId: string;
  selectedIndex: number | null;
  correct: boolean;
  timedOut: boolean;
  timeTaken: number;
}

const RESULT_STORAGE_KEY = 'latestTestResult';
const TEST_DURATION_SECONDS = 60 * 60;

const getTimerColor = (seconds: number) => {
  if (seconds >= 1200) return 'text-emerald-600';
  if (seconds >= 300) return 'text-amber-500';
  return 'text-rose-500';
};

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const parseCorrectAnswer = (options: string[], answerStr: string): number => {
  if (!options || options.length === 0 || !answerStr) return -1;

  const cleanAns = answerStr.trim().toLowerCase();
  let baseAns = cleanAns;
  if (baseAns.startsWith('-')) {
    baseAns = baseAns.substring(1).trim();
  }

  let match = baseAns.match(/^(?:ans:\s*|option\s*)?([a-e])(?:\.|\)|$|\s)/i);
  if (match) {
    const letter = match[1].toLowerCase();
    const index = letter.charCodeAt(0) - 97;
    if (index >= 0 && index < options.length) {
      return index;
    }
  }

  for (let i = 0; i < options.length; i++) {
    const optClean = options[i].trim().toLowerCase();
    const optLetterMatch = optClean.match(/^([a-e])(?:\.|\)|\s)/i);
    if (optLetterMatch) {
      const optLetter = optLetterMatch[1];
      if (baseAns === optLetter || baseAns.startsWith(optLetter + ' ') || baseAns === optLetter + '.' || baseAns === optLetter + ')') {
        return i;
      }
      const afterPrefix = optClean.substring(optLetterMatch[0].length).trim();
      if (baseAns === afterPrefix || afterPrefix.includes(baseAns) || baseAns.includes(afterPrefix)) {
        if (baseAns.length > 2 && afterPrefix.length > 2) {
          return i;
        }
      }
    }
    if (optClean === baseAns || optClean.includes(baseAns) || baseAns.includes(optClean)) {
      if (baseAns.length > 1 && optClean.length > 1) {
        return i;
      }
    }
  }

  if (baseAns.length === 1) {
    const code = baseAns.charCodeAt(0) - 97;
    if (code >= 0 && code < options.length) {
      return code;
    }
  }

  return -1;
};

const cleanOption = (option: string): string => {
  if (!option) return '';
  return option.replace(/^[A-Ea-e](?:\.|\))\s*/, '').trim();
};

const shuffleArray = <T,>(items: T[]) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
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

const normalizeQuestion = (q: any, index: number, topicName: string, category: string): TestQuestion => {
  const rawOptions = Array.isArray(q.options) ? q.options.map((o: any) => String(o).trim()) : [];
  const rawAnswer = String(q.answer || q.correctAnswer || '').trim();
  
  const correctIndex = parseCorrectAnswer(rawOptions, rawAnswer);
  const cleanedOptions = rawOptions.map(cleanOption);
  
  return {
    id: `EXAM-Q-${q.id || index}`,
    topic: topicName,
    topicId: topicName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    category: category,
    question: q.question || 'Question text is missing',
    options: cleanedOptions,
    correctIndex: correctIndex !== -1 ? correctIndex : 0,
    explanation: q.explanation || `Correct answer: ${rawAnswer}. Revisit this topic if needed.`
  };
};

const getAttemptedQuestionIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem('pta_attempted_questions');
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
};

const createExamQuestionSet = (): TestQuestion[] => {
  const allQs = (dumpCloudFSD as any[]).map(q => {
    const hasOptions = q.options && q.options.length > 0;
    const ansStr = String(q.answer || q.correctAnswer || '').trim();
    const hasAnswer = ansStr !== '' && ansStr.toLowerCase() !== 'n/a';
    if (!hasOptions || !hasAnswer) {
      return {
        ...q,
        options: ["No answer refer to main PDF"],
        answer: "No answer refer to main PDF"
      };
    }
    return q;
  });
  
  const groups: Record<string, { name: string; category: string; questions: any[] }> = {
    java: { name: 'Java Core', category: 'Backend', questions: [] },
    html_css_bootstrap: { name: 'HTML5, CSS & Bootstrap', category: 'Frontend', questions: [] },
    javascript: { name: 'JavaScript', category: 'Frontend', questions: [] },
    angular: { name: 'Angular', category: 'Frontend', questions: [] },
    react: { name: 'React', category: 'Frontend', questions: [] },
    mongodb: { name: 'MongoDB', category: 'Database', questions: [] },
    spring_core_aop_testing: { name: 'Spring Core, AOP & Testing', category: 'Backend', questions: [] },
    spring_dao_hibernate_jpa: { name: 'Spring DAO, Hibernate & JPA', category: 'Backend', questions: [] },
    spring_boot_rest: { name: 'Spring Boot & REST Services', category: 'Backend', questions: [] },
    microservices: { name: 'Microservices', category: 'Backend', questions: [] },
    devops: { name: 'DevOps', category: 'DevOps', questions: [] },
  };

  allQs.forEach((q: any) => {
    const text = ((q.question || '') + ' ' + (q.section || '')).toLowerCase();
    const sec = (q.section || '').toUpperCase();

    if (sec === 'JAVA CORE') {
      groups.java.questions.push(q);
    } else if (sec === 'HTML & CSS') {
      groups.html_css_bootstrap.questions.push(q);
    } else if (sec === 'JAVASCRIPT') {
      groups.javascript.questions.push(q);
    } else if (sec === 'ANGULAR') {
      groups.angular.questions.push(q);
    } else if (sec === 'REACT') {
      groups.react.questions.push(q);
    } else if (sec === 'MONGODB') {
      groups.mongodb.questions.push(q);
    } else if (sec === 'DOCKER & DEVOPS') {
      groups.devops.questions.push(q);
    } else if (sec === 'SPRING AOP') {
      groups.spring_core_aop_testing.questions.push(q);
    } else if (sec === 'JAVA SPRING') {
      if (text.includes('microservice') || text.includes('eureka') || text.includes('gateway') || text.includes('resilience') || text.includes('circuit')) {
        groups.microservices.questions.push(q);
      } else if (text.includes('boot') || text.includes('rest') || text.includes('controller') || text.includes('mapping')) {
        groups.spring_boot_rest.questions.push(q);
      } else if (text.includes('dao') || text.includes('hibernate') || text.includes('jpa') || text.includes('entity') || text.includes('transaction') || text.includes('repository')) {
        groups.spring_dao_hibernate_jpa.questions.push(q);
      } else {
        groups.spring_core_aop_testing.questions.push(q);
      }
    } else {
      if (text.includes('eureka') || text.includes('gateway') || text.includes('microservice') || text.includes('feign')) {
        groups.microservices.questions.push(q);
      } else if (text.includes('docker') || text.includes('devops') || text.includes('git') || text.includes('pipeline') || text.includes('jenkins') || text.includes('kubernetes')) {
        groups.devops.questions.push(q);
      } else if (text.includes('hibernate') || text.includes('jpa') || text.includes('repository') || text.includes('jdbc') || text.includes('template') || text.includes('session')) {
        groups.spring_dao_hibernate_jpa.questions.push(q);
      } else if (text.includes('boot') || text.includes('rest') || text.includes('controller')) {
        groups.spring_boot_rest.questions.push(q);
      } else if (text.includes('spring') || text.includes('bean') || text.includes('aop') || text.includes('wire') || text.includes('autowir')) {
        groups.spring_core_aop_testing.questions.push(q);
      } else if (sec === 'TYPESCRIPT') {
        groups.javascript.questions.push(q);
      } else {
        groups.java.questions.push(q);
      }
    }
  });

  const requestedDistribution = [
    { key: 'java', count: 8 },
    { key: 'html_css_bootstrap', count: 6 },
    { key: 'javascript', count: 7 },
    { key: 'angular', count: 8 },
    { key: 'react', count: 7 },
    { key: 'mongodb', count: 7 },
    { key: 'spring_core_aop_testing', count: 5 },
    { key: 'spring_dao_hibernate_jpa', count: 3 },
    { key: 'spring_boot_rest', count: 4 },
    { key: 'microservices', count: 3 },
    { key: 'devops', count: 2 },
  ];

  const selected: TestQuestion[] = [];
  const selectedGlobalIds = new Set<string>();
  const attemptedIds = getAttemptedQuestionIds();

  requestedDistribution.forEach(({ key, count }) => {
    const group = groups[key];
    const pool = group.questions;
    
    const unattempted = shuffleArray(pool.filter((q: any) => !attemptedIds.has(`EXAM-Q-${q.id}`)));
    const attempted = shuffleArray(pool.filter((q: any) => attemptedIds.has(`EXAM-Q-${q.id}`)));
    const combined = [...unattempted, ...attempted];

    let picked = 0;
    for (const q of combined) {
      if (picked >= count) break;
      const qId = `EXAM-Q-${q.id}`;
      if (selectedGlobalIds.has(qId)) continue;

      const normQ = normalizeQuestion(q, selected.length, group.name, group.category);
      normQ.id = qId;
      selected.push(shuffleQuestionWithOptions(normQ));
      selectedGlobalIds.add(qId);
      picked++;
    }

    if (picked < count) {
      const allShuffled = shuffleArray(allQs);
      for (const q of allShuffled) {
        if (picked >= count) break;
        const qId = `EXAM-Q-${q.id}`;
        if (selectedGlobalIds.has(qId)) continue;
        
        const normQ = normalizeQuestion(q, selected.length, group.name, group.category);
        normQ.id = qId;
        selected.push(shuffleQuestionWithOptions(normQ));
        selectedGlobalIds.add(qId);
        picked++;
      }
    }
  });

  return selected.slice(0, 60);
};

const buildResult = (
  questions: TestQuestion[],
  answers: TestAnswer[],
  tabSwitchCount: number,
  startedAt: number,
  terminatedReason?: string
): TestResult => {
  const completeAnswers = questions.map(question => {
    const answer = answers.find(item => item.questionId === question.id);
    if (answer) return answer;
    return {
      questionId: question.id,
      selectedIndex: null,
      correct: false,
      timedOut: true,
      timeTaken: 0,
    } as TestAnswer;
  });

  const perTopic: Record<string, { name: string; category: string; total: number; correct: number; wrong: number; timedOut: number; percentage: number }> = {};
  let totalCorrect = 0;
  let timedOutCount = 0;
  let timeTakenSeconds = 0;

  questions.forEach((question, index) => {
    const answer = completeAnswers[index];
    const topicKey = question.topic;
    if (!perTopic[topicKey]) {
      perTopic[topicKey] = {
        name: question.topic,
        category: question.category,
        total: 0,
        correct: 0,
        wrong: 0,
        timedOut: 0,
        percentage: 0,
      };
    }

    perTopic[topicKey].total += 1;
    timeTakenSeconds += answer.timeTaken;

    if (answer.correct) {
      perTopic[topicKey].correct += 1;
      totalCorrect += 1;
    } else if (answer.timedOut) {
      perTopic[topicKey].timedOut += 1;
      timedOutCount += 1;
    } else {
      perTopic[topicKey].wrong += 1;
    }
  });

  Object.values(perTopic).forEach(item => {
    item.percentage = item.total === 0 ? 0 : parseFloat(((item.correct / item.total) * 100).toFixed(2));
  });

  return {
    questions,
    answers: completeAnswers,
    totalCorrect,
    totalQuestions: questions.length,
    percentage: parseFloat(((totalCorrect / questions.length) * 100).toFixed(2)),
    timedOutCount,
    tabSwitchCount,
    timeTakenSeconds,
    perTopic,
    startedAt,
    endedAt: Date.now(),
    terminatedReason,
  };
};

const Examination: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useAppContext();
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<TestAnswer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(TEST_DURATION_SECONDS);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [phase, setPhase] = useState<'intro' | 'running' | 'submitting'>('intro');
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [warningOpen, setWarningOpen] = useState(false);
  const [terminationOpen, setTerminationOpen] = useState(false);
  const [violationMessage, setViolationMessage] = useState('');
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [allowAnswer, setAllowAnswer] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  const savedTests = (() => {
    try {
      const raw = localStorage.getItem('pta_tests');
      const all = raw ? (JSON.parse(raw) as any[]) : [];
      return all.filter(test => test.id && String(test.id).startsWith('EXAM-'));
    } catch {
      return [];
    }
  })();

  const totalTestsTaken = savedTests.length;
  const bestScore = totalTestsTaken > 0 ? Math.max(...savedTests.map(test => test.result?.percentage ?? 0)) : 0;
  const averageScore = totalTestsTaken > 0
    ? Math.round(savedTests.reduce((sum, test) => sum + (test.result?.percentage ?? 0), 0) / totalTestsTaken)
    : 0;
  const lastScore = totalTestsTaken > 0 ? savedTests[0].result?.percentage ?? 0 : 0;
  const lastScoreText = totalTestsTaken > 0
    ? `${savedTests[0].result?.totalCorrect ?? 0} / ${savedTests[0].result?.totalQuestions ?? 0}`
    : '—';

  const currentQuestion = questions[currentIndex];
  const activeAnswer = currentQuestion ? answers.find(answer => answer.questionId === currentQuestion.id) : undefined;
  const lastAnswerTimestampRef = useRef<number>(Date.now());

  const startTimer = () => {
    stopTimer();
    timerRef.current = window.setInterval(() => {
      setTimeRemaining(prev => Math.max(prev - 1, 0));
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const finishTest = (reason?: string, skipResults = false) => {
    stopTimer();
    if (skipResults) {
      setViolationMessage(reason ?? 'Examination ended.');
      setTerminationOpen(true);
      setPhase('intro');
      setQuestions([]);
      setCurrentIndex(0);
      setAnswers([]);
      setTimeRemaining(TEST_DURATION_SECONDS);
      setStartedAt(null);
      setTabSwitchCount(0);
      setAllowAnswer(true);
      setIsPaused(false);
      setWarningOpen(false);
      return;
    }
    const result = buildResult(questions, answers, tabSwitchCount, startedAt ?? Date.now(), reason);
    localStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(result));
    try {
      const raw = localStorage.getItem('pta_tests');
      const list = raw ? JSON.parse(raw) as any[] : [];
      const nextId = `EXAM-${list.length + 1}`;
      const mini = {
        id: nextId,
        createdAt: Date.now(),
        totalQuestions: result.totalQuestions,
        questions: result.questions.map(q => ({ id: q.id, topic: q.topic, question: q.question })),
        result,
      };
      list.unshift(mini);
      localStorage.setItem('pta_tests', JSON.stringify(list));

      const attemptedRaw = localStorage.getItem('pta_attempted_questions');
      const attemptedList = attemptedRaw ? JSON.parse(attemptedRaw) as string[] : [];
      const newAttempted = Array.from(new Set([...attemptedList, ...result.questions.map(q => q.id)]));
      localStorage.setItem('pta_attempted_questions', JSON.stringify(newAttempted));
    } catch (e) {
      console.error('Failed to save examination history', e);
    }
    setPhase('submitting');
    setTimeout(() => {
      navigate('/results', { state: { result } });
    }, 600);
  };

  const advanceQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      finishTest();
      return;
    }
    setCurrentIndex(prev => prev + 1);
    setAllowAnswer(true);
  };

  const recordAnswer = (selectedIndex: number | null, timedOut = false) => {
    if (!currentQuestion || !allowAnswer) return;

    const now = Date.now();
    const answerTime = Math.max(1, Math.round((now - lastAnswerTimestampRef.current) / 1000));
    lastAnswerTimestampRef.current = now;

    const answerRecord: TestAnswer = {
      questionId: currentQuestion.id,
      selectedIndex,
      correct: selectedIndex !== null && selectedIndex === currentQuestion.correctIndex,
      timedOut,
      timeTaken: answerTime,
    };

    setAnswers(prev => [...prev, answerRecord]);
    setAllowAnswer(false);
    setTimeout(advanceQuestion, 550);
  };

  const startTest = async () => {
    const newQuestions = createExamQuestionSet();
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setAnswers([]);
    setTimeRemaining(TEST_DURATION_SECONDS);
    const start = Date.now();
    setStartedAt(start);
    lastAnswerTimestampRef.current = start;
    setPhase('running');
    setTabSwitchCount(0);
    setAllowAnswer(true);
    setIsPaused(false);
    window.history.pushState(null, '', window.location.href);

    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Optional fullscreen failure; ignore
    }
  };

  const handleViolation = () => {
    if (warningOpen || phase !== 'running') return;
    setTabSwitchCount(prev => {
      const next = prev + 1;
      if (next === 1) {
        setIsPaused(true);
        stopTimer();
        setViolationMessage('You left the examination by switching tabs. Return to the exam to continue. One more switch will end the test.');
        setWarningOpen(true);
      } else if (next === 2) {
        setIsPaused(true);
        stopTimer();
        setViolationMessage('This is your final warning. One more tab switch will end the examination and return you to the launchpad.');
        setWarningOpen(true);
      } else {
        finishTest('You came out of the examination because you switched tabs too many times. The session has ended.', true);
      }
      return next;
    });
  };

  useEffect(() => {
    if (phase === 'running' && !isPaused) {
      startTimer();
    }
    return stopTimer;
  }, [phase, isPaused]);

  useEffect(() => {
    if (phase === 'running' && timeRemaining === 0) {
      finishTest('Examination time ended.');
    }
  }, [timeRemaining, phase]);

  useEffect(() => {
    const onVisibility = () => {
      if (phase === 'running' && document.hidden) {
        handleViolation();
      }
    };

    const onBlur = () => {
      if (phase === 'running') {
        handleViolation();
      }
    };

    const onFullscreen = () => {
      if (phase === 'running' && !document.fullscreenElement) {
        handleViolation();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (phase !== 'running') return;
      const ctrl = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();
      if (ctrl && ['c', 'v', 'a'].includes(key)) {
        event.preventDefault();
      }
    };

    const onContextMenu = (event: MouseEvent) => {
      if (phase === 'running') {
        event.preventDefault();
      }
    };

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (phase === 'running') {
        event.preventDefault();
        event.returnValue = 'You are currently taking an examination. Are you sure you want to leave?';
      }
    };

    const onPopState = () => {
      if (phase === 'running') {
        const leave = window.confirm('Leaving now will end the examination. Do you want to continue?');
        if (!leave) {
          window.history.pushState(null, '', window.location.href);
        } else {
          finishTest('Examination terminated due to navigation away.');
        }
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    window.addEventListener('fullscreenchange', onFullscreen);
    window.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('popstate', onPopState);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('fullscreenchange', onFullscreen);
      window.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('beforeunload', onBeforeUnload);
      window.removeEventListener('popstate', onPopState);
    };
  }, [phase, warningOpen]);

  const closeWarning = () => {
    setWarningOpen(false);
    setIsPaused(false);
    setTimeRemaining(prev => (prev > 0 ? prev : 1));
  };

  return (
    <div className="test-page-root w-full max-w-6xl mx-auto px-4 py-8 relative">
      {phase === 'intro' && (
        <div className="rounded-[32px] border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-10 shadow-xl">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.3em] text-amber-500">
              <Play size={18} />
              Examination Hall
            </div>
            <div>
              <h1 className="text-4xl font-heading font-black text-zinc-950 dark:text-amber-50">Examination Environment</h1>
              <p className="mt-4 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400 leading-7">
                Complete exactly 60 shuffled questions pulled dynamically from all subject banks. The examination runs for exactly 1 hour, with a unified session timer, no pauses, and rigorous browser anti-cheat monitoring.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Total Questions</p>
                <p className="mt-3 text-4xl font-black text-zinc-950 dark:text-amber-50">60</p>
              </div>
              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Session duration</p>
                <p className="mt-3 text-4xl font-black text-zinc-950 dark:text-amber-50">1 hr</p>
              </div>
              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Anti-Cheat</p>
                <p className="mt-3 text-4xl font-black text-zinc-950 dark:text-amber-50">Active</p>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Official Exam Rules</h2>
              <ul className="mt-4 space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-7 list-disc list-inside">
                <li>Strict anti-cheat: switching browser tabs or leaving the screen will be flagged. Third switch terminates the session immediately.</li>
                <li>No backward navigation. Once a question is answered, it is locked.</li>
                <li>One hour session timer. The exam auto-submits when the timer reaches zero.</li>
                <li>Browser copy, paste, text selection, and right-click actions are completely disabled.</li>
              </ul>
            </div>
            
            <button
              type="button"
              onClick={startTest}
              className="mt-6 inline-flex items-center justify-center gap-3 rounded-3xl bg-amber-500 px-8 py-4 text-sm font-black uppercase tracking-[0.2em] text-zinc-950 transition hover:bg-amber-400"
            >
              Begin Examination
            </button>
          </div>
        </div>
      )}

      {phase === 'intro' && (
        <>
          <button
            type="button"
            onClick={() => setShowHistoryPanel(true)}
            className="fixed right-6 top-28 z-50 rounded-full border border-amber-500 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 shadow-lg shadow-amber-500/20 hover:bg-amber-100"
          >
            Exam History
          </button>

          {showHistoryPanel && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Examination History</h3>
                  <button
                    type="button"
                    onClick={() => setShowHistoryPanel(false)}
                    className="text-sm font-semibold text-zinc-500 hover:text-zinc-900"
                  >
                    Close
                  </button>
                </div>
                {totalTestsTaken > 0 ? (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 text-sm">
                        <div className="font-semibold text-zinc-900">Total exams taken</div>
                        <div className="mt-2 text-2xl font-black text-amber-600">{totalTestsTaken}</div>
                      </div>
                      <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 text-sm">
                        <div className="font-semibold text-zinc-900">Best score</div>
                        <div className="mt-2 text-2xl font-black text-emerald-600">{bestScore}%</div>
                      </div>
                      <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 text-sm">
                        <div className="font-semibold text-zinc-900">Average score</div>
                        <div className="mt-2 text-2xl font-black text-sky-600">{averageScore}%</div>
                      </div>
                      <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 text-sm">
                        <div className="font-semibold text-zinc-900">Last score</div>
                        <div className="mt-2 text-2xl font-black text-violet-600">{lastScore}%</div>
                        <div className="text-xs text-zinc-500 mt-1">{lastScoreText}</div>
                      </div>
                    </div>
                    <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1 mt-4">
                      {savedTests.map((t, index) => (
                        <div key={t.id || index} className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 text-sm">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <div className="font-medium">{t.id}</div>
                              <div className="text-xs text-zinc-500">{t.createdAt ? new Date(t.createdAt).toLocaleString() : 'Saved exam'}</div>
                              {t.result?.percentage !== undefined && (
                                <div className="text-xs text-zinc-500 mt-1">Score: {t.result.totalCorrect} / {t.result.totalQuestions} • {t.result.percentage}%</div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => window.open(`/test/history/${t.id}`, '_blank')}
                              className="text-xs px-3 py-1 rounded bg-amber-500 text-white"
                            >
                              Open
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-zinc-500">No exams taken yet</div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {phase === 'running' && currentQuestion && (
        <div className="space-y-6">
          <div className="rounded-[32px] border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.24em] text-zinc-500">Question</div>
                <div className="mt-2 text-2xl font-black text-zinc-950">
                  {currentIndex + 1} of {questions.length}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-full bg-amber-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
                  {currentQuestion.topic}
                </span>
                {startedAt && (
                  <span className="inline-flex items-center rounded-full bg-zinc-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-700">
                    Started {new Date(startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
                <span className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${getTimerColor(timeRemaining)}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-zinc-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-zinc-950 leading-tight">
              {currentQuestion.question}
            </h2>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {currentQuestion.options.map((option, index) => {
                const isSelected = activeAnswer?.selectedIndex === index;
                return (
                  <button
                    key={`${currentQuestion.id}-${index}`}
                    type="button"
                    disabled={!allowAnswer || !!activeAnswer}
                    onClick={() => recordAnswer(index, false)}
                    className={`option-button rounded-3xl border px-5 py-4 text-left text-sm font-medium ${
                      isSelected
                        ? 'option-selected border-yellow-400 ring-2 ring-yellow-100 text-yellow-800'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-800'
                    }`}
                    style={{ cursor: allowAnswer ? 'pointer' : 'default' }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-xs font-black text-zinc-700">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span style={{ userSelect: 'none' }}>{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-[32px] border border-zinc-200 bg-white p-6 shadow-sm sm:flex-row sm:justify-between sm:items-center">
            <div className="text-sm text-zinc-500">Progress: {currentIndex + 1} / {questions.length}</div>
            <div className="text-sm text-zinc-500 font-bold text-rose-500">Flags/Switches: {tabSwitchCount}</div>
          </div>
        </div>
      )}

      {phase === 'submitting' && (
        <div className="rounded-[32px] border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-14 text-center shadow-sm">
          <XCircle size={48} className="mx-auto text-amber-500" />
          <h2 className="mt-6 text-3xl font-semibold text-zinc-950 dark:text-amber-50">Submitting your examination</h2>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">Processing scores, validating anti-cheat locks, and generating review logs.</p>
        </div>
      )}

      {warningOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 test-page-warning-backdrop">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-zinc-900 p-8 shadow-2xl border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-3 text-amber-500">
              <ShieldAlert size={24} />
              <h3 className="text-xl font-semibold">Anti-Cheat Flag</h3>
            </div>
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300 leading-7">
              {violationMessage || 'Switching tabs or leaving the screen is strictly monitored. Continuing violations will end your exam.'}
            </p>
            <button
              type="button"
              onClick={closeWarning}
              className="mt-6 inline-flex items-center justify-center rounded-3xl bg-amber-500 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-950"
            >
              Continue examination
            </button>
          </div>
        </div>
      )}

      {terminationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 test-page-warning-backdrop">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-zinc-900 p-8 shadow-2xl border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-3 text-rose-500">
              <ShieldAlert size={24} />
              <h3 className="text-xl font-semibold">Session Terminated</h3>
            </div>
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300 leading-7">
              {violationMessage || 'Your examination session has been terminated due to security violations.'}
            </p>
            <button
              type="button"
              onClick={() => setTerminationOpen(false)}
              className="mt-6 inline-flex items-center justify-center rounded-3xl bg-amber-500 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-950"
            >
              Return to launchpad
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Examination;
