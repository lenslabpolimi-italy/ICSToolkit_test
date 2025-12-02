export type EvaluationLevel = 'Poor' | 'Mediocre' | 'Good' | 'Excellent' | 'N/A' | 'Yes' | 'Partially' | 'No';
export type ChecklistLevel = 'Simplified' | 'Normal' | 'Detailed';
export type ConceptType = 'A' | 'B';
export type PriorityLevel = 'None' | 'Low' | 'Medium' | 'High';

export interface Guideline {
  id: string;
  text: string;
}

export interface SubStrategy {
  id: string;
  name: string;
  description: string;
  guidelines: Guideline[];
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  subStrategies: SubStrategy[];
}

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
        answer: string; // Text answer for sub-strategy
      };
    };
  };
}

export interface EcoIdea {
  id: string;
  strategyId: string;
  text: string;
  isConfirmed: boolean;
  x?: number; // Added for draggable notes
  y?: number; // Added for draggable notes
}

export interface EvaluationChecklistData {
  A: {
    level: ChecklistLevel;
    strategies: { [strategyId: string]: EvaluationLevel };
    subStrategies: { [subStrategyId: string]: EvaluationLevel };
    guidelines: { [guidelineId: string]: EvaluationLevel };
  };
  B: {
    level: ChecklistLevel;
    strategies: { [strategyId: string]: EvaluationLevel };
    subStrategies: { [subStrategyId: string]: EvaluationLevel };
    guidelines: { [guidelineId: string]: EvaluationLevel };
  };
}

export interface RadarChartData {
  A: { [strategyId: string]: number };
  B: { [strategyId: string]: number };
}

export interface RadarInsight {
  strategyId: string;
  text: string;
}

export interface EvaluationNote {
  id: string;
  strategyId: string;
  subStrategyId?: string;
  guidelineId?: string;
  text: string;
  concept: ConceptType;
}