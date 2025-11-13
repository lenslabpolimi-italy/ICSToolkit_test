"use client";

import React from 'react';
import WipeContentButton from '@/components/WipeContentButton';
import { useLcd } from '@/context/LcdContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PriorityLevel } from '@/types/lcd';
import { getStrategyPriorityForDisplay, getPriorityTagClasses } from '@/utils/lcdUtils'; // Import new utilities
import { cn } from '@/lib/utils'; // Import cn for conditional class merging

// Placeholder guiding questions for sub-strategies
const subStrategyGuidingQuestions: { [key: string]: string[] } = {
  // Example for Strategy 1, Sub-strategy 1.1
  '1.1': [
    "How can the product's material content be reduced without compromising functionality?",
    "Are there opportunities to use lighter materials or optimize part geometry?",
    "What are the key components that contribute most to material consumption?",
  ],
  '1.2': [
    "Can the product be designed for easier disassembly and separation of materials?",
    "Are there fewer different materials used, especially incompatible ones?",
    "How can connections be simplified for efficient recycling or reuse?",
  ],
  '1.3': [
    "Can recycled or renewable materials be incorporated into the product?",
    "Are there certifications or standards for sustainable material sourcing to consider?",
    "What are the trade-offs in performance or cost when using alternative materials?",
  ],
  '1.4_1.5_combined': [
    "How can the product's energy consumption be reduced during use?",
    "Are there opportunities for energy recovery or use of renewable energy sources?",
    "What are the main energy-intensive phases or components?",
    "How can the product's water consumption be minimized?",
    "Are there opportunities for water recycling or use of alternative water sources?",
    "What are the key components or processes that contribute most to water usage?",
    "Consider the combined impact of energy and water in your evaluation."
  ],
  '2.1': [
    "How can the product's lifespan be extended through design choices?",
    "What features can be added to make the product more durable or timeless?",
    "Are there opportunities for modularity or upgradability?",
  ],
  '2.2_2.3_combined': [
    "How can the product be designed for easier maintenance and repair?",
    "Are spare parts readily available, and is repair information accessible?",
    "How can common failure points be addressed through design?",
    "How can the product be designed for easier reuse or redistribution?",
    "Are there components or sub-assemblies that could have a second life?",
    "What systems or services could support product reuse?",
    "Consider the combined impact of maintenance, repair, and reuse in your evaluation."
  ],
  '2.4': [
    "How can the product be designed for easier remanufacturing or refurbishment?",
    "Are components easily accessible for cleaning, inspection, and replacement?",
    "What design features facilitate the restoration of a product to 'like-new' condition?",
  ],
  '2.5': [
    "How can the product be designed for easier recycling of its materials?",
    "Are materials clearly identifiable and separable?",
    "What are the end-of-life scenarios for the product's components?",
  ],
  // Strategy 5 specific guiding questions
  '5.1': [
    "How can the product's aesthetic appeal and emotional connection be enhanced to promote longevity?",
    "What design elements can evoke a sense of timelessness or personal value?",
    "How can the product tell a story or reflect user values?"
  ],
  '5.2': [
    "How can the product be designed to adapt to changing user needs or preferences?",
    "Are there modular components or customizable features?",
    "Can the product's functionality be expanded or reconfigured over time?"
  ],
  '5.3': [
    "How can the product be designed to be easily cleaned and maintained by the user?",
    "Are materials and finishes durable and easy to care for?",
    "What features prevent dirt accumulation or wear and tear?"
  ],
  '5.4': [
    "How can the product be designed to be easily repaired by the user or local services?",
    "Are common wear parts accessible and replaceable?",
    "Is repair information or tools provided or easily obtainable?"
  ],
  '5.5': [
    "How can the product be designed to be easily upgradeability or refurbishment?",
    "Are key components easily swapped out for newer versions?",
    "Can the product be returned to a 'like-new' state through simple processes?"
  ],
  // Strategy 6 specific guiding questions
  '6.1': [
    "How can the product be designed to minimize environmental impact during manufacturing?",
    "Are there opportunities to reduce waste, energy, or water in production?",
    "What manufacturing processes or materials have the highest environmental footprint?"
  ],
  '6.2': [
    "How can the product be designed to minimize environmental impact during transport?",
    "Can the product's size, weight, or packaging be optimized for efficient logistics?",
    "Are there opportunities for local sourcing or production?"
  ],
  '6.3': [
    "How can the product be designed to minimize environmental impact during packaging?",
    "Can packaging materials be reduced, reused, or recycled?",
    "Is the packaging designed to protect the product adequately with minimal material?"
  ],
  // Strategy 7 specific guiding questions
  '7.1': [
    "How can the product be designed to communicate its environmental benefits to users?",
    "Are there clear labels, instructions, or digital interfaces that highlight sustainability features?",
    "How can users be informed about the product's life cycle and end-of-life options?"
  ],
  '7.2': [
    "How can the product be designed to encourage sustainable user behavior?",
    "Does the design promote energy efficiency, water conservation, or responsible disposal?",
    "Are there features that make sustainable choices easy and intuitive for the user?"
  ],
  '7.3': [
    "How can the product be designed to support new sustainable business models?",
    "Does the product facilitate sharing, leasing, or product-as-a-service models?",
    "Are there opportunities for take-back programs or extended producer responsibility?"
  ],
  '7.4': [
    "How can the product be designed to promote a circular economy through its use phase?",
    "Does it encourage sharing, leasing, or product-as-a-service models?",
    "Are there features that facilitate product take-back or extended producer responsibility?"
  ],
  '7.5': [
    "How can the product be designed to enable user participation in its end-of-life management?",
    "Are there clear instructions for disassembly, recycling, or composting?",
    "Does the product provide incentives for responsible disposal or return?"
  ],
  '7.1_7.5_combined': [
    "How can the product be designed to communicate its environmental benefits to users and encourage sustainable behavior?",
    "What features can promote a circular economy and enable user participation in end-of-life management?",
    "Consider the combined impact of communication, user behavior, circular models, and end-of-life participation."
  ],
  '7.6': [
    "How can the product be designed to minimize its environmental impact during the production phase?",
    "Are there opportunities to reduce waste, energy, or water in manufacturing?",
    "What manufacturing processes or materials have the highest environmental footprint?"
  ],
  '7.7': [
    "How can the product be designed to minimize its environmental impact during the distribution phase?",
    "Can the product's size, weight, or packaging be optimized for efficient logistics?",
    "Are there opportunities for local sourcing or production to reduce transport emissions?"
  ],
  '7.8': [
    "How can the product be designed to minimize its environmental impact during the packaging phase?",
    "Can packaging materials be reduced, reused, or recycled effectively?",
    "Is the packaging designed to protect the product adequately with minimal material and environmental burden?"
  ],
  '7.6_7.8_combined': [
    "How can the product be designed to minimize environmental impact across its production, distribution, and packaging phases?",
    "What are the key opportunities to reduce waste, energy, and water in these stages?",
    "Consider the combined impact of manufacturing, transport, and packaging on the product's overall footprint."
  ],
  // Add more placeholder questions for other sub-strategies as needed
  // For now, a generic set will be used if a specific one isn't found
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
                      {/* These items are needed for SelectValue to display the text correctly */}
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

            {/* Sub-strategies section */}
            <div className="space-y-8">
              {strategy.id === '5' || strategy.id === '6' ? ( // Combined logic for Strategy 5 and 6
                <div className="border-t pt-6 first:border-t-0 first:pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Combined Guiding Questions Box (left) */}
                    <div className="bg-orange-50 p-4 rounded-md border border-orange-200 flex flex-col">
                      {/* Removed the h4 header here */}
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

                    {/* Single Answer Textarea (right, stretches to bottom) */}
                    <div className="flex-1 flex flex-col">
                      <Textarea
                        placeholder={`Write your answers for Strategy ${strategy.id} here, covering all its sub-strategies...`}
                        rows={10} // Adjust rows as needed for a "long text box"
                        className="w-full flex-grow min-h-[150px]"
                        value={qualitativeEvaluation[strategy.id]?.subStrategies[`${strategy.id}.1`]?.answer || ''} // Store under X.1
                        onChange={(e) => handleAnswerChange(strategy.id, `${strategy.id}.1`, e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // Existing rendering for other strategies (1, 2, 3, 4)
                <>
                  {(() => {
                    let hasRendered1_4_1_5 = false;
                    let hasRendered2_2_2_3 = false;
                    return strategy.subStrategies.map((subStrategy) => {
                      // Handle 1.4 and 1.5 combination
                      if (strategy.id === '1' && subStrategy.id === '1.5') {
                        return null; // Skip rendering 1.5 separately as it's combined with 1.4
                      }

                      if (strategy.id === '1' && subStrategy.id === '1.4' && !hasRendered1_4_1_5) {
                        hasRendered1_4_1_5 = true;
                        const subStrategy1_4_obj = strategy.subStrategies.find(ss => ss.id === '1.4');
                        const subStrategy1_5_obj = strategy.subStrategies.find(ss => ss.id === '1.5');

                        if (!subStrategy1_4_obj || !subStrategy1_5_obj) return null; // Should not happen if data is consistent

                        const combinedId = '1.4'; // Use 1.4's ID for state management of the combined block
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
                              {/* Guiding Questions Box (left) */}
                              <div className="bg-orange-50 p-4 rounded-md border border-orange-200">
                                <ul className="list-disc list-inside text-app-body-text text-sm space-y-1">
                                  {combinedGuidingQuestions.map((q, idx) => (
                                    <li key={idx}>{q}</li>
                                  ))}
                                </ul>
                              </div>

                              {/* Answer Textarea (right, stretches) */}
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

                      // Handle 2.2 and 2.3 combination
                      if (strategy.id === '2' && subStrategy.id === '2.3') {
                        return null; // Skip rendering 2.3 separately as it's combined with 2.2
                      }

                      if (strategy.id === '2' && subStrategy.id === '2.2' && !hasRendered2_2_2_3) {
                        hasRendered2_2_2_3 = true;
                        const subStrategy2_2_obj = strategy.subStrategies.find(ss => ss.id === '2.2');
                        const subStrategy2_3_obj = strategy.subStrategies.find(ss => ss.id === '2.3');

                        if (!subStrategy2_2_obj || !subStrategy2_3_obj) return null;

                        const combinedId = '2.2'; // Use 2.2's ID for state management of the combined block
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
                              {/* Guiding Questions Box (left) */}
                              <div className="bg-orange-50 p-4 rounded-md border border-orange-200">
                                <ul className="list-disc list-inside text-app-body-text text-sm space-y-1">
                                  {combinedGuidingQuestions.map((q, idx) => (
                                    <li key={idx}>{q}</li>
                                  ))}
                                </ul>
                              </div>

                              {/* Answer Textarea (right, stretches) */}
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

                      // Render other sub-strategies normally
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
                            {/* Guiding Questions Box (left) */}
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

                            {/* Answer Textarea (right, stretches) */}
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