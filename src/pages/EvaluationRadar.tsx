"use client";

import React, { useEffect, useState } from 'react';
import WipeContentButton from '@/components/WipeContentButton';
import { useLcd } from '@/context/LcdContext';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { EvaluationLevel } from '@/types/lcd';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const EvaluationRadar: React.FC = () => {
  const { strategies, evaluationChecklists, setRadarChartData, radarChartData } = useLcd();
  const [selectedConcept, setSelectedConcept] = useState<'A' | 'B'>('A');

  // Map EvaluationLevel to a numerical score for the radar chart
  const evaluationToScore: Record<EvaluationLevel, number> = {
    'Poor': 1,
    'Mediocre': 2,
    'Good': 3,
    'Excellent': 4,
    'N/A': 0, // N/A will be treated as 0 or not shown
  };

  // Function to calculate the average evaluation for a strategy
  const calculateStrategyAverage = (concept: 'A' | 'B', strategyId: string): number => {
    const conceptChecklists = evaluationChecklists[concept];
    if (!conceptChecklists) return 0;

    const strategy = strategies.find(s => s.id === strategyId);
    if (!strategy) return 0;

    let totalScore = 0;
    let count = 0;

    if (conceptChecklists.level === 'Simplified') {
      const evalLevel = conceptChecklists.strategies[strategyId] || 'N/A';
      totalScore += evaluationToScore[evalLevel];
      count = 1;
    } else if (conceptChecklists.level === 'Normal') {
      const subStrategyEvals = strategy.subStrategies.map(ss => conceptChecklists.subStrategies[ss.id] || 'N/A');
      const validScores = subStrategyEvals.map(e => evaluationToScore[e]).filter(s => s > 0);
      if (validScores.length > 0) {
        totalScore = validScores.reduce((sum, score) => sum + score, 0);
        count = validScores.length;
      }
    } else if (conceptChecklists.level === 'Detailed') {
      let guidelineScores: number[] = [];
      strategy.subStrategies.forEach(subStrategy => {
        subStrategy.guidelines.forEach(guideline => {
          const evalLevel = conceptChecklists.guidelines[guideline.id] || 'N/A';
          const score = evaluationToScore[evalLevel];
          if (score > 0) {
            guidelineScores.push(score);
          }
        });
      });
      if (guidelineScores.length > 0) {
        totalScore = guidelineScores.reduce((sum, score) => sum + score, 0);
        count = guidelineScores.length;
      }
    }

    return count > 0 ? totalScore / count : 0;
  };

  useEffect(() => {
    const newRadarData: { [key: string]: number } = {};
    strategies.forEach(strategy => {
      newRadarData[strategy.id] = calculateStrategyAverage(selectedConcept, strategy.id);
    });
    setRadarChartData(prev => ({
      ...prev,
      [selectedConcept]: newRadarData,
    }));
  }, [evaluationChecklists, strategies, selectedConcept, setRadarChartData]);

  const data = strategies.map(strategy => ({
    strategyName: `${strategy.id}. ${strategy.name}`,
    A: radarChartData.A[strategy.id] || 0,
    B: radarChartData.B[strategy.id] || 0,
    fullMark: 4, // Max score for Excellent
  }));

  return (
    <div className="p-6 bg-white rounded-lg shadow-md relative min-h-[calc(100vh-200px)] font-roboto">
      <h2 className="text-3xl font-palanquin font-semibold text-app-header mb-6">Evaluation Radar</h2>
      <p className="text-app-body-text mb-4">
        This radar chart displays the pursuit level of each of the 7 strategies for Concept A and B,
        based on your evaluations in the "Evaluation Checklists" section.
      </p>

      <div className="mb-8">
        <h3 className="text-xl font-palanquin font-semibold text-app-header mb-3">Select Concept to Highlight:</h3>
        <RadioGroup
          value={selectedConcept}
          onValueChange={(value: 'A' | 'B') => setSelectedConcept(value)}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="A" id="radar-concept-a" />
            <Label htmlFor="radar-concept-a" className="text-app-body-text">Concept/Product A</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="B" id="radar-concept-b" />
            <Label htmlFor="radar-concept-b" className="text-app-body-text">Concept/Product B</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="w-full h-[500px] flex justify-center items-center">
        {strategies.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="#e0e0e0" />
              <PolarAngleAxis dataKey="strategyName" stroke="#333" tick={{ fill: '#333', fontSize: 12, fontFamily: 'Roboto Condensed' }} />
              <PolarRadiusAxis angle={90} domain={[0, 4]} tickCount={5} stroke="#333" tick={{ fill: '#333', fontSize: 10, fontFamily: 'Roboto' }} />
              <Radar name="Concept A" dataKey="A" stroke="#003366" fill="#003366" fillOpacity={0.6} />
              <Radar name="Concept B" dataKey="B" stroke="#ff8c00" fill="#ff8c00" fillOpacity={0.6} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-app-body-text">Loading strategies...</p>
        )}
      </div>

      <WipeContentButton sectionKey="radarChart" />
    </div>
  );
};

export default EvaluationRadar;