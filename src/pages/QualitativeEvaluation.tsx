"use client";

import React from 'react';
import WipeContentButton from '@/components/WipeContentButton';
import { useLcd } from '@/context/LcdContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PriorityLevel } from '@/types/lcd';
import { getStrategyPriorityForDisplay, getPriorityTagClasses } from '@/utils/lcdUtils';
import { cn } from '@/lib/utils';

// Placeholder guiding questions for sub-strategies
// All specific guiding questions have been removed as per your request.
const subStrategyGuidingQuestions: { [key: string]: string[] } = {};

const QualitativeEvaluation: React.FC = () => {
  const { strategies, qualitativeEvaluation, setQualitativeEvaluation } = useLcd();

  const handlePriorityChange = (strategyId: string, subStrategyId: string, value: PriorityLevel) => {
    setQualitativeEvaluation(prev => {
      const newEvaluation = { ...prev };
      if (!newEvaluation[strategyId]) {
        newEvaluation[strategyId] = { priority: 'None', subStrategies: {} };
      }
      if (!newEvaluation[strategyId].subStrategies[subStrategyId]) {
        newEvaluation[strategyId].subStrategies[subStrategyId] = { priority: 'None', answer: '' };
      }
      newEvaluation[strategyId].subStrategies[subStrategyId].priority = value;
      return newEvaluation;
    });
  };

  const handleAnswerChange = (strategyId: string, subStrategyId: string, value: string) => {
    setQualitativeEvaluation(prev => {
      const newEvaluation = { ...prev };
      if (!newEvaluation[strategyId]) {
        newEvaluation[strategyId] = { priority: 'None', subStrategies: {} };
      }
      if (!newEvaluation[strategyId].subStrategies[subStrategyId]) {
        newEvaluation[strategyId].subStrategies[subStrategyId] = { priority: 'None', answer: '' };
      }
      newEvaluation[strategyId].subStrategies[subStrategyId].answer = value;
      return newEvaluation;
    });
  };

  // Define priority order for comparison
  const priorityOrder: Record<PriorityLevel, number> = {
    'None': 0,
    'Low': 1,
    'Mid': 2,
    'High': 3,
  };

  // Function to calculate the highest priority among sub-strategies for a given strategy
  const calculateHighestSubStrategyPriority = (currentStrategyId: string): PriorityLevel => {
    const currentStrategy = strategies.find(s => s.id === currentStrategyId);
    if (!currentStrategy) return 'None';

    let highestPriority: PriorityLevel = 'None';
    let highestScore = 0;

    const subStrategyIdsToProcess: Set<string> = new Set();

    currentStrategy.subStrategies.forEach(ss => {
      if (currentStrategyId === '1' && ss.id === '1.5') {
        if (currentStrategy.subStrategies.some(s => s.id === '1.4')) {
          subStrategyIdsToProcess.add('1.4');
          return;
        }
      }
      if (currentStrategyId === '2' && ss.id === '2.3') {
        if (currentStrategy.subStrategies.some(s => s.id === '2.2')) {
          subStrategyIdsToProcess.add('2.2');
          return;
        }
      }
      // For strategies 5, 6, 7, we don't combine sub-strategies for priority calculation here
      // as their strategy priority is set directly.
      // However, the sub-strategy priority is still individual.
      subStrategyIdsToProcess.add(ss.id);
    });

    for (const subStrategyId of Array.from(subStrategyIdsToProcess)) {
      const subPriority = qualitativeEvaluation[currentStrategyId]?.subStrategies[subStrategyId]?.priority || 'None';
      const subScore = priorityOrder[subPriority];

      if (subScore > highestScore) {
        highestScore = subScore;
        highestPriority = subPriority;
      }
    }
    return highestPriority;
  };

  // Filter out Strategy 7 for this page
  const filteredStrategies = strategies.filter(s => s.id !== '7');

  return (
    <div className="p-6 bg-white rounded-lg shadow-md relative min-h-[calc(100vh-200px)] font-roboto">
      <h2 className="text-3xl font-palanquin font-semibold text-app-header mb-6">Qualitative Evaluation of Existing Products/Systems and Strategic Priorities</h2>
      <p className="text-app-body-text mb-8">
        Define the priority level for each LCD strategy and sub-strategy, and answer guiding questions to elaborate on your choices.
      </p>

      <Tabs defaultValue={filteredStrategies[0]?.id || "no-strategies"} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 h-auto p-2 items-stretch">
          {filteredStrategies.map((strategy) => {
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
        {filteredStrategies.map((strategy) => (
          <TabsContent key={strategy.id} value={strategy.id} className="mt-6 pt-4">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-palanquin font-semibold text-app-header">
                {strategy.id}. {strategy.name}
              </h3>
              <div className="flex items-center gap-4">
                <Label htmlFor={`strategy-priority-${strategy.id}`} className="text-app-body-text">Strategy Priority:</Label>
                {['1', '2', '3', '4'].includes(strategy.id) ? (
                  <Select
                    value={calculateHighestSubStrategyPriority(strategy.id)}
                  >
                    <SelectTrigger id={`strategy-priority-${strategy.id}`} className="w-[180px]" disabled>
                      <SelectValue placeholder="Calculated Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High priority</SelectItem>
                      <SelectItem value="Mid">Mid priority</SelectItem>
                      <SelectItem value="Low">Low priority</SelectItem>
                      <SelectItem value="None">No priority</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Select
                    value={qualitativeEvaluation[strategy.id]?.priority || 'None'}
                    onValueChange={(value: PriorityLevel) => setQualitativeEvaluation(prev => ({
                      ...prev,
                      [strategy.id]: { ...prev[strategy.id], priority: value }
                    }))}
                  >
                    <SelectTrigger id={`strategy-priority-${strategy.id}`} className="w-[180px]">
                      <SelectValue placeholder="Select Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High priority</SelectItem>
                      <SelectItem value="Mid">Mid priority</SelectItem>
                      <SelectItem value="Low">Low priority</SelectItem>
                      <SelectItem value="None">No priority</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="space-y-8">
              {strategy.id === '5' || strategy.id === '6' ? (
                <div className="border-t pt-6 first:border-t-0 first:pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-orange-50 p-4 rounded-md border border-orange-200 flex flex-col">
                      {strategy.subStrategies.map((subStrategy) => (
                        <div key={subStrategy.id} className="mb-4 last:mb-0">
                          <h5 className="font-palanquin font-medium text-app-header mb-1">
                            {subStrategy.id}. {subStrategy.name}
                          </h5>
                          <ul className="list-disc list-inside text-app-body-text text-sm space-y-1 pl-4">
                            {(subStrategyGuidingQuestions[subStrategy.id] || [
                              `How does sub-strategy "${subStrategy.name}" apply to your product?`,
                              "What are the main challenges and opportunities for this sub-strategy?",
                              "Consider the environmental, social, and economic aspects.",
                            ]).map((q, idx) => (
                              <li key={idx}>{q}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <div className="flex-1 flex flex-col">
                      <Textarea
                        placeholder={`Write your answers for Strategy ${strategy.id} here, covering all its sub-strategies...`}
                        rows={10}
                        className="w-full flex-grow min-h-[150px]"
                        value={qualitativeEvaluation[strategy.id]?.subStrategies[`${strategy.id}.1`]?.answer || ''}
                        onChange={(e) => handleAnswerChange(strategy.id, `${strategy.id}.1`, e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {(() => {
                    let hasRendered1_4_1_5 = false;
                    let hasRendered2_2_2_3 = false;
                    return strategy.subStrategies.map((subStrategy) => {
                      if (strategy.id === '1' && subStrategy.id === '1.5') {
                        return null;
                      }

                      if (strategy.id === '1' && subStrategy.id === '1.4' && !hasRendered1_4_1_5) {
                        hasRendered1_4_1_5 = true;
                        const subStrategy1_4_obj = strategy.subStrategies.find(ss => ss.id === '1.4');
                        const subStrategy1_5_obj = strategy.subStrategies.find(ss => ss.id === '1.5');

                        if (!subStrategy1_4_obj || !subStrategy1_5_obj) return null;

                        const combinedId = '1.4';
                        const combinedGuidingQuestions = subStrategyGuidingQuestions['1.4_1.5_combined'] || [
                          `How do sub-strategies "${subStrategy1_4_obj.name}" and "${subStrategy1_5_obj.name}" apply to your product?`,
                          "What are the main challenges and opportunities for these combined sub-strategies?",
                          "Consider the environmental, social, and economic aspects related to both.",
                        ];

                        return (
                          <div key="1.4-1.5-combined" className="border-t pt-6 first:border-t-0 first:pt-0">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="text-xl font-palanquin font-medium text-app-header">
                                {subStrategy1_4_obj.id}. {subStrategy1_4_obj.name}
                                <br />
                                {subStrategy1_5_obj.id}. {subStrategy1_5_obj.name}
                              </h4>
                              <div className="flex items-center gap-4">
                                <Label htmlFor={`sub-strategy-priority-${combinedId}`} className="text-app-body-text">
                                  Sub-strategy Priority:
                                </Label>
                                <Select
                                  value={qualitativeEvaluation[strategy.id]?.subStrategies[combinedId]?.priority || 'None'}
                                  onValueChange={(value: PriorityLevel) => handlePriorityChange(strategy.id, combinedId, value)}
                                >
                                  <SelectTrigger id={`sub-strategy-priority-${combinedId}`} className="w-[180px]">
                                    <SelectValue placeholder="Select Priority" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="High">High priority</SelectItem>
                                    <SelectItem value="Mid">Mid priority</SelectItem>
                                    <SelectItem value="Low">Low priority</SelectItem>
                                    <SelectItem value="None">No priority</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-orange-50 p-4 rounded-md border border-orange-200">
                                <ul className="list-disc list-inside text-app-body-text text-sm space-y-1">
                                  {combinedGuidingQuestions.map((q, idx) => (
                                    <li key={idx}>{q}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className="flex-1">
                                <Textarea
                                  placeholder={`Write your answers for "${subStrategy1_4_obj.name}" and "${subStrategy1_5_obj.name}" here...`}
                                  rows={6}
                                  className="w-full min-h-[150px]"
                                  value={qualitativeEvaluation[strategy.id]?.subStrategies[combinedId]?.answer || ''}
                                  onChange={(e) => handleAnswerChange(strategy.id, combinedId, e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (strategy.id === '2' && subStrategy.id === '2.3') {
                        return null;
                      }

                      if (strategy.id === '2' && subStrategy.id === '2.2' && !hasRendered2_2_2_3) {
                        hasRendered2_2_2_3 = true;
                        const subStrategy2_2_obj = strategy.subStrategies.find(ss => ss.id === '2.2');
                        const subStrategy2_3_obj = strategy.subStrategies.find(ss => ss.id === '2.3');

                        if (!subStrategy2_2_obj || !subStrategy2_3_obj) return null;

                        const combinedId = '2.2';
                        const combinedGuidingQuestions = subStrategyGuidingQuestions['2.2_2.3_combined'] || [
                          `How do sub-strategies "${subStrategy2_2_obj.name}" and "${subStrategy2_3_obj.name}" apply to your product?`,
                          "What are the main challenges and opportunities for these combined sub-strategies?",
                          "Consider the environmental, social, and economic aspects related to both.",
                        ];

                        return (
                          <div key="2.2-2.3-combined" className="border-t pt-6 first:border-t-0 first:pt-0">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="text-xl font-palanquin font-medium text-app-header">
                                {subStrategy2_2_obj.id}. {subStrategy2_2_obj.name}
                                <br />
                                {subStrategy2_3_obj.id}. {subStrategy2_3_obj.name}
                              </h4>
                              <div className="flex items-center gap-4">
                                <Label htmlFor={`sub-strategy-priority-${combinedId}`} className="text-app-body-text">
                                  Sub-strategy Priority:
                                </Label>
                                <Select
                                  value={qualitativeEvaluation[strategy.id]?.subStrategies[combinedId]?.priority || 'None'}
                                  onValueChange={(value: PriorityLevel) => handlePriorityChange(strategy.id, combinedId, value)}
                                >
                                  <SelectTrigger id={`sub-strategy-priority-${combinedId}`} className="w-[180px]">
                                    <SelectValue placeholder="Select Priority" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="High">High priority</SelectItem>
                                    <SelectItem value="Mid">Mid priority</SelectItem>
                                    <SelectItem value="Low">Low priority</SelectItem>
                                    <SelectItem value="None">No priority</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-orange-50 p-4 rounded-md border border-orange-200">
                                <ul className="list-disc list-inside text-app-body-text text-sm space-y-1">
                                  {combinedGuidingQuestions.map((q, idx) => (
                                    <li key={idx}>{q}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className="flex-1">
                                <Textarea
                                  placeholder={`Write your answers for "${subStrategy2_2_obj.name}" and "${subStrategy2_3_obj.name}" here...`}
                                  rows={6}
                                  className="w-full min-h-[150px]"
                                  value={qualitativeEvaluation[strategy.id]?.subStrategies[combinedId]?.answer || ''}
                                  onChange={(e) => handleAnswerChange(strategy.id, combinedId, e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={subStrategy.id} className="border-t pt-6 first:border-t-0 first:pt-0">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xl font-palanquin font-medium text-app-header">
                              {subStrategy.id}. {subStrategy.name}
                            </h4>
                            <div className="flex items-center gap-4">
                              <Label htmlFor={`sub-strategy-priority-${subStrategy.id}`} className="text-app-body-text">
                                Sub-strategy Priority:
                              </Label>
                              <Select
                                value={qualitativeEvaluation[strategy.id]?.subStrategies[subStrategy.id]?.priority || 'None'}
                                onValueChange={(value: PriorityLevel) => handlePriorityChange(strategy.id, subStrategy.id, value)}
                              >
                                <SelectTrigger id={`sub-strategy-priority-${subStrategy.id}`} className="w-[180px]">
                                  <SelectValue placeholder="Select Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="High">High priority</SelectItem>
                                  <SelectItem value="Mid">Mid priority</SelectItem>
                                  <SelectItem value="Low">Low priority</SelectItem>
                                  <SelectItem value="None">No priority</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-orange-50 p-4 rounded-md border border-orange-200">
                              <ul className="list-disc list-inside text-app-body-text text-sm space-y-1">
                                {(subStrategyGuidingQuestions[subStrategy.id] || [
                                  `How does sub-strategy "${subStrategy.name}" apply to your product?`,
                                  "What are the main challenges and opportunities for this sub-strategy?",
                                  "Consider the environmental, social, and economic aspects.",
                                ]).map((q, idx) => (
                                  <li key={idx}>{q}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="flex-1">
                              <Textarea
                                placeholder={`Write your answers for "${subStrategy.name}" here...`}
                                rows={6}
                                className="w-full min-h-[150px]"
                                value={qualitativeEvaluation[strategy.id]?.subStrategies[subStrategy.id]?.answer || ''}
                                onChange={(e) => handleAnswerChange(strategy.id, subStrategy.id, e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <WipeContentButton sectionKey="qualitativeEvaluation" />
    </div>
  );
};

export default QualitativeEvaluation;