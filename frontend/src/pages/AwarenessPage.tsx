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
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header (RDS 2.0) */}
      <div className="p-6 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-400 shadow-sutra-glow shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              SECURITY AWARENESS & TRAINING HUB
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Interactive phishing simulation challenges, guided threat blueprints, and practical hygiene checklists
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0c121e] border border-white/10 w-fit font-mono text-xs">
        <button
          onClick={() => setActiveSubTab('quiz')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
            activeSubTab === 'quiz'
              ? 'bg-amber-500 text-slate-950 shadow-sutra-glow font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Phishing Simulator Quiz</span>
        </button>
        <button
          onClick={() => setActiveSubTab('articles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
            activeSubTab === 'articles'
              ? 'bg-amber-500 text-slate-950 shadow-sutra-glow font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Threat Education</span>
        </button>
        <button
          onClick={() => setActiveSubTab('checklists')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
            activeSubTab === 'checklists'
              ? 'bg-amber-500 text-slate-950 shadow-sutra-glow font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ListChecks className="w-4 h-4" />
          <span>Hygiene Checklists</span>
        </button>
      </div>

      {/* Sub-Tab 1: Interactive Phishing Quiz */}
      {activeSubTab === 'quiz' && (
        <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 shadow-2xl space-y-6">
          {quiz.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-mono text-xs">Loading simulator challenges...</div>
          ) : !quizCompleted ? (
            <div className="space-y-6 font-sans">
              <div className="flex justify-between items-center font-mono text-xs border-b border-white/10 pb-4">
                <span className="text-slate-400">
                  Scenario {currentQIndex + 1} of {quiz.length}
                </span>
                <span className="text-amber-400 font-bold">
                  Score: {score}/{currentQIndex + (isAnswered ? 1 : 0)}
                </span>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block">
                  Evaluate Scenario:
                </span>
                <h3 className="text-lg font-black text-white leading-relaxed">
                  {quiz[currentQIndex]?.scenario}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-3 font-mono text-xs">
                {quiz[currentQIndex]?.options.map((opt, oIdx) => {
                  const isCorrect = oIdx === quiz[currentQIndex].correct_index;
                  const isSelected = selectedOption === oIdx;

                  let btnStyle = 'bg-[#070b12] border-white/10 text-slate-300 hover:border-amber-500/40';
                  if (isAnswered) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-300 font-bold';
                    } else {
                      btnStyle = 'bg-[#030508] border-white/5 text-slate-500 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(oIdx)}
                      disabled={isAnswered}
                      className={`w-full p-4 rounded-2xl border text-left flex items-start justify-between gap-3 transition-all cursor-pointer ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                      {isAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Box */}
              {isAnswered && (
                <div className="p-4 rounded-2xl bg-[#070b12] border border-white/10 space-y-2 font-mono text-xs animate-in fade-in duration-200">
                  <span className="text-amber-400 font-bold uppercase block">Forensic Explanation:</span>
                  <p className="text-slate-300 font-sans">{quiz[currentQIndex]?.explanation}</p>
                </div>
              )}

              {/* Next Button */}
              {isAnswered && (
                <button
                  onClick={handleNextQuestion}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 shadow-sutra-glow cursor-pointer"
                >
                  <span>{currentQIndex + 1 < quiz.length ? 'NEXT SCENARIO' : 'VIEW COMPLETION REPORT'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-8 space-y-6 font-mono">
              <div className="w-16 h-16 rounded-3xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sutra-glow mx-auto">
                <Award className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">Challenge Completed!</h3>
                <p className="text-slate-400 text-xs font-sans">
                  You scored <span className="text-amber-400 font-bold">{score}</span> out of {quiz.length} on social engineering detection.
                </p>
              </div>
              <button
                onClick={resetQuiz}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs uppercase inline-flex items-center gap-2 shadow-sutra-glow cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RETRY SIMULATOR</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 2: Threat Education Articles */}
      {activeSubTab === 'articles' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
          {articles.map((art) => (
            <div
              key={art.id}
              onClick={() => setSelectedArticle(art)}
              className="p-6 rounded-3xl bg-[#0c121e] border border-white/10 hover:border-amber-500/40 transition-all space-y-4 shadow-xl cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                  {art.category}
                </span>
                <h4 className="text-base font-bold text-white leading-snug">{art.title}</h4>
                <p className="text-slate-400 text-xs leading-relaxed">{art.summary}</p>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                <span>Read Blueprint</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Sub-Tab 3: Hygiene Checklists */}
      {activeSubTab === 'checklists' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
          {checklists.map((chk) => (
            <div key={chk.id} className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border border-white/10 space-y-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white font-mono">{chk.title}</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{chk.description}</p>
              <ul className="space-y-2 pt-2 border-t border-white/10 font-mono text-xs text-slate-300">
                {chk.items.map((it: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Article Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030508]/85 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-3xl bg-[#0c121e] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl font-sans text-xs">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-amber-400 block">{selectedArticle.category}</span>
                <h3 className="text-lg font-black text-white font-mono mt-1">{selectedArticle.title}</h3>
              </div>
              <button onClick={() => setSelectedArticle(null)} className="text-slate-400 hover:text-white cursor-pointer font-mono">
                ✕
              </button>
            </div>
            <div className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap max-h-[60vh] overflow-y-auto pr-2">
              {selectedArticle.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
