"use client";

import React, { useState, useMemo } from 'react';
import WipeContentButton from '@/components/WipeContentButton';
import { useLcd } from '@/context/LcdContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChecklistLevel, ConceptType, EvaluationLevel } from '@/types/lcd';
import { cn } from '@/lib/utils';

const EvaluationChecklists: React.FC = () => {
  const { strategies, evaluationChecklists, setEvaluationChecklists } = useLcd();
  const [selectedConcept, setSelectedConcept] = useState<ConceptType>('A');
  const [selectedStrategyTab, setSelectedStrategyTab] = useState(strategies[0]?.id || '');

  React.useEffect(() => {
    if (strategies.length > 0 && !selectedStrategyTab) {
      setSelectedStrategyTab(strategies[0].id);
    }
  }, [strategies, selectedStrategyTab]);

  const currentChecklistLevel = evaluationChecklists[selectedConcept]?.level || 'Simplified';

  const handleChecklistLevelChange = (value: ChecklistLevel) => {
    setEvaluationChecklists(prev => ({
      ...prev,
      [selectedConcept]: {
        ...prev[selectedConcept],
        level: value,
      },
    }));
  };

  const handleEvaluationChange = (
    type: 'strategy' | 'subStrategy' | 'guideline',
    id: string,
    value: EvaluationLevel
  ) => {
    setEvaluationChecklists(prev => {
      const newChecklists = { ...prev };
      const conceptData = { ...newChecklists[selectedConcept] };

      if (type === 'strategy') {
        conceptData.strategies = { ...conceptData.strategies, [id]: value };
      } else if (type === 'subStrategy') {
        conceptData.subStrategies = { ...conceptData.subStrategies, [id]: value };
      } else if (type === 'guideline') {
        conceptData.guidelines = { ...conceptData.guidelines, [id]: value };
      }

      // Automatic calculation logic (simplified for now)
      // This would be more complex in a real scenario, considering weights etc.
      if (type === 'guideline' && conceptData.level === 'Detailed') {
        const subStrategyId = id.split('.').slice(0, 2).join('.'); // e.g., "1.1.1" -> "1.1"
        const subStrategy = strategies.flatMap(s => s.subStrategies).find(ss => ss.id === subStrategyId);
        if (subStrategy) {
          const guidelineEvals = subStrategy.guidelines.map(g => conceptData.guidelines[g.id] || 'N/A');
          conceptData.subStrategies[subStrategyId] = calculateAggregateEvaluation(guidelineEvals);
        }
      }

      if ((type === 'subStrategy' && conceptData.level === 'Normal') || (type === 'guideline' && conceptData.level === 'Detailed')) {
        const strategyId = id.split('.')[0]; // e.g., "1.1" -> "1"
        const strategy = strategies.find(s => s.id === strategyId);
        if (strategy) {
          const subStrategyEvals = strategy.subStrategies.map(ss => conceptData.subStrategies[ss.id] || 'N/A');
          conceptData.strategies[strategyId] = calculateAggregateEvaluation(subStrategyEvals);
        }
      }

      newChecklists[selectedConcept] = conceptData;
      return newChecklists;
    });
  };

  const evaluationOptions: EvaluationLevel[] = ['Excellent', 'Good', 'Mediocre', 'Poor', 'N/A'];

  const calculateAggregateEvaluation = (evaluations: EvaluationLevel[]): EvaluationLevel => {
    if (evaluations.length === 0 || evaluations.every(e => e === 'N/A')) return 'N/A';

    const scoreMap: Record<EvaluationLevel, number> = {
      'Excellent': 4,
      'Good': 3,
      'Mediocre': 2,
      'Poor': 1,
      'N/A': 0,
    };

    const totalScore = evaluations.reduce((sum, evalLevel) => sum + scoreMap[evalLevel], 0);
    const validEvaluations = evaluations.filter(e => e !== 'N/A');
    if (validEvaluations.length === 0) return 'N/A';

    const averageScore = totalScore / validEvaluations.length;

    if (averageScore >= 3.5) return 'Excellent';
    if (averageScore >= 2.5) return 'Good';
    if (averageScore >= 1.5) return 'Mediocre';
    return 'Poor';
  };

  const renderEvaluationSelectors = (
    type: 'strategy' | 'subStrategy' | 'guideline',
    id: string,
    name: string,
    currentValue: EvaluationLevel
  ) => (
    <div className="flex items-center gap-4">
      <Label className="min-w-[150px] text-app-body-text">{name}</Label>
      <Select
        value={currentValue}
        onValueChange={(value: EvaluationLevel) => handleEvaluationChange(type, id, value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Level" />
        </SelectTrigger>
        <SelectContent>
          {evaluationOptions.map(option => (
            <SelectItem key={option} value={option}>{option}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const currentStrategy = useMemo(() => strategies.find(s => s.id === selectedStrategyTab), [strategies, selectedStrategyTab]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md relative min-h-[calc(100vh-200px)] font-roboto">
      <h2 className="text-3xl font-palanquin font-semibold text-app-header mb-6">Evaluation of the Implementation of Life Cycle Design Strategies</h2>
      <p className="text-app-body-text mb-4">
        Evaluate how much each strategy, sub-strategy, and guideline has been pursued for Concept {selectedConcept}.
      </p>

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="flex-1">
          <h3 className="text-xl font-palanquin font-semibold text-app-header mb-3">Select Checklist Level:</h3>
          <RadioGroup
            value={currentChecklistLevel}
            onValueChange={(value: ChecklistLevel) => handleChecklistLevelChange(value)}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Simplified" id="simplified" />
              <Label htmlFor="simplified" className="text-app-body-text">Simplified (rate strategies only)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Normal" id="normal" />
              <Label htmlFor="normal" className="text-app-body-text">Normal (rate sub-strategies, strategies calculated)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Detailed" id="detailed" />
              <Label htmlFor="detailed" className="text-app-body-text">Detailed (rate guidelines, sub-strategies and strategies calculated)</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-palanquin font-semibold text-app-header mb-3">Select Concept:</h3>
          <RadioGroup
            value={selectedConcept}
            onValueChange={(value: ConceptType) => setSelectedConcept(value)}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="A" id="concept-a" />
              <Label htmlFor="concept-a" className="text-app-body-text">Concept/Product A</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="B" id="concept-b" />
              <Label htmlFor="concept-b" className="text-app-body-text">Concept/Product B</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <Tabs value={selectedStrategyTab} onValueChange={setSelectedStrategyTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 h-auto p-2 items-stretch"> {/* Added items-stretch */}
          {strategies.map((strategy) => (
            <TabsTrigger key={strategy.id} value={strategy.id} className="whitespace-normal h-auto font-roboto-condensed flex items-center justify-center text-center"> {/* Added flex, items-center, justify-center, text-center */}
              {strategy.id}. {strategy.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {currentStrategy && (
          <TabsContent value={currentStrategy.id} className="mt-6 pt-4">
            <h3 className="text-2xl font-palanquin font-semibold text-app-header mb-4">{currentStrategy.id}. {currentStrategy.name}</h3>

            {/* Strategy Level Evaluation */}
            <div className="mb-6 p-4 border rounded-md bg-gray-50">
              <h4 className="text-xl font-palanquin font-medium text-app-header mb-3">Strategy Evaluation:</h4>
              {renderEvaluationSelectors(
                'strategy',
                currentStrategy.id,
                currentStrategy.name,
                evaluationChecklists[selectedConcept]?.strategies[currentStrategy.id] || 'N/A'
              )}
            </div>

            {/* Sub-strategy Level Evaluation */}
            {(currentChecklistLevel === 'Normal' || currentChecklistLevel === 'Detailed') && (
              <div className="mb-6 p-4 border rounded-md bg-gray-50">
                <h4 className="text-xl font-palanquin font-medium text-app-header mb-3">Sub-strategy Evaluation:</h4>
                <div className="space-y-4">
                  {currentStrategy.subStrategies.map(subStrategy => (
                    <div key={subStrategy.id} className={cn(
                      "pl-4",
                      currentChecklistLevel === 'Detailed' && "opacity-60 pointer-events-none" // Disable if detailed
                    )}>
                      {renderEvaluationSelectors(
                        'subStrategy',
                        subStrategy.id,
                        `${subStrategy.id}. ${subStrategy.name}`,
                        evaluationChecklists[selectedConcept]?.subStrategies[subStrategy.id] || 'N/A'
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Guideline Level Evaluation */}
            {currentChecklistLevel === 'Detailed' && (
              <div className="mb-6 p-4 border rounded-md bg-gray-50">
                <h4 className="text-xl font-palanquin font-medium text-app-header mb-3">Guideline Evaluation:</h4>
                <div className="space-y-4">
                  {currentStrategy.subStrategies.map(subStrategy => (
                    <div key={subStrategy.id} className="pl-4">
                      <h5 className="text-lg font-palanquin font-medium text-app-body-text mb-2">{subStrategy.id}. {subStrategy.name}</h5>
                      <div className="space-y-2 pl-4">
                        {subStrategy.guidelines.map(guideline => (
                          <div key={guideline.id}>
                            {renderEvaluationSelectors(
                              'guideline',
                              guideline.id,
                              guideline.name,
                              evaluationChecklists[selectedConcept]?.guidelines[guideline.id] || 'N/A'
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      <WipeContentButton sectionKey="evaluationChecklists" />
    </div>
  );
};

export default EvaluationChecklists;