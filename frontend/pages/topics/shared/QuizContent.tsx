// Quiz content and scoring

import React, { useState, useEffect } from "react";
import { QuizQuestion, QuizResult } from "./types";
import { calculateScore, isPassed, getResultMessage, getResultColor } from "./utils";

interface QuizContentProps {
  questions: QuizQuestion[];
  onComplete: (result: QuizResult) => void;
}

export default function QuizContent({ questions, onComplete }: QuizContentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(
    Array(questions.length).fill(-1)
  );
  const [showResult, setShowResult] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = () => {
    // calculate score
    let correctCount = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === questions[index].correctAnswer) {
        correctCount++;
      }
    });

    const percentage = calculateScore(correctCount, questions.length);
    const passed = isPassed(percentage);

    const result: QuizResult = {
      score: correctCount,
      totalQuestions: questions.length,
      percentage,
      passed,
      timestamp: new Date(),
      answers: selectedAnswers,
    };

    setQuizResult(result);
    setShowResult(true);
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers(Array(questions.length).fill(-1));
    setShowResult(false);
    setQuizResult(null);
  };

  if (showResult && quizResult) {
    return (
      <div className="relative space-y-8">
        {/* results */}
        <div className="text-center space-y-8">
          {/* score */}
          <div>
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-2xl bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-400/30 mb-6">
              <span className={`text-5xl font-bold ${
                quizResult.passed ? "text-cyan-600 dark:text-cyan-400" : "text-orange-600 dark:text-orange-400"
              }`}>
                {quizResult.percentage}%
              </span>
            </div>
            <h2 className="text-3xl font-bold text-(--text-primary) mb-2">
              {getResultMessage(quizResult.percentage, quizResult.passed)}
            </h2>
            <p className="text-(--text-secondary) text-lg">
              You got {quizResult.score} out of {quizResult.totalQuestions} questions correct
            </p>
          </div>

          {/* status */}
          <div className={`rounded-xl px-6 py-4 border ${
            quizResult.passed
              ? "bg-emerald-100 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-400/30 text-emerald-700 dark:text-emerald-300"
              : "bg-orange-100 dark:bg-orange-500/10 border-orange-300 dark:border-orange-400/30 text-orange-700 dark:text-orange-300"
          }`}>
            {quizResult.passed ? (
              <p className="font-medium">Congratulations! You&rsquo;ve passed this topic. You can retake the quiz anytime to improve your score.</p>
            ) : (
              <p className="font-medium">You need 70% to pass. Don&rsquo;t worry, practice makes perfect — retake the quiz anytime.</p>
            )}
          </div>

          {/* retake */}
          <button
            onClick={handleRetakeQuiz}
            className="px-8 py-3 text-lg font-semibold text-white bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl transition-all duration-200 shadow-lg shadow-cyan-500/20"
          >
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const isAnswered = selectedAnswers[currentQuestion] !== -1;
  const answered = selectedAnswers[currentQuestion];

  return (
    <div className="relative space-y-8">
      {/* header */}
      <div className="pb-6 border-b border-slate-200 dark:border-white/5">
        {/* progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-mono text-sm uppercase tracking-[0.3em] text-(--text-muted)">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">
              {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-cyan-500 to-blue-500 transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* question */}
      <div className="space-y-6">
        <h3 className="text-2xl md:text-3xl font-bold text-(--text-primary) leading-tight">{question.question}</h3>

        {/* options */}
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                answered === index
                  ? "border-cyan-400 dark:border-cyan-400/60 bg-cyan-100 dark:bg-cyan-500/15 text-slate-900 dark:text-(--text-primary)"
                  : "border-slate-300 dark:border-white/5 bg-slate-50 dark:bg-black/20 text-slate-700 dark:text-(--text-secondary) hover:border-cyan-400 dark:hover:border-cyan-400/30 hover:bg-slate-100 dark:hover:bg-white/15"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  answered === index
                    ? "border-cyan-400 dark:border-cyan-400 bg-cyan-400/20 dark:bg-cyan-400/20"
                    : "border-slate-400 dark:border-white/20"
                }`}>
                  {answered === index && (
                    <div className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400" />
                  )}
                </div>
                <span className="font-medium">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-white/5">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="px-6 py-2.5 text-sm font-medium text-slate-700 dark:text-(--text-secondary) bg-slate-100 dark:bg-black/20 border border-slate-300 dark:border-white/5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          ← Previous
        </button>

        <span className="text-sm font-medium text-(--text-muted)">
          {currentQuestion + 1} / {questions.length}
        </span>

        {currentQuestion === questions.length - 1 ? (
          <button
            onClick={handleSubmitQuiz}
            disabled={!isAnswered}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-cyan-500/20"
          >
            Submit Quiz →
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!isAnswered}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-cyan-500/20"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
