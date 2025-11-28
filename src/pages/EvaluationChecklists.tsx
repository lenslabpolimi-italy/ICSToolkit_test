"use client";

import React, { useState, useMemo } from 'react';
import WipeContentButton from '@/components/WipeContentButton';
import { useLcd } from '@/context/LcdContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress'; // Import Progress component
import { ChecklistLevel, ConceptType, EvaluationLevel } from '@/types/lcd';
import { cn } from '@/lib/utils';
import { getStrategyPriorityForDisplay, getPriorityTagClasses } from '@/utils/lcdUtils'; // Import new utilities

const EvaluationChecklists: React.FC = () => {
  const { strategies, evaluationChecklists, setEvaluationChecklists, qualitativeEvaluation } = useLcd();
  const [selectedConcept, setSelectedConcept] = useState<ConceptType>('A');
  
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

      if (type === 'guideline' && conceptData.level === 'Detailed') {
        const subStrategyId = id.split('.').slice(0, 2).join('.');
        const subStrategy = allStrategies.flatMap(s => s.subStrategies).find(ss => ss.id === subStrategyId);
        if (subStrategy) {
          const guidelineEvals = subStrategy.guidelines.map(g => conceptData.guidelines[g.id] || 'N/A');
          if (subStrategyId !== '7.7' && subStrategyId !== '7.8') {
            conceptData.subStrategies[subStrategyId] = calculateAggregateEvaluation(guidelineEvals);
          }
        }
      }

      if ((type === 'subStrategy' && conceptData.level === 'Normal') || (type === 'guideline' && conceptData.level === 'Detailed')) {
        const strategyId = id.split('.')[0];
        const strategy = allStrategies.find(s => s.id === strategyId);
        if (strategy) {
          const subStrategyEvals = strategy.subStrategies.map(ss => {
            if (conceptData.level === 'Detailed' && (ss.id === '7.7' || ss.id === '7.8')) {
              return conceptData.subStrategies[ss.id] || 'N/A';
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
      'Partially': 2.5,
      'No': 1,
      'N/A': 0,
    };

    const scores = evaluations.map(evalLevel => scoreMap[evalLevel]).filter(score => score > 0);
    
    if (scores.length === 0) return 'N/A';

    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const averageScore = totalScore / scores.length;

    if (averageScore >= 3.5) return 'Excellent';
    if (averageScore >= 2.5) return 'Good';
    if (averageScore >= 1.5) return 'Mediocre';
    return 'Poor';
  };

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

  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    let totalItems = 0;
    let completedItems = 0;
    const currentConceptData = evaluationChecklists[selectedConcept];

    if (!currentConceptData) return 0;

    if (currentChecklistLevel === 'Simplified') {
      totalItems = allStrategies.length;
      allStrategies.forEach(strategy => {
        if (currentConceptData.strategies[strategy.id] && currentConceptData.strategies[strategy.id] !== 'N/A') {
          completedItems++;
        }
      });
    } else if (currentChecklistLevel === 'Normal') {
      allStrategies.forEach(strategy => {
        strategy.subStrategies.forEach(subStrategy => {
          totalItems++;
          if (currentConceptData.subStrategies[subStrategy.id] && currentConceptData.subStrategies[subStrategy.id] !== 'N/A') {
            completedItems++;
          }
        });
      });
    } else if (currentChecklistLevel === 'Detailed') {
      allStrategies.forEach(strategy => {
        strategy.subStrategies.forEach(subStrategy => {
          subStrategy.guidelines.forEach(guideline => {
            totalItems++;
            if (currentConceptData.guidelines[guideline.id] && currentConceptData.guidelines[guideline.id] !== 'N/A') {
              completedItems++;
            }
          });
        });
      });
    }

    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  }, [evaluationChecklists, selectedConcept, currentChecklistLevel, allStrategies]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md relative min-h-[calc(100vh-200px)] font-roboto">
      <h2 className="text-3xl font-palanquin font-semibold text-app-header mb-6">Evaluation of the Implementation of Life Cycle Design Strategies</h2>
      <p className="text-app-body-text mb-4">
        Evaluate how much each strategy, sub-strategy, and guideline has been pursued for Concept {selectedConcept}.
      </p>

      {/* Completion Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Completion Progress</span>
          <span>{completionPercentage}%</span>
        </div>
        <Progress value={completionPercentage} className="w-full h-2 bg-gray-200" indicatorClassName="!bg-app-accent" />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        {/* Checklist Level Selector */}
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

        {/* Concept Selector */}
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-palanquin font-semibold text-app-header">Concept:</h3>
          <Select
            value={selectedConcept}
            onValueChange={(value: ConceptType) => setSelectedConcept(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Concept" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">Concept A</SelectItem>
              <SelectItem value="B">Concept B</SelectItem>
            </SelectContent>
          </Select>
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
                      <p key={subStrategy.id} className="mb-1 font-palanquin font-bold">
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
            const subStrategyEvals = strategy.subStrategies.map(ss => 
              evaluationChecklists[selectedConcept]?.subStrategies[ss.id] || 'N/A'
            );
            const calculatedStrategyAverage = calculateAggregateEvaluation(subStrategyEvals);
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
                  </div>
                  <div className="pl-4 space-y-2">
                    {strategy.subStrategies.map(subStrategy => (
                      <div key={subStrategy.id} className="flex justify-between items-center">
                        <h4 className="text-lg font-palanquin font-bold text-gray-600">
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
                    "whitespace-normal h-auto font-roboto-condensed flex flex-col items-center justify-center text-center relative pt-3 pb-5",
                  )}
                >
                  <span className="mb-1">
                    {strategy.id}. {strategy.name}
                  </span>
                  <span className={cn(
                    "absolute bottom-1.5 text-xs font-roboto-condensed px-1 rounded-sm",
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
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-palanquin font-semibold text-app-header">
                  {currentStrategy.id}. {currentStrategy.name}
                </h3>
              </div>

              <div className="space-y-8">
                {currentStrategy.subStrategies.map(subStrategy => (
                  <div key={subStrategy.id} className="border-t pt-6 first:border-t-0 first:pt-0">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-xl font-palanquin font-bold text-gray-600">
                        {subStrategy.id}. {subStrategy.name}
                      </h4>
                    </div>

                    <div className="space-y-4 pl-4">
                      {subStrategy.guidelines.map(guideline => (
                        <div key={guideline.id} className="flex justify-between items-center">
                          <Label className="text-app-body-text font-roboto-condensed">{guideline.name}</Label>
                          {renderEvaluationSelectors(
                            'guideline',
                            guideline.id,
                            evaluationChecklists[selectedConcept]?.guidelines[guideline.id] || 'N/A',
                            false
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