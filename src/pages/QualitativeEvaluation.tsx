"use client";

import React from 'react';
import WipeContentButton from '@/components/WipeContentButton';
import { useLcd } from '@/context/LcdContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label'; // Added this import
import { PriorityLevel } from '@/types/lcd';

const guidingQuestions = [
  "What are the main environmental impacts of the existing product/system?",
  "Which life cycle stages contribute most to these impacts?",
  "Which strategies have the highest potential for improvement in this specific product context?",
  "Are there any constraints (technical, economic, social) that might influence the feasibility of certain strategies?",
  "What are the key performance indicators (KPIs) for success in implementing these strategies?",
];

const QualitativeEvaluation: React.FC = () => {
  const { strategies, qualitativeEvaluation, setQualitativeEvaluation } = useLcd();

  const handlePriorityChange = (strategyId: string, subStrategyId: string | null, value: PriorityLevel) => {
    setQualitativeEvaluation(prev => {
      const newEvaluation = { ...prev };
      if (!newEvaluation[strategyId]) {
        newEvaluation[strategyId] = { priority: 'None', subStrategies: {} };
      }

      if (subStrategyId) {
        newEvaluation[strategyId].subStrategies[subStrategyId] = value;
      } else {
        newEvaluation[strategyId].priority = value;
      }
      return newEvaluation;
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md relative min-h-[calc(100vh-200px)]">
      <h2 className="text-3xl font-bold text-app-header mb-6">Qualitative Evaluation of Existing Products/Systems and Strategic Priorities</h2>
      <p className="text-app-body-text mb-4">
        Use the guiding questions below to help define the priority level for each LCD strategy and sub-strategy.
      </p>

      <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-8">
        <h3 className="text-xl font-semibold text-app-header mb-3">Guiding Questions:</h3>
        <ul className="list-disc list-inside text-app-body-text space-y-1">
          {guidingQuestions.map((q, index) => (
            <li key={index}>{q}</li>
          ))}
        </ul>
      </div>

      <Tabs defaultValue={strategies[0]?.id || "no-strategies"} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          {strategies.map((strategy) => (
            <TabsTrigger key={strategy.id} value={strategy.id}>
              {strategy.id}. {strategy.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {strategies.map((strategy) => (
          <TabsContent key={strategy.id} value={strategy.id} className="mt-6">
            <h3 className="text-2xl font-semibold text-app-header mb-4">{strategy.id}. {strategy.name}</h3>
            <div className="flex items-center gap-4 mb-6">
              <Label htmlFor={`strategy-priority-${strategy.id}`} className="text-app-body-text min-w-[100px]">Strategy Priority:</Label>
              <Select
                value={qualitativeEvaluation[strategy.id]?.priority || 'None'}
                onValueChange={(value: PriorityLevel) => handlePriorityChange(strategy.id, null, value)}
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

            <h4 className="text-xl font-medium text-app-header mb-3">Sub-strategies:</h4>
            <div className="space-y-4">
              {strategy.subStrategies.map((subStrategy) => (
                <div key={subStrategy.id} className="flex items-center gap-4 pl-4">
                  <Label htmlFor={`sub-strategy-priority-${subStrategy.id}`} className="text-app-body-text min-w-[150px]">
                    {subStrategy.id}. {subStrategy.name}:
                  </Label>
                  <Select
                    value={qualitativeEvaluation[strategy.id]?.subStrategies[subStrategy.id] || 'None'}
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