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
  radarInsights: { [strategyId: string]: string };
  setRadarInsights: React.Dispatch<React.SetStateAction<{ [strategyId: string]: string }>>;
  evaluationNotes: EvaluationNote[];
  setEvaluationNotes: React.Dispatch<React.SetStateAction<EvaluationNote[]>>;
  radarEcoIdeas: EcoIdea[];
  setRadarEcoIdeas: React.Dispatch<React.SetStateAction<EcoIdea[]>>;
  resetSection: (section: string) => void;
  getStrategyById: (id: string) => Strategy | undefined;
  getSubStrategyById: (strategyId: string, subStrategyId: string) => SubStrategy | undefined;
  getGuidelineById: (subStrategyId: string, guidelineId: string) => Guideline | undefined;
  updateEcoIdea: (id: string, updates: Partial<EcoIdea>) => void;
  deleteEcoIdea: (id: string) => void;
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
const initialRadarInsights: { [strategyId: string]: string } = {};
const initialEvaluationNotes: EvaluationNote[] = [];
const initialRadarEcoIdeas: EcoIdea[] = [];

export const LcdProvider = ({ children }: { children: ReactNode }) => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [projectData, setProjectData] = useState<ProjectData>(initialProjectData);
  const [qualitativeEvaluation, setQualitativeEvaluation] = useState<QualitativeEvaluationData>(initialQualitativeEvaluation);
  const [ecoIdeas, setEcoIdeas] = useState<EcoIdea[]>(initialEcoIdeas);
  const [evaluationChecklists, setEvaluationChecklists] = useState<EvaluationChecklistData>(initialEvaluationChecklists);
  const [radarChartData, setRadarChartData] = useState<RadarChartData>(initialRadarChartData);
  const [radarInsights, setRadarInsights] = useState<{ [strategyId: string]: string }>(initialRadarInsights);
  const [evaluationNotes, setEvaluationNotes] = useState<EvaluationNote[]>(initialEvaluationNotes);
  const [radarEcoIdeas, setRadarEcoIdeas] = useState<EcoIdea[]>(initialRadarEcoIdeas);

  useEffect(() => {
    const loadStrategies = async () => {
      const parsedStrategies = await parseLcdStrategies('/LCD-strategies.txt');
      setStrategies(parsedStrategies);

      // Initialize qualitative evaluation, radar data, and radar insights based on parsed strategies
      const initialQualitative: QualitativeEvaluationData = {};
      const initialRadar: RadarChartData = { A: {}, B: {} };
      const initialInsights: { [strategyId: string]: string } = {};

      // Filter out Strategy 7 for these initializations
      const strategiesForRadarAndQualitative = parsedStrategies.filter(s => s.id !== '7');

      strategiesForRadarAndQualitative.forEach(strategy => {
        initialQualitative[strategy.id] = { priority: 'None', subStrategies: {} };
        strategy.subStrategies.forEach(sub => {
          initialQualitative[strategy.id].subStrategies[sub.id] = { priority: 'None', answer: '' };
        });
        initialRadar.A[strategy.id] = 0; // Default to Poor
        initialRadar.B[strategy.id] = 0; // Default to Poor
        initialInsights[strategy.id] = '';
      });
      setQualitativeEvaluation(initialQualitative);
      setRadarChartData(initialRadar);
      setRadarInsights(initialInsights);
    };
    loadStrategies();
  }, []);

  const updateEcoIdea = (id: string, updates: Partial<EcoIdea>) => {
    setEcoIdeas(prev =>
      prev.map(idea => (idea.id === id ? { ...idea, ...updates } : idea))
    );
  };

  const deleteEcoIdea = (id: string) => {
    setEcoIdeas(prev => prev.filter(idea => idea.id !== id));
  };

  useEffect(() => {
    const confirmedEcoIdeas = ecoIdeas.filter(idea => idea.isConfirmed);

    setRadarEcoIdeas(prevRadarEcoIdeas => {
      const nextRadarEcoIdeas: EcoIdea[] = [];
      const prevRadarEcoIdeasMap = new Map(prevRadarEcoIdeas.map(idea => [idea.id, idea]));

      confirmedEcoIdeas.forEach(confirmedIdea => {
        // Only include confirmed ideas that are not Strategy 7
        if (confirmedIdea.strategyId === '7') return;

        const existingRadarIdea = prevRadarEcoIdeasMap.get(confirmedIdea.id);
        if (existingRadarIdea) {
          nextRadarEcoIdeas.push({
            ...existingRadarIdea,
            text: confirmedIdea.text,
            isConfirmed: confirmedIdea.isConfirmed,
          });
        } else {
          // Add random offset for new radar eco ideas
          const offsetX = Math.floor(Math.random() * 100); // Smaller offset for radar to keep them somewhat central
          const offsetY = Math.floor(Math.random() * 100);
          nextRadarEcoIdeas.push({
            ...confirmedIdea,
            x: 20 + offsetX,
            y: 20 + offsetY,
          });
        }
      });
      return nextRadarEcoIdeas;
    });
  }, [ecoIdeas]);

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
        // Filter out Strategy 7 for reset
        strategies.filter(s => s.id !== '7').forEach(strategy => {
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
        const resetInsights: { [strategyId: string]: string } = {};
        // Filter out Strategy 7 for reset
        strategies.filter(s => s.id !== '7').forEach(strategy => {
          resetRadar.A[strategy.id] = 0;
          resetRadar.B[strategy.id] = 0;
          resetInsights[strategy.id] = '';
        });
        setRadarChartData(resetRadar);
        setRadarInsights(resetInsights);
        setRadarEcoIdeas(initialRadarEcoIdeas);
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
        radarInsights,
        setRadarInsights,
        evaluationNotes,
        setEvaluationNotes,
        radarEcoIdeas,
        setRadarEcoIdeas,
        resetSection,
        getStrategyById,
        getSubStrategyById,
        getGuidelineById,
        updateEcoIdea,
        deleteEcoIdea,
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