/* Shared interfaces for the learning platform */

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  timestamp: Date;
  answers: number[];
}

export interface Module {
  id: number;
  title: string;
  description: string;
  content: string;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  icon?: string;
}

export interface TopicConfig {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
}
