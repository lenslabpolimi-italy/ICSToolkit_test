export interface Guideline {
  id: string;
  name: string;
}

export interface SubStrategy {
  id: string;
  name: string;
  guidelines: Guideline[];
}

export interface Strategy {
  id: string;
  name: string;
  subStrategies: SubStrategy[];
}

export type PriorityLevel = 'High' | 'Mid' | 'Low' | 'None';
export type EvaluationLevel = 'Excellent' | 'Good' | 'Mediocre' | 'Poor' | 'N/A' | 'Yes' | 'Partially' | 'No'; // Added Yes, Partially, No

export interface ProjectData {
  projectName: string;
  company: string;
  designer: string;
  functionalUnit: string;
  descriptionExistingProduct: string;
}

export interface QualitativeEvaluationData {
  [strategyId: string]: {
    priority: PriorityLevel;
    subStrategies: {
      [subStrategyId: string]: {
        priority: PriorityLevel;
        answer: string;
      };
    };
  };
}

export interface EcoIdea {
  id: string;
  text: string;
  strategyId: string;
  subStrategyId?: string;
  guidelineId?: string;
  x: number; // Added for position
  y: number; // Added for position
  isConfirmed: boolean; // NEW: Added to track if the idea is confirmed
  conceptType: ConceptType; // NEW: Added to link idea to a concept
}

export type ChecklistLevel = 'Simplified' | 'Normal' | 'Detailed';
export type ConceptType = 'A' | 'B';

export interface EvaluationChecklistData {
  [concept: string]: {
    level: ChecklistLevel;
    strategies: {
      [strategyId: string]: EvaluationLevel;
    };
    subStrategies: {
      [subStrategyId: string]: EvaluationLevel;
    };
    guidelines: {
      [guidelineId: string]: EvaluationLevel;
    };
  };
}

export interface RadarChartData {
  [concept: string]: {
    [strategyId: string]: number; // 0-4 for Poor to Excellent
  };
}

export interface RadarInsight {
  strategyId: string;
  text: string;
}

export interface EvaluationNote { // NEW: Interface for evaluation notes
  id: string;
  text: string;
  strategyId: string;
  conceptType: ConceptType;
  x: number;
  y: number;
}