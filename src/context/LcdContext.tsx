"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Strategy,
  SubStrategy,
  Guideline,
  ProjectData,
  QualitativeEvaluationData,
  EcoIdea,
  EvaluationChecklistData,
  RadarChartData,
  PriorityLevel,
  EvaluationLevel,
  ChecklistLevel,
  ConceptType,
  RadarInsight,
  EvaluationNote,
} from '@/types/lcd';
import { parseLcdStrategies } from '@/utils/lcdParser';

interface LcdContextType {
  strategies: Strategy[];
  projectData: ProjectData;
  setProjectData: (data: ProjectData) => void;
  qualitativeEvaluation: QualitativeEvaluationData;
  setQualitativeEvaluation: (data: QualitativeEvaluationData) => void;
  ecoIdeas: EcoIdea[];
  setEcoIdeas: (ideas: EcoIdea[]) => void;
  evaluationChecklists: EvaluationChecklistData;
  setEvaluationChecklists: (data: EvaluationChecklistData) => void;
  radarChartData: RadarChartData;
  setRadarChartData: (data: RadarChartData) => void;
  // radarInsights: { [strategyId: string]: string }; // Removed
  // setRadarInsights: React.Dispatch<React.SetStateAction<{ [strategyId: string]: string }>>; // Removed
  evaluationNotes: EvaluationNote[];
  setEvaluationNotes: React.Dispatch<React.SetStateAction<EvaluationNote[]>>;
  resetSection: (section: string) => void;
  getStrategyById: (id: string) => Strategy | undefined;
  getSubStrategyById: (strategyId: string, subStrategyId: string) => SubStrategy | undefined;
  getGuidelineById: (subStrategyId: string, guidelineId: string) => Guideline | undefined;
}

const LcdContext = createContext<LcdContextType | undefined>(undefined);

const initialProjectData: ProjectData = {
  projectName: '',
  company: '',
  designer: '',
  functionalUnit: '',
  descriptionExistingProduct: '',
};

const initialQualitativeEvaluation: QualitativeEvaluationData = {};
const initialEcoIdeas: EcoIdea[] = [];
const initialEvaluationChecklists: EvaluationChecklistData = {
  A: { level: 'Simplified', strategies: {}, subStrategies: {}, guidelines: {} },
  B: { level: 'Simplified', strategies: {}, subStrategies: {}, guidelines: {} },
};
const initialRadarChartData: RadarChartData = {
  A: {},
  B: {},
};
// const initialRadarInsights: { [strategyId: string]: string } = {}; // Removed
const initialEvaluationNotes: EvaluationNote[] = [];

export const LcdProvider = ({ children }: { ReactNode }) => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [projectData, setProjectData] = useState<ProjectData>(initialProjectData);
  const [qualitativeEvaluation, setQualitativeEvaluation] = useState<QualitativeEvaluationData>(initialQualitativeEvaluation);
  const [ecoIdeas, setEcoIdeas] = useState<EcoIdea[]>(initialEcoIdeas);
  const [evaluationChecklists, setEvaluationChecklists] = useState<EvaluationChecklistData>(initialEvaluationChecklists);
  const [radarChartData, setRadarChartData] = useState<RadarChartData>(initialRadarChartData);
  // const [radarInsights, setRadarInsights] = useState<{ [strategyId: string]: string }>(initialRadarInsights); // Removed
  const [evaluationNotes, setEvaluationNotes] = useState<EvaluationNote[]>(initialEvaluationNotes);

  useEffect(() => {
    const loadStrategies = async () => {
      const parsedStrategies = await parseLcdStrategies('/LCD-strategies.txt');
      setStrategies(parsedStrategies);

      // Initialize qualitative evaluation, radar data, and radar insights based on parsed strategies
      const initialQualitative: QualitativeEvaluationData = {};
      const initialRadar: RadarChartData = { A: {}, B: {} };
      // const initialInsights: { [strategyId: string]: string } = {}; // Removed
      parsedStrategies.forEach(strategy => {
        initialQualitative[strategy.id] = { priority: 'None', subStrategies: {} };
        strategy.subStrategies.forEach(sub => {
          initialQualitative[strategy.id].subStrategies[sub.id] = { priority: 'None', answer: '' };
        });
        initialRadar.A[strategy.id] = 0;
        initialRadar.B[strategy.id] = 0;
        // initialInsights[strategy.id] = ''; // Removed
      });
      setQualitativeEvaluation(initialQualitative);
      setRadarChartData(initialRadar);
      // setRadarInsights(initialInsights); // Removed
    };
    loadStrategies();
  }, []);

  // Helper functions to get strategy/sub-strategy/guideline by ID
  const getStrategyById = (id: string) => strategies.find(s => s.id === id);
  const getSubStrategyById = (strategyId: string, subStrategyId: string) => {
    const strategy = getStrategyById(strategyId);
    return strategy?.subStrategies.find(ss => ss.id === subStrategyId);
  };
  const getGuidelineById = (subStrategyId: string, guidelineId: string) => {
    for (const strategy of strategies) {
      for (const subStrategy of strategy.subStrategies) {
        if (subStrategy.id === subStrategyId) {
          return subStrategy.guidelines.find(g => g.id === guidelineId);
        }
      }
    }
    return undefined;
  };


  const resetSection = (section: string) => {
    switch (section) {
      case 'projectData':
        setProjectData(initialProjectData);
        break;
      case 'qualitativeEvaluation':
        const resetQualitative: QualitativeEvaluationData = {};
        strategies.forEach(strategy => {
          resetQualitative[strategy.id] = { priority: 'None', subStrategies: {} };
          strategy.subStrategies.forEach(sub => {
            resetQualitative[strategy.id].subStrategies[sub.id] = { priority: 'None', answer: '' };
          });
        });
        setQualitativeEvaluation(resetQualitative);
        break;
      case 'ecoIdeas':
        setEcoIdeas(initialEcoIdeas);
        break;
      case 'evaluationChecklists':
        setEvaluationChecklists(initialEvaluationChecklists);
        break;
      case 'radarChart':
        const resetRadar: RadarChartData = { A: {}, B: {} };
        // const resetInsights: { [strategyId: string]: string } = {}; // Removed
        strategies.forEach(strategy => {
          resetRadar.A[strategy.id] = 0;
          resetRadar.B[strategy.id] = 0;
          // resetInsights[strategy.id] = ''; // Removed
        });
        setRadarChartData(resetRadar);
        // setRadarInsights(resetInsights); // Removed
        break;
      case 'evaluationNotes':
        setEvaluationNotes(initialEvaluationNotes);
        break;
      default:
        console.warn(`Unknown section to reset: ${section}`);
    }
  };

  return (
    <LcdContext.Provider
      value={{
        strategies,
        projectData,
        setProjectData,
        qualitativeEvaluation,
        setQualitativeEvaluation,
        ecoIdeas,
        setEcoIdeas,
        evaluationChecklists,
        setEvaluationChecklists,
        radarChartData,
        setRadarChartData,
        // radarInsights, // Removed
        // setRadarInsights, // Removed
        evaluationNotes,
        setEvaluationNotes,
        resetSection,
        getStrategyById,
        getSubStrategyById,
        getGuidelineById,
      }}
    >
      {children}
    </LcdContext.Provider>
  );
};

export const useLcd = () => {
  const context = useContext(LcdContext);
  if (context === undefined) {
    throw new Error('useLcd must be used within an LcdProvider');
  }
  return context;
};