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
import { getStrategyPriorityForDisplay, getPriorityTagClasses } from '@/utils/lcdUtils'; // Import new utilities

const EvaluationChecklists: React.FC = () => {
  const { strategies, evaluationChecklists, setEvaluationChecklists, qualitativeEvaluation } = useLcd(); // Added qualitativeEvaluation
  const [selectedConcept, setSelectedConcept] = useState<ConceptType>('A');
  
  // Use all strategies, no filtering for this page
  const allStrategies = strategies;
  const [selectedStrategyTab, setSelectedStrategyTab] = useState(allStrategies[0]?.id || '');

  React.useEffect(() => {
    if (allStrategies.length > 0 && !selectedStrategyTab) {
      setSelectedStrategyTab(allStrategies[0].id);
    }
  }, [allStrategies, selectedStrategyTab]);

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
        const subStrategy = allStrategies.flatMap(s => s.subStrategies).find(ss => ss.id === subStrategyId);
        if (subStrategy) {
          const guidelineEvals = subStrategy.guidelines.map(g => conceptData.guidelines[g.id] || 'N/A');
          // Only update if the sub-strategy is not 7.7 or 7.8 (which are now directly editable)
          if (subStrategyId !== '7.7' && subStrategyId !== '7.8') {
            conceptData.subStrategies[subStrategyId] = calculateAggregateEvaluation(guidelineEvals);
          }
        }
      }

      if ((type === 'subStrategy' && conceptData.level === 'Normal') || (type === 'guideline' && conceptData.level === 'Detailed')) {
        const strategyId = id.split('.')[0]; // e.g., "1.1" -> "1"
        const strategy = allStrategies.find(s => s.id === strategyId);
        if (strategy) {
          // For Detailed level, calculate strategy average from sub-strategies,
          // taking into account that 7.7 and 7.8 might be directly set.
          const subStrategyEvals = strategy.subStrategies.map(ss => {
            if (conceptData.level === 'Detailed' && (ss.id === '7.7' || ss.id === '7.8')) {
              return conceptData.subStrategies[ss.id] || 'N/A'; // Use directly set value for 7.7/7.8
            }
            return conceptData.subStrategies[ss.id] || 'N/A';
          });
          conceptData.strategies[strategyId] = calculateAggregateEvaluation(subStrategyEvals);
        }
      }

      newChecklists[selectedConcept] = conceptData;
      return newChecklists;
    });
  };

  const aggregateEvaluationOptions: EvaluationLevel[] = ['Excellent', 'Good', 'Mediocre', 'Poor', 'N/A'];
  const guidelineEvaluationOptions: EvaluationLevel[] = ['Yes', 'Partially', 'No', 'N/A'];

  const calculateAggregateEvaluation = (evaluations: EvaluationLevel[]): EvaluationLevel => {
    if (evaluations.length === 0 || evaluations.every(e => e === 'N/A')) return 'N/A';

    const scoreMap: Record<EvaluationLevel, number> = {
      'Excellent': 4,
      'Good': 3,
      'Mediocre': 2,
      'Poor': 1,
      'Yes': 4,
      'Partially': 2.5, // Mid-point to allow for 'Good' or 'Mediocre' depending on average
      'No': 1,
      'N/A': 0,
    };

    const scores = evaluations.map(evalLevel => scoreMap[evalLevel]).filter(score => score > 0); // Filter out N/A (score 0)
    
    if (scores.length === 0) return 'N/A';

    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const averageScore = totalScore / scores.length;

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
  ) => {
    const options = type === 'guideline' ? guidelineEvaluationOptions : aggregateEvaluationOptions;
    return (
      <Select
        value={currentValue}
        onValueChange={(value: EvaluationLevel) => handleEvaluationChange(type, id, value)}
        disabled={disabled}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Level" />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option} value={option}>{option}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  const currentStrategy = useMemo(() => allStrategies.find(s => s.id === selectedStrategyTab), [allStrategies, selectedStrategyTab]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md relative min-h-[calc(100vh-200px)] font-roboto">
      <h2 className="text-3xl font-palanquin font-semibold text-app-header mb-6">Evaluation of the Implementation of Life Cycle Design Strategies</h2>
      <p className="text-app-body-text mb-4">
        Evaluate how much each strategy, sub-strategy, and guideline has been pursued for Concept {selectedConcept}.
      </p>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        {/* Checklist Level Toggle Group */}
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-palanquin font-semibold text-app-header">Checklist Level:</h3>
          <ToggleGroup
            type="single"
            value={currentChecklistLevel}
            onValueChange={(value: ChecklistLevel) => value && handleChecklistLevelChange(value)}
            className="flex"
          >
            <ToggleGroupItem
              value="Simplified"
              aria-label="Toggle Simplified Checklist"
              className={cn(
                "data-[state=on]:bg-app-primary data-[state=on]:text-white",
                "data-[state=on]:hover:bg-app-primary-dark",
                "text-app-primary hover:bg-app-primary-light/20"
              )}
            >
              Simplified
            </ToggleGroupItem>
            <ToggleGroupItem
              value="Normal"
              aria-label="Toggle Normal Checklist"
              className={cn(
                "data-[state=on]:bg-app-primary data-[state=on]:text-white",
                "data-[state=on]:hover:bg-app-primary-dark",
                "text-app-primary hover:bg-app-primary-light/20"
              )}
            >
              Normal
            </ToggleGroupItem>
            <ToggleGroupItem
              value="Detailed"
              aria-label="Toggle Detailed Checklist"
              className={cn(
                "data-[state=on]:bg-app-primary data-[state=on]:text-white",
                "data-[state=on]:hover:bg-app-primary-dark",
                "text-app-primary hover:bg-app-primary-light/20"
              )}
            >
              Detailed
            </ToggleGroupItem>
          </ToggleGroup>
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
            <ToggleGroupItem
              value="A"
              aria-label="Toggle Concept A"
              className={cn(
                "data-[state=on]:bg-app-concept-a-base data-[state=on]:text-white",
                "data-[state=on]:hover:bg-app-concept-a-dark",
                "text-app-concept-a-base hover:bg-app-concept-a-light/20"
              )}
            >
              Concept A
            </ToggleGroupItem>
            <ToggleGroupItem
              value="B"
              aria-label="Toggle Concept B"
              className={cn(
                "data-[state=on]:bg-app-concept-b-base data-[state=on]:text-white",
                "data-[state=on]:hover:bg-app-concept-b-dark",
                "text-app-concept-b-base hover:bg-app-concept-b-light/20"
              )}
            >
              Concept B
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {currentChecklistLevel === 'Simplified' ? (
        <div className="space-y-8 mt-6 pt-4">
          {allStrategies.map((strategy) => {
            const { displayText, classes } = getPriorityTagClasses(getStrategyPriorityForDisplay(strategy, qualitativeEvaluation));
            return (
              <div key={strategy.id} className="border-t pt-6 first:border-t-0 first:pt-0">
                <div className="flex flex-col mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-palanquin font-semibold text-app-header flex items-center gap-2">
                      <span className={cn(
                        "text-xs font-roboto-condensed px-1 rounded-sm",
                        classes
                      )}>
                        {displayText}
                      </span>
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
                      <p key={subStrategy.id} className="mb-1 font-palanquin font-bold"> {/* Added font-palanquin font-bold */}
                        {subStrategy.id}. {subStrategy.name}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : currentChecklistLevel === 'Normal' ? (
        <div className="space-y-8 mt-6 pt-4">
          {allStrategies.map((strategy) => {
            // Calculate average for strategy based on its sub-strategies
            const subStrategyEvals = strategy.subStrategies.map(ss => 
              evaluationChecklists[selectedConcept]?.subStrategies[ss.id] || 'N/A'
            );
            const calculatedStrategyAverage = calculateAggregateEvaluation(subStrategyEvals);
            const { displayText, classes } = getPriorityTagClasses(getStrategyPriorityForDisplay(strategy, qualitativeEvaluation));

            return (
              <div key={strategy.id} className="border-t pt-6 first:border-t-0 first:pt-0">
                <div className="flex flex-col mb-4">
                  {/* Strategy Header with calculated average */}
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-palanquin font-semibold text-app-header flex items-center gap-2">
                      <span className={cn(
                        "text-xs font-roboto-condensed px-1 rounded-sm",
                        classes
                      )}>
                        {displayText}
                      </span>
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
                        <h4 className="text-lg font-palanquin font-bold text-app-body-text"> {/* Already has font-palanquin font-bold */}
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
            {allStrategies.map((strategy) => {
              const { displayText, classes } = getPriorityTagClasses(getStrategyPriorityForDisplay(strategy, qualitativeEvaluation));
              return (
                <TabsTrigger
                  key={strategy.id}
                  value={strategy.id}
                  className={cn(
                    "whitespace-normal h-auto font-roboto-condensed flex flex-col items-center justify-center text-center relative pt-3 pb-5", // Changed to flex-col and items-center
                  )}
                >
                  <span className="mb-1"> {/* Added span for title and margin-bottom */}
                    {strategy.id}. {strategy.name}
                  </span>
                  <span className={cn(
                    "absolute bottom-1.5 text-xs font-roboto-condensed px-1 rounded-sm", // Removed left/right and translate-x-1/2, flex-col handles centering
                    classes
                  )}>
                    {displayText}
                  </span>
                </TabsTrigger>
              );
            })}
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
                    // For 7.7 and 7.8, use their directly set value if in Detailed mode
                    if (ss.id === '7.7' || ss.id === '7.8') {
                      return evaluationChecklists[selectedConcept]?.subStrategies[ss.id] || 'N/A';
                    }
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
                    {/* Sub-strategy Header with calculated average or editable selector for 7.7/7.8 */}
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-xl font-palanquin font-bold text-app-header"> {/* Already has font-palanquin font-bold */}
                        {subStrategy.id}. {subStrategy.name}
                      </h4>
                      {(() => {
                        const isEditable = (subStrategy.id === '7.7' || subStrategy.id === '7.8');
                        const guidelineEvals = subStrategy.guidelines.map(g => evaluationChecklists[selectedConcept]?.guidelines[g.id] || 'N/A');
                        const calculatedSubStrategyAverage = calculateAggregateEvaluation(guidelineEvals);
                        
                        return renderEvaluationSelectors(
                          'subStrategy',
                          subStrategy.id,
                          isEditable ? (evaluationChecklists[selectedConcept]?.subStrategies[subStrategy.id] || 'N/A') : calculatedSubStrategyAverage,
                          !isEditable // Disabled if not editable (i.e., not 7.7 or 7.8)
                        );
                      })()}
                    </div>

                    {/* Guidelines with individual selectors */}
                    <div className="space-y-4 pl-4">
                      {subStrategy.guidelines.map(guideline => (
                        <div key={guideline.id} className="flex justify-between items-center">
                          <Label className="text-app-body-text">{guideline.name}</Label>
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