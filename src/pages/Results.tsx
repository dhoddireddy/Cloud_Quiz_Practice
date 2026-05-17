
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface QuestionItem {
  id: string;
  topic?: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface StoredResults {
  questions: QuestionItem[];
  answers: Array<{ selectedIndex: number | null; timeTaken: number; timedOut: boolean }>;
  timeTakenTotal: number;
  tabSwitches?: number;
}

const Results: React.FC = () => {
  const [results, setResults] = useState<StoredResults | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Force light mode for this page
    try {
      document.documentElement.classList.remove('dark');
      document.body.style.background = '#ffffff';
    } catch (e) {}

    // Try both storage keys (legacy and current)
    const raw = localStorage.getItem('latestTestResult') || localStorage.getItem('pta_test_results') || localStorage.getItem('latestTestResult');
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);

      // Normalize parsed result to StoredResults shape
      const questionsRaw: any[] = parsed.questions || [];
      const answersRaw: any[] = parsed.answers || [];

      const questions: QuestionItem[] = questionsRaw.map((q: any, idx: number) => {
        const options: string[] = q.options || q.Options || [];
        const correctIndex = typeof q.correctIndex === 'number' ? q.correctIndex : (options.findIndex((o) => o === (q.correct || q.correctAnswer || '')) || 0);
        return {
          id: q.id || `q_${idx}`,
          topic: q.topic || q.category || 'General',
          question: q.question || q.text || 'Untitled question',
          options: options.length ? options : ['A','B','C','D'],
          correctIndex,
        };
      });

      const normalized: StoredResults = {
        questions,
        answers: answersRaw.map(a => ({ selectedIndex: typeof a.selectedIndex === 'number' ? a.selectedIndex : (a.selected || null), timeTaken: a.timeTaken || a.timeTakenSeconds || 0, timedOut: !!a.timedOut })),
        timeTakenTotal: parsed.timeTakenSeconds || parsed.timeTakenTotal || 0,
        tabSwitches: parsed.tabSwitchCount || parsed.tabSwitches || 0,
      };

      setResults(normalized);
    } catch (e) {
      console.error('Failed to parse test results', e);
    }
  }, []);

  if (!results) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-12">
        <div className="rounded-[16px] border border-zinc-200 bg-white p-8 text-center">
          <h2 className="text-2xl font-semibold">No results found</h2>
          <p className="mt-3 text-sm text-zinc-600">Take the test first or restore results from localStorage.</p>
          <div className="mt-6">
            <button onClick={() => navigate('/test')} className="px-4 py-2 bg-amber-500 text-white rounded-lg">Go to Test</button>
          </div>
        </div>
      </div>
    );
  }

  const total = results.questions.length;
  const correctCount = results.questions.reduce((acc, q, idx) => {
    const ans = results.answers[idx];
    if (ans && ans.selectedIndex !== null && ans.selectedIndex === q.correctIndex) return acc + 1;
    return acc;
  }, 0);

  const timedOutCount = results.answers.filter(a => a.timedOut).length;
  const tabSwitches = results.tabSwitches || 0;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-10">
      <div className="rounded-[16px] border border-zinc-200 bg-white p-6 shadow">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black">{correctCount} / {total} <span className="text-sm font-medium">({Math.round((correctCount/total)*100)}%)</span></h1>
            <div className="mt-2 text-sm text-zinc-600">Time used: {Math.ceil(results.timeTakenTotal/1000)}s • Tab switches: {tabSwitches} • Timed out: {timedOutCount}</div>
          </div>
          <div className="space-x-2">
            <button onClick={() => {
              localStorage.removeItem('pta_test_results');
              navigate('/test');
            }} className="px-4 py-2 rounded bg-zinc-100">Retake Test</button>
            <button onClick={() => navigate('/')} className="px-4 py-2 rounded bg-amber-500 text-white">Go to Dashboard</button>
          </div>
        </div>

        <hr className="my-6" />

        {/* Per-topic breakdown chart */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Per-topic Breakdown</h2>
          {(() => {
            // try to obtain per-topic data from stored raw or compute from questions+answers
            const raw = localStorage.getItem('latestTestResult') || localStorage.getItem('pta_test_results');
            let perTopicMap: Record<string, { correct: number; total: number }> = {};
            if (raw) {
              try {
                const parsed = JSON.parse(raw);
                if (parsed.perTopic) {
                  Object.entries(parsed.perTopic).forEach(([k, v]: any) => {
                    perTopicMap[k] = { correct: v.correct || 0, total: v.total || 0 };
                  });
                } else {
                  // compute from results.questions + results.answers
                  results.questions.forEach((q, idx) => {
                    const a = results.answers[idx];
                    if (!perTopicMap[q.topic]) perTopicMap[q.topic] = { correct: 0, total: 0 };
                    perTopicMap[q.topic].total += 1;
                    if (a && a.selectedIndex !== null && a.selectedIndex === q.correctIndex) perTopicMap[q.topic].correct += 1;
                  });
                }
              } catch {}
            }

            const chartData = Object.entries(perTopicMap).map(([topic, v]) => ({ topic, percentage: v.total === 0 ? 0 : Math.round((v.correct / v.total) * 100) }));
            const colors = ['#10b981', '#f59e0b', '#f97316', '#ef4444', '#60a5fa', '#a78bfa'];
            if (chartData.length === 0) return <div className="text-sm text-zinc-500">No per-topic data available.</div>;
            return (
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 40 }}>
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="topic" type="category" width={160} />
                    <Tooltip formatter={(value: any) => `${value}%`} />
                    <Bar dataKey="percentage">
                      {chartData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            );
          })()}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Question Review — Correct Answers Only</h2>
          <div className="space-y-6">
            {results.questions.map((q, idx) => (
              <div key={q.id || idx} className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold text-zinc-700">Question {idx + 1} • {q.topic || 'General'}</div>
                </div>
                <div className="mb-3 text-zinc-900 font-medium">{q.question}</div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {q.options.map((opt, i) => {
                    const isCorrect = i === q.correctIndex;
                    return (
                      <div key={i} className={`p-3 rounded border ${isCorrect ? 'bg-green-50 border-green-300' : 'bg-white border-zinc-200'}`}>
                        <div className={`font-medium ${isCorrect ? 'text-green-800' : 'text-zinc-800'}`}>{String.fromCharCode(65 + i)}. {opt}</div>
                      </div>
                    );
                  })}
                </div>

                {/* explanations intentionally hidden — only correct answers shown */}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Results;
