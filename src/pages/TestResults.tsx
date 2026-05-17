import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Repeat, Home, Clock3, ShieldCheck } from 'lucide-react';
import { TestResult } from '../data/questions';

const RESULT_STORAGE_KEY = 'latestTestResult';

const gradeBadge = (percentage: number) => {
  if (percentage >= 85) return { label: 'A', className: 'bg-emerald-500 text-white' };
  if (percentage >= 70) return { label: 'B', className: 'bg-amber-500 text-zinc-950' };
  if (percentage >= 50) return { label: 'C', className: 'bg-orange-500 text-white' };
  return { label: 'F', className: 'bg-rose-500 text-white' };
};

const pieColors = ['#f59e0b', '#10b981', '#38bdf8', '#8b5cf6', '#ef4444', '#0ea5e9', '#f97316', '#22c55e'];

const TestResults: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stored = localStorage.getItem(RESULT_STORAGE_KEY);
  const stateResult = (location.state as { result?: TestResult })?.result;
  const result = stateResult || (stored ? (JSON.parse(stored) as TestResult) : null);

  const topicData = useMemo(() => {
    if (!result) return [];
    return Object.values(result.perTopic).map(topic => ({
      name: topic.name,
      percentage: topic.percentage,
      correct: topic.correct,
      wrong: topic.wrong,
      timedOut: topic.timedOut,
      total: topic.total,
    }));
  }, [result]);

  const wrongCount = result ? result.totalQuestions - result.totalCorrect - result.timedOutCount : 0;
  const timeUsed = result ? `${Math.floor(result.timeTakenSeconds / 60)}m ${result.timeTakenSeconds % 60}s` : '';

  const grade = result ? gradeBadge(result.percentage) : { label: '-', className: 'bg-zinc-300 text-zinc-700' };

  if (!result) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-10">
        <div className="rounded-[32px] border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-10 text-center shadow-sm">
          <h1 className="text-3xl font-semibold text-zinc-950 dark:text-amber-50">No test results found</h1>
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">Start a new test to see performance, review questions, and track your progress.</p>
          <button
            type="button"
            onClick={() => navigate('/test')}
            className="mt-6 inline-flex items-center gap-2 rounded-3xl bg-amber-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-950"
          >
            Start Test
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-10 space-y-8">
      <div className="rounded-[32px] border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-10 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-amber-500">
              <ShieldCheck size={20} />
              Test Results
            </div>
            <h1 className="mt-4 text-4xl font-black text-zinc-950 dark:text-amber-50">You scored {result.totalCorrect} / {result.totalQuestions}</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{result.percentage}% accuracy across all topics</p>
          </div>
          <div className={`inline-flex items-center gap-3 rounded-3xl px-5 py-3 text-sm font-black ${grade.className}`}>
            <span>Grade</span>
            <span>{grade.label}</span>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Time used</p>
            <p className="mt-3 text-2xl font-bold text-zinc-950 dark:text-amber-50"><span className="align-middle"><Clock3 size={18} /></span> {timeUsed}</p>
          </div>
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Correct answers</p>
            <p className="mt-3 text-2xl font-bold text-zinc-950 dark:text-amber-50">{result.totalCorrect}</p>
          </div>
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Mistakes</p>
            <p className="mt-3 text-2xl font-bold text-zinc-950 dark:text-amber-50">{wrongCount}</p>
          </div>
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">Timed out</p>
            <p className="mt-3 text-2xl font-bold text-zinc-950 dark:text-amber-50">{result.timedOutCount}</p>
          </div>
        </div>

        {result.terminatedReason && (
          <div className="mt-6 rounded-3xl border border-rose-400 bg-rose-50 p-5 text-sm text-rose-700">
            <strong>Termination note:</strong> {result.terminatedReason}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-zinc-950 dark:text-amber-50">Question Review</h2>
          <div className="mt-6 space-y-4">
            {result.questions.map((question, index) => {
              const answer = result.answers.find(item => item.questionId === question.id);
              const correctText = question.options[question.correctIndex];
              return (
                <div key={question.id} className="rounded-3xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Question {index + 1}</div>
                      <div className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">{question.topic}</div>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {answer?.timedOut ? 'Timed Out' : answer?.correct ? 'Correct' : 'Wrong'}
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-zinc-900 dark:text-zinc-100">{question.question}</p>

                  <div className="mt-4 grid gap-2">
                    {question.options.map((option, optionIndex) => {
                      const isSelected = answer?.selectedIndex === optionIndex;
                      const isCorrectOption = optionIndex === question.correctIndex;
                      return (
                        <div
                          key={`${question.id}-option-${optionIndex}`}
                          className={`rounded-2xl border px-4 py-3 text-sm ${
                            isCorrectOption
                              ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                              : isSelected
                              ? 'border-rose-400 bg-rose-50 text-rose-700'
                              : 'border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300'
                          }`}
                        >
                          <span className="font-semibold mr-2">{String.fromCharCode(65 + optionIndex)}.</span>
                          {option}
                        </div>
                      );
                    })}
                  </div>

                  <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400"><strong>Explanation:</strong> {question.explanation}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-zinc-950 dark:text-amber-50">Per-Topic Breakdown</h2>
            <div className="mt-6 space-y-4">
              {topicData.map(topic => (
                <div key={topic.name} className="rounded-3xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-950 dark:text-amber-50">{topic.name}</h3>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {topic.correct} correct · {topic.wrong} wrong · {topic.timedOut} timed out · {topic.total} total
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-zinc-950 dark:text-amber-50">{topic.percentage}%</div>
                  </div>

                  <div className="mt-4 h-3 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                    <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${topic.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-zinc-950 dark:text-amber-50">Mastery Chart</h2>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Visualize your topic performance and identify strong areas faster.</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800">Accuracy by topic</span>
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.95fr]">
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-950">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={topicData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value: any) => (value !== undefined ? `${value}%` : '')} />
                    <Bar dataKey="percentage" fill="#f59e0b" radius={[12, 12, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="max-h-72 overflow-y-auto rounded-3xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-950">
                <h3 className="text-base font-semibold text-zinc-950 dark:text-amber-50 mb-4">Topic Legend</h3>
                <div className="space-y-3">
                  {topicData.map((topic, index) => (
                    <div key={topic.name} className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-3 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-900">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: pieColors[index % pieColors.length] }} />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-zinc-950 dark:text-amber-50">{topic.name}</div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">{topic.correct} correct • {topic.wrong} wrong • {topic.timedOut} timed out • {topic.total} total</div>
                      </div>
                      <div className="text-sm font-semibold text-zinc-950 dark:text-amber-50">{topic.percentage}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-zinc-950 dark:text-amber-50">Next steps</h2>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem(RESULT_STORAGE_KEY);
                  navigate('/test');
                }}
                className="inline-flex items-center justify-center gap-2 rounded-3xl bg-amber-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-950"
              >
                <Repeat size={18} />
                Retake Test
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center justify-center gap-2 rounded-3xl border border-zinc-200 px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-950 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                <Home size={18} />
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResults;
