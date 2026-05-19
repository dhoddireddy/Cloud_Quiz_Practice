import React from 'react';
import { useParams } from 'react-router-dom';

const TestHistory: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  let test: any = null;
  try {
    const raw = localStorage.getItem('pta_tests');
    const list = raw ? JSON.parse(raw) as any[] : [];
    test = list.find(t => t.id === id);
  } catch (e) {
    console.error(e);
  }

  if (!test) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-12">
        <div className="rounded-lg border p-8 bg-white text-center">
          <h2 className="text-2xl font-semibold">Test not found</h2>
          <p className="mt-3 text-sm text-zinc-600">No saved test matches the requested id.</p>
        </div>
      </div>
    );
  }
  // If full result is present, render per-question review similar to results page
  const result = test.result || null;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-10">
      <div className="rounded-lg border p-6 bg-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{test.id} — Review</h1>
            <p className="text-sm text-zinc-600 mt-2">Taken: {new Date(test.createdAt).toLocaleString()}</p>
          </div>
          {result && (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
                <div className="font-semibold text-zinc-950">Score</div>
                <div className="mt-2 text-xl font-black">{result.totalCorrect} / {result.totalQuestions}</div>
              </div>
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
                <div className="font-semibold text-zinc-950">Percentage</div>
                <div className="mt-2 text-xl font-black">{result.percentage}%</div>
              </div>
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
                <div className="font-semibold text-zinc-950">Wrong</div>
                <div className="mt-2 text-xl font-black">{result.totalQuestions - result.totalCorrect - result.timedOutCount}</div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 space-y-6">
          {result ? (
            result.questions.map((q: any, idx: number) => {
              const ans = result.answers[idx];
              return (
                <div key={q.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold">Question {idx + 1} • {q.topic}</div>
                    {ans && ans.timedOut && <span className="text-xs px-2 py-1 bg-rose-50 text-rose-600 rounded">Timed Out</span>}
                  </div>
                  <div className="mb-3 text-zinc-900 font-medium">{q.question}</div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {q.options.map((opt: string, i: number) => {
                      const isCorrect = i === q.correctIndex;
                      const selected = ans && ans.selectedIndex === i;
                      const className = selected ? (isCorrect ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-rose-400 bg-rose-50 text-rose-700') : (isCorrect ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-zinc-200 bg-white text-zinc-800');
                      return (
                        <div key={i} className={`p-3 rounded border ${className}`}>
                          <div className="font-medium">{String.fromCharCode(65 + i)}. {opt}</div>
                          {selected && !isCorrect && <div className="text-xs text-rose-600 mt-1">Your answer</div>}
                          {isCorrect && <div className="text-xs text-emerald-600 mt-1">Correct answer</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            // fallback: only questions list available
            test.questions.map((q: any, idx: number) => (
              <div key={q.id} className="rounded-lg border p-4">
                <div className="text-sm font-semibold">{idx + 1}. {q.topic}</div>
                <div className="mt-2 font-medium text-zinc-900">{q.question}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TestHistory;
