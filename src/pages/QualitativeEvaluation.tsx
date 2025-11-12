"use client";

import React from 'react';
import WipeContentButton from '@/components/WipeContentButton';
import { useLcd } from '@/context/LcdContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PriorityLevel } from '@/types/lcd';

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

  return (
    <div className="p-6 bg-white rounded-lg shadow-md relative min-h-[calc(100vh-200px)] font-roboto">
      <h2 className="text-3xl font-palanquin font-semibold text-app-header mb-6">Qualitative Evaluation of Existing Products/Systems and Strategic Priorities</h2>
      <p className="text-app-body-text mb-8">
        Define the priority level for each LCD strategy and sub-strategy, and answer guiding questions to elaborate on your choices.
      </p>

      <Tabs defaultValue={strategies[0]?.id || "no-strategies"} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 h-auto p-2"> {/* Changed h-10 p-1 to h-auto p-2 */}
          {strategies.map((strategy) => (
            <TabsTrigger key={strategy.id} value={strategy.id} className="whitespace-normal h-auto font-roboto-condensed">
              {strategy.id}. {strategy.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {strategies.map((strategy) => (
          <TabsContent key={strategy.id} value={strategy.id} className="mt-6 pt-4">
            <h3 className="text-2xl font-palanquin font-semibold text-app-header mb-4">{strategy.id}. {strategy.name}</h3>
            <div className="flex items-center gap-4 mb-8">
              <Label htmlFor={`strategy-priority-${strategy.id}`} className="text-app-body-text">Strategy Priority:</Label>
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
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Mid">Mid</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="None">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sub-strategies section */}
            <div className="space-y-8">
              {strategy.subStrategies.map((subStrategy) => (
                <div key={subStrategy.id} className="border-t pt-6 first:border-t-0 first:pt-0">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xl font-palanquin font-medium text-app-header">
                      {subStrategy.id}. {subStrategy.name}
                    </h4>
                    <div className="flex items-center gap-4">
                      <Label htmlFor={`sub-strategy-priority-${subStrategy.id}`} className="text-app-body-text">
                        Priority:
                      </Label>
                      <Select
                        value={qualitativeEvaluation[strategy.id]?.subStrategies[subStrategy.id]?.priority || 'None'}
                        onValueChange={(value: PriorityLevel) => handlePriorityChange(strategy.id, subStrategy.id, value)}
                      >
                        <SelectTrigger id={`sub-strategy-priority-${subStrategy.id}`} className="w-[180px]">
                          <SelectValue placeholder="Select Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Mid">Mid</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="None">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Guiding Questions Box (left) */}
                    <div className="bg-orange-50 p-4 rounded-md border border-orange-200">
                      <h5 className="font-palanquin font-semibold text-app-header mb-2">Guiding Questions:</h5>
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
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <WipeContentButton sectionKey="qualitativeEvaluation" />
    </div>
  );
};

export default QualitativeEvaluation;