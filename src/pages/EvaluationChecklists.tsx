"use client";

import React, { useState, useMemo } from 'react';
import WipeContentButton from '@/components/WipeContentButton';
import { useLcd } from '@/context/LcdContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ChecklistLevel, ConceptType, EvaluationLevel } from '@/types/lcd';
import { cn } from '@/lib/utils';

const EvaluationChecklists: React.FC = () => {
  const { strategies, evaluationChecklists, setEvaluationChecklists } = useLcd();
  const [selectedConcept, setSelectedConcept] = useState<ConceptType>('A');
  
  // Filter out Strategy 7 for this page
  const filteredStrategies = strategies.filter(s => s.id !== '7');
  const [selectedStrategyTab, setSelectedStrategyTab] = useState(filteredStrategies[0]?.id || '');

  React.useEffect(() => {
    if (filteredStrategies.length > 0 && !selectedStrategyTab) {
      setSelectedStrategyTab(filteredStrategies[0].id);
    }
  }, [filteredStrategies, selectedStrategyTab]);

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

  // Refactored to only return the Select component
  const renderEvaluationSelectors = (
    type: 'strategy' | 'subStrategy' | 'guideline',
    id: string,
    currentValue: EvaluationLevel,
    disabled: boolean = false
  ) => (
    <Select
      value={currentValue}
      onValueChange={(value: EvaluationLevel) => handleEvaluationChange(type, id, value)}
      disabled={disabled}
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
  );

  const currentStrategy = useMemo(() => filteredStrategies.find(s => s.id === selectedStrategyTab), [filteredStrategies, selectedStrategyTab]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md relative min-h-[calc(100vh-200px)] font-roboto">
      <h2 className="text-3xl font-palanquin font-semibold text-app-header mb-6">Evaluation of the Implementation of Life Cycle Design Strategies</h2>
      <p className="text-app-body-text mb-4">
        Evaluate how much each strategy, sub-strategy, and guideline has been pursued for Concept {selectedConcept}.
      </p>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        {/* Checklist Level Dropdown */}
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-palanquin font-semibold text-app-header">Checklist Level:</h3>
          <Select
            value={currentChecklistLevel}
            onValueChange={(value: ChecklistLevel) => handleChecklistLevelChange(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Simplified">Simplified</SelectItem>
              <SelectItem value="Normal">Normal</SelectItem>
              <SelectItem value="Detailed">Detailed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Concept Toggle Button */}
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-palanquin font-semibold text-app-header">Concept:</h3>
          <ToggleGroup
            type="single"
            value={selectedConcept}
            onValueChange={(value: ConceptType) => value && setSelectedConcept(value)}
            className="flex"
          >
            <ToggleGroupItem value="A" aria-label="Toggle Concept A">
              Concept A
            </ToggleGroupItem>
            <ToggleGroupItem value="B" aria-label="Toggle Concept B">
              Concept B
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {currentChecklistLevel === 'Simplified' ? (
        <div className="space-y-8 mt-6 pt-4">
          {filteredStrategies.map((strategy) => (
            <div key={strategy.id} className="border-t pt-6 first:border-t-0 first:pt-0">
              <div className="flex flex-col mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-palanquin font-semibold text-app-header">
                    {strategy.id}. {strategy.name}
                  </h3>
                  {renderEvaluationSelectors(
                    'strategy',
                    strategy.id,
                    evaluationChecklists[selectedConcept]?.strategies[strategy.id] || 'N/A'
                  )}
                </div>
                <div className="pl-4 text-sm text-gray-600 font-roboto-condensed">
                  {strategy.subStrategies.map(subStrategy => (
                    <p key={subStrategy.id} className="mb-1">
                      {subStrategy.id}. {subStrategy.name}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : currentChecklistLevel === 'Normal' ? (
        <div className="space-y-8 mt-6 pt-4">
          {filteredStrategies.map((strategy) => {
            // Calculate average for strategy based on its sub-strategies
            const subStrategyEvals = strategy.subStrategies.map(ss => 
              evaluationChecklists[selectedConcept]?.subStrategies[ss.id] || 'N/A'
            );
            const calculatedStrategyAverage = calculateAggregateEvaluation(subStrategyEvals);

            return (
              <div key={strategy.id} className="border-t pt-6 first:border-t-0 first:pt-0">
                <div className="flex flex-col mb-4">
                  {/* Strategy Header with calculated average */}
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-palanquin font-semibold text-app-header">
                      {strategy.id}. {strategy.name}
                    </h3>
                    {renderEvaluationSelectors(
                      'strategy',
                      strategy.id,
                      calculatedStrategyAverage,
                      true // Disabled, as it's calculated
                    )}
                  </div>
                  {/* Sub-strategies with their own selectors */}
                  <div className="pl-4 space-y-2">
                    {strategy.subStrategies.map(subStrategy => (
                      <div key={subStrategy.id} className="flex justify-between items-center">
                        <h4 className="text-lg font-palanquin font-medium text-app-body-text">
                          {subStrategy.id}. {subStrategy.name}
                        </h4>
                        {renderEvaluationSelectors(
                          'subStrategy',
                          subStrategy.id,
                          evaluationChecklists[selectedConcept]?.subStrategies[subStrategy.id] || 'N/A'
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : ( // Detailed level
        <Tabs value={selectedStrategyTab} onValueChange={setSelectedStrategyTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 h-auto p-2 items-stretch">
            {filteredStrategies.map((strategy) => (
              <TabsTrigger key={strategy.id} value={strategy.id} className="whitespace-normal h-auto font-roboto-condensed flex items-center justify-center text-center">
                {strategy.id}. {strategy.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {currentStrategy && (
            <TabsContent value={currentStrategy.id} className="mt-6 pt-4">
              {/* Strategy Header with calculated average */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-palanquin font-semibold text-app-header">
                  {currentStrategy.id}. {currentStrategy.name}
                </h3>
                {(() => {
                  const subStrategyEvals = currentStrategy.subStrategies.map(ss => {
                    const guidelineEvals = ss.guidelines.map(g => evaluationChecklists[selectedConcept]?.guidelines[g.id] || 'N/A');
                    return calculateAggregateEvaluation(guidelineEvals);
                  });
                  const calculatedStrategyAverage = calculateAggregateEvaluation(subStrategyEvals);
                  return renderEvaluationSelectors(
                    'strategy',
                    currentStrategy.id,
                    calculatedStrategyAverage,
                    true // Disabled, as it's calculated
                  );
                })()}
              </div>

              {/* Sub-strategy and Guideline Level Evaluation */}
              <div className="space-y-8">
                {currentStrategy.subStrategies.map(subStrategy => (
                  <div key={subStrategy.id} className="border-t pt-6 first:border-t-0 first:pt-0">
                    {/* Sub-strategy Header with calculated average */}
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-xl font-palanquin font-medium text-app-header">
                        {subStrategy.id}. {subStrategy.name}
                      </h4>
                      {(() => {
                        const guidelineEvals = subStrategy.guidelines.map(g => evaluationChecklists[selectedConcept]?.guidelines[g.id] || 'N/A');
                        const calculatedSubStrategyAverage = calculateAggregateEvaluation(guidelineEvals);
                        return renderEvaluationSelectors(
                          'subStrategy',
                          subStrategy.id,
                          calculatedSubStrategyAverage,
                          true // Disabled, as it's calculated
                        );
                      })()}
                    </div>

                    {/* Guidelines with individual selectors */}
                    <div className="space-y-4 pl-4">
                      {subStrategy.guidelines.map(guideline => (
                        <div key={guideline.id} className="flex justify-between items-center"> {/* Added flex classes */}
                          <Label className="text-app-body-text">{guideline.name}</Label> {/* Moved label here */}
                          {renderEvaluationSelectors(
                            'guideline',
                            guideline.id,
                            evaluationChecklists[selectedConcept]?.guidelines[guideline.id] || 'N/A',
                            false // Not disabled, user can select
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      )}

      <WipeContentButton sectionKey="evaluationChecklists" />
    </div>
  );
};

export default EvaluationChecklists;