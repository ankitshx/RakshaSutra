import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { AwarenessArticle, QuizQuestion } from '../types';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Award,
  RotateCcw,
  ChevronRight,
  ListChecks
} from 'lucide-react';

export const AwarenessPage: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'articles' | 'quiz' | 'checklists'>('quiz');
  const [articles, setArticles] = useState<AwarenessArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<AwarenessArticle | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [checklists, setChecklists] = useState<any[]>([]);

  useEffect(() => {
    api.getArticles().then(setArticles).catch(() => {});
    api.getQuiz().then(setQuiz).catch(() => {});
    api.getChecklists().then(setChecklists).catch(() => {});
  }, []);

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    if (idx === quiz[currentQIndex].correct_index) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex + 1 < quiz.length) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            Security Awareness & Training Hub
          </h1>
        </div>
        <p className="text-sm text-slate-400 max-w-2xl">
          Empower yourself against modern cyber threats through interactive phishing simulation games, guided threat breakdowns, and practical hygiene checklists.
        </p>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 w-fit">
        <button
          onClick={() => setActiveSubTab('quiz')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'quiz'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-neon-cyan'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Phishing Simulator Quiz</span>
        </button>
        <button
          onClick={() => setActiveSubTab('articles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'articles'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-neon-cyan'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Threat Guides ({articles.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('checklists')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'checklists'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-neon-cyan'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ListChecks className="w-4 h-4" />
          <span>Security Checklists</span>
        </button>
      </div>

      {/* QUIZ TAB */}
      {activeSubTab === 'quiz' && quiz.length > 0 && (
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-cyber-border backdrop-blur-xl shadow-2xl space-y-6">
          {!quizCompleted ? (
            <>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase">
                  Scenario {currentQIndex + 1} of {quiz.length}
                </span>
                <span className="text-xs font-mono text-slate-400 font-bold">
                  Score: {score} / {currentQIndex + (isAnswered ? 1 : 0)}
                </span>
              </div>

              {/* Scenario Box */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-sm sm:text-base text-slate-100 font-medium leading-relaxed">
                {quiz[currentQIndex].scenario}
              </div>

              {/* Options */}
              <div className="space-y-3">
                {quiz[currentQIndex].options.map((opt, oIdx) => {
                  const isSelected = selectedOption === oIdx;
                  const isCorrect = oIdx === quiz[currentQIndex].correct_index;

                  let btnStyle = 'bg-slate-950 border-slate-800 text-slate-300 hover:border-cyan-500/50';
                  if (isAnswered) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-neon-emerald';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200 shadow-neon-red';
                    } else {
                      btnStyle = 'bg-slate-950 border-slate-900 text-slate-600 opacity-50';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(oIdx)}
                      disabled={isAnswered}
                      className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-start gap-3 cursor-pointer ${btnStyle}`}
                    >
                      <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {isAnswered && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      )}
                      {isAnswered && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next */}
              {isAnswered && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                    Security Explanation & Key Lesson:
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {quiz[currentQIndex].explanation}
                  </p>
                  <div className="pt-2 text-right">
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-neon-cyan transition-all cursor-pointer"
                    >
                      {currentQIndex + 1 === quiz.length ? 'View Final Results' : 'Next Scenario →'}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 space-y-6">
              <div className="w-16 h-16 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 mx-auto shadow-neon-cyan">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white font-mono">
                  Simulation Challenge Complete!
                </h3>
                <p className="text-base text-slate-300 mt-2">
                  You scored <strong className="text-cyan-400 font-mono">{score}</strong> out of{' '}
                  <strong className="text-white font-mono">{quiz.length}</strong> ({Math.round((score / quiz.length) * 100)}%)
                </p>
              </div>
              <button
                onClick={resetQuiz}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-cyan-300 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Simulator</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ARTICLES TAB */}
      {activeSubTab === 'articles' && (
        <div className="space-y-6">
          {selectedArticle ? (
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-cyber-border backdrop-blur-xl shadow-2xl space-y-6">
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
              >
                ← Back to all articles
              </button>
              <div>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30 uppercase font-bold">
                  {selectedArticle.category} • {selectedArticle.read_time_minutes} min read
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-2">
                  {selectedArticle.title}
                </h2>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line prose-invert">
                {selectedArticle.content}
              </div>
              {selectedArticle.key_takeaways && (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Key Defensive Takeaways:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-emerald-200 list-disc list-inside">
                    {selectedArticle.key_takeaways.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {articles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => setSelectedArticle(art)}
                  className="p-6 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-neon-cyan flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                      {art.category}
                    </span>
                    <h3 className="text-base font-bold text-white hover:text-cyan-400 transition-colors">
                      {art.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {art.summary}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-800 text-xs font-semibold text-cyan-400 flex items-center gap-1">
                    <span>Read Article ({art.read_time_minutes} min)</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CHECKLISTS TAB */}
      {activeSubTab === 'checklists' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {checklists.map((group, gIdx) => (
            <div
              key={gIdx}
              className="p-6 rounded-2xl bg-slate-900/80 border border-cyber-border backdrop-blur-xl shadow-xl space-y-4"
            >
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {group.category}
              </h3>
              <div className="space-y-3 text-xs text-slate-300">
                {group.items.map((item: string, iIdx: number) => (
                  <div key={iIdx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <input type="checkbox" className="mt-0.5 rounded border-slate-700 text-cyan-500 focus:ring-0" />
                    <span className="leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
