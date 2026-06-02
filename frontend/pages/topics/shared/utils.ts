/* Helper functions for quiz scoring and calculations */

export const calculateScore = (correct: number, total: number): number => {
  return Math.round((correct / total) * 100);
};

export const isPassed = (percentage: number, passingScore: number = 70): boolean => {
  return percentage >= passingScore;
};

export const getResultMessage = (percentage: number, passed: boolean): string => {
  if (passed) {
    if (percentage === 100) return "Perfect Score!";
    if (percentage >= 90) return "Excellent Work!";
    if (percentage >= 80) return "Great Job!";
    return "Passed!";
  }
  return "Keep Practicing";
};

export const getResultColor = (passed: boolean): string => {
  return passed ? "text-emerald-400" : "text-red-400";
};

export const formatPercentage = (percentage: number): string => {
  return `${percentage}%`;
};
