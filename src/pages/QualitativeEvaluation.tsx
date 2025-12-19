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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const subStrategyGuidingQuestions: { [key: string]: string[] } = {
  '1.1': ["Is the (system) product highly material-intensive (oversized)? If the (system) product is a means of transport or requires transport during use, is it oversized?"],
  '1.2': ["Does the (system) product generate a large amount of waste and/or scrap?"],
  '1.3': ["Is the packaging highly material-intensive (oversized)?"],
  '1.4': [ // Combined 1.4 and 1.5 questions
    "Does the (system) product consume large amounts of natural resources/materials during use?",
    "Is the (system) product unable to adapt consumption to different types of use?"
  ],

  '2.1': ["Is the (system) product and/or its packaging oversized in weight and/or volume?"],
  '2.2': [ // Combined 2.2 and 2.3 questions
    "Does the (system) product consume large amounts of energy? Does the (system) product fail to use the most efficient energy conversion and transfer technologies? Does the (system) product use low-efficiency insulation technology?",
    "Is the (system) product not enabled to adapt energy consumption to different types of use?"
  ],

  '3.1': [
    "Are there any materials and/or additives in the product (system) that are recognized/classified as toxic/harmful and replaceable?",
    "Are there any manufacturing, assembly, or finishing processes in the product (system) that are recognized/classified as toxic/harmful and replaceable?",
    "Are there any materials and/or manufacturing processes in the packaging that are recognized/classified as toxic/harmful and replaceable?",
    "Does the product (system) adopt disposal processes that are recognized/classified as toxic/harmful and replaceable?"
  ],
  '3.2': [
    "Are transport systems used for the product (system) that utilize energy resources and/or release emissions recognized/classified as toxic/harmful, and are they replaceable?",
    "Does the product (system) in use adopt energy resources recognized/classified as toxic/harmful, and are they replaceable?"
  ],

  '4.1': [
    "Is the product (system) manufactured using depleting and/or less renewable materials?",
    "Is the packaging manufactured using depleting and/or less renewable materials?",
    "Are the product (system) or any potentially compostable parts made of non-biodegradable materials?"
  ],
  '4.2': ["Is part of the energy consumed during use produced from depleting and/or non-renewable energy sources (e.g., fossil fuels)?"],

  '5.1': ["Does the product, or any of its components, have a short useful life?"],
  '5.2': ["Does the product, or any of its components, tend to become damaged, deteriorate, or break prematurely?"],
  '5.3': ["Does the product, or any of its components, tend to become technologically obsolete?"],
  '5.4': ["Is the product, or any of its components, difficult to store, maintain, repair, and/or upgrade?"],
  '5.5': ["Is the product, or any of its components, single-use (excluding consumable products)?"],
  '5.6': ["Is the product, or any of its components, used individually when it could be shared?"],
  '5.7': ["Does the product, or any of its components, tend to become culturally or aesthetically obsolete?"],
  '5.8': ["Does the product, or any of its components, tend not to be used for extended periods?"],

  '6.1': ["Does the (system) product generate large amounts of waste destined for landfill/incineration at the end of its life cycle?"],
  '6.2': ["Do some/all pre-production and/or production wastes end up in landfill/incineration?"],
  '6.3': ["Do some/all wastes produced during use end up in landfill/incineration?"],
  '6.4': ["Does part/all of the packaging end up in landfill/incineration?"],
  '6.5': ["No question founded"],
  '6.6': ["No question founded"],
  '6.7': ["No question founded"],
  '6.8': ["No question founded"],

  '7.1': ["No question founded"],
  '7.2': ["No question founded"],
  '7.3': ["No question founded"],
  '7.4': ["No question founded"],
  '7.5': ["No question founded"],
  '7.6': ["No question founded"],
  '7.7': ["No question founded"],
  '7.8': ["No question founded"],
};

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

    // If it's Strategy 5, 6, or 7, use the direct strategy priority
    if (['5', '6', '7'].includes(currentStrategyId)) {
      return qualitativeEvaluation[currentStrategyId]?.priority || 'None';
    }

    let highestPriority: PriorityLevel = 'None';
    let highestScore = 0;

    const subStrategyIdsToProcess: Set<string> = new Set();

    currentStrategy.subStrategies.forEach(ss => {
      // Special handling for combined sub-strategies 1.4/1.5 and 2.2/2.3
      if (currentStrategyId === '1' && ss.id === '1.5') {
        if (currentStrategy.subStrategies.some(s => s.id === '1.4')) {
          subStrategyIdsToProcess.add('1.4'); // Only add 1.4, as 1.5 is combined with it
          return;
        }
      }
      if (currentStrategyId === '2' && ss.id === '2.3') {
        if (currentStrategy.subStrategies.some(s => s.id === '2.2')) {
          subStrategyIdsToProcess.add('2.2'); // Only add 2.2, as 2.3 is combined with it
          return;
        }
      }
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

  // Use all strategies, no filtering
  const strategiesForQualitativeEvaluation = strategies;

  return (
    <div className="p-6 pb-20 bg-white rounded-lg shadow-md relative font-roboto">
      <h2 className="text-3xl font-palanquin font-semibold text-app-header mb-6">Qualitative Evaluation of Existing Products/Systems and Strategic Priorities</h2>
      <p className="text-app-body-text mb-8">
        Define the priority level for each LCD strategy and sub-strategy, and answer guiding questions to elaborate on your choices.
      </p>

      <Tabs defaultValue={strategiesForQualitativeEvaluation[0]?.id || "no-strategies"} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 h-auto p-2 items-stretch"> {/* Adjusted grid-cols for 7 strategies */}
          {strategiesForQualitativeEvaluation.map((strategy) => {
            const { displayText, classes } = getPriorityTagClasses(getStrategyPriorityForDisplay(strategy, qualitativeEvaluation));
            const isStrategy7 = strategy.id === '7';

            const triggerContent = (
              <TabsTrigger
                key={strategy.id}
                value={strategy.id}
                className={cn(
                  "whitespace-normal h-auto font-roboto-condensed flex flex-col items-center justify-center text-center relative pt-3 pb-5",
                  isStrategy7 && "text-gray-400 data-[state=active]:text-gray-500 data-[state=active]:bg-gray-100 hover:text-gray-500"
                )}
              >
                <span className="mb-1">
                  {strategy.id}. {strategy.name}
                </span>
                {!isStrategy7 && (
                  <span className={cn(
                    "absolute bottom-1.5 text-xs font-roboto-condensed px-1 rounded-sm",
                    classes
                  )}>
                    {displayText}
                  </span>
                )}
              </TabsTrigger>
            );

            if (isStrategy7) {
              return (
                <Tooltip key={strategy.id}>
                  <TooltipTrigger asChild>
                    {triggerContent}
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-sm font-roboto-condensed">
                    <p>This is a supporting strategy that can inherit the priority of strategy 5 or 6, depending on what disassembly is used for.</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return triggerContent;
          })}
        </TabsList>
        {strategiesForQualitativeEvaluation.map((strategy) => (
          <TabsContent key={strategy.id} value={strategy.id} className="mt-6 pt-4">
            {strategy.id === '7' ? (
              <div className="p-8 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <h3 className="text-xl font-palanquin font-semibold text-gray-600 mb-4">
                  Strategy 7: Design for Disassembly (Supporting Strategy)
                </h3>
                <p className="text-app-body-text">
                  This is a supporting strategy. Its priority is inherited from Strategy 5 (Design for Extended Life) or Strategy 6 (Design for End-of-Life), depending on whether disassembly is used for repair/reuse or recycling/recovery.
                </p>
                <p className="text-app-body-text mt-2">
                  No qualitative evaluation is required here.
                </p>
              </div>
            ) : (
              <>
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
                        const combinedGuidingQuestions = subStrategyGuidingQuestions[combinedId] || [
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
                        const combinedGuidingQuestions = subStrategyGuidingQuestions[combinedId] || [
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
                </div>
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <WipeContentButton sectionKey="qualitativeEvaluation" />
    </div>
  );
};

export default QualitativeEvaluation;