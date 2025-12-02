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
  updateRadarEcoIdeaText: (id: string, newText: string) => void;
  updateRadarEcoIdeaPosition: (id: string, x: number, y: number) => void; // NEW: Function to update position
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
const initialRadarInsights: { [strategyId: string]: string } = {};
const initialEvaluationNotes: EvaluationNote[] = [];
const initialRadarEcoIdeas: EcoIdea[] = [];

export const LcdProvider = ({ children }: { ReactNode }) => {
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
      parsedStrategies.forEach(strategy => {
        initialQualitative[strategy.id] = { priority: 'None', subStrategies: {} };
        strategy.subStrategies.forEach(sub => {
          initialQualitative[strategy.id].subStrategies[sub.id] = { priority: 'None', answer: '' }; // Initialize answer field
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

  // Effect to synchronize radarEcoIdeas with all confirmed ecoIdeas
  useEffect(() => {
    const confirmedEcoIdeas = ecoIdeas.filter(
      (idea) => idea.isConfirmed
    );

    setRadarEcoIdeas(prevRadarEcoIdeas => {
      const nextRadarEcoIdeas = [];
      const prevRadarEcoIdeasMap = new Map(prevRadarEcoIdeas.map(idea => [idea.id, idea]));

      confirmedEcoIdeas.forEach(confirmedIdea => {
        const existingRadarIdea = prevRadarEcoIdeasMap.get(confirmedIdea.id);
        if (existingRadarIdea) {
          // If the idea already exists in radarEcoIdeas, keep its current state (including edits and position)
          nextRadarEcoIdeas.push(existingRadarIdea);
        } else {
          // If it's a new confirmed idea, add a deep copy with default position
          nextRadarEcoIdeas.push({ ...confirmedIdea, x: 20, y: 20 }); // Default position for new radar notes
        }
      });
      return nextRadarEcoIdeas;
    });
  }, [ecoIdeas, setRadarEcoIdeas]); // Re-run when original ecoIdeas change

  // Function to update the text of an eco-idea specifically in the radarEcoIdeas state
  const updateRadarEcoIdeaText = (id: string, newText: string) => {
    setRadarEcoIdeas(prev =>
      prev.map(idea => (idea.id === id ? { ...idea, text: newText } : idea))
    );
  };

  // NEW: Function to update the position of an eco-idea specifically in the radarEcoIdeas state
  const updateRadarEcoIdeaPosition = (id: string, x: number, y: number) => {
    setRadarEcoIdeas(prev =>
      prev.map(idea => (idea.id === id ? { ...idea, x, y } : idea))
    );
  };

  // Helper functions to get strategy/sub-strategy/guideline by ID
  const getStrategyById = (id: string) => strategies.find(s => s.id === id);
  const getSubStrategyById = (strategyId: string, subStrategyId: string) => {
    const strategy = getStrategyById(strategyId);
    return strategy?.subStrategies.find(ss => ss.id === subStrategyId);
  };
  const getGuidelineById = (subStrategyId: string, guidelineId: string) => {
    // This assumes guidelineId is unique across all guidelines, or at least within a sub-strategy
    // For now, let's find it by iterating through all sub-strategies
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
            resetQualitative[strategy.id].subStrategies[sub.id] = { priority: 'None', answer: '' }; // Reset answer field
          });
        });
        setQualitativeEvaluation(resetQualitative);
        break;
      case 'ecoIdeas':
        setEcoIdeas(initialEcoIdeas); // Resets to an empty array, clearing all notes
        break;
      case 'evaluationChecklists':
        setEvaluationChecklists(initialEvaluationChecklists);
        break;
      case 'radarChart':
        const resetRadar: RadarChartData = { A: {}, B: {} };
        const resetInsights: { [strategyId: string]: string } = {};
        strategies.forEach(strategy => {
          resetRadar.A[strategy.id] = 0;
          resetRadar.B[strategy.id] = 0;
          resetInsights[strategy.id] = '';
        });
        setRadarChartData(resetRadar);
        setRadarInsights(initialRadarInsights); // Reset insights to initial empty state
        setRadarEcoIdeas(initialRadarEcoIdeas); // Reset radar-specific eco-ideas
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
        updateRadarEcoIdeaText,
        updateRadarEcoIdeaPosition, // NEW: Add to context value
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