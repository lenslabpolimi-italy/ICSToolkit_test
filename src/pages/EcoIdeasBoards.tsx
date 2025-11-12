"use client";

import React, { useState } from 'react';
import WipeContentButton from '@/components/WipeContentButton';
import { useLcd } from '@/context/LcdContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { EcoIdea } from '@/types/lcd';
import { toast } from 'sonner';

const EcoIdeasBoards: React.FC = () => {
  const { strategies, ecoIdeas, setEcoIdeas } = useLcd();
  const [newIdeaText, setNewIdeaText] = useState('');
  const [selectedStrategyId, setSelectedStrategyId] = useState(strategies[0]?.id || '');

  React.useEffect(() => {
    if (strategies.length > 0 && !selectedStrategyId) {
      setSelectedStrategyId(strategies[0].id);
    }
  }, [strategies, selectedStrategyId]);

  const addIdea = (strategyId: string, subStrategyId?: string, guidelineId?: string) => {
    if (newIdeaText.trim() === '') {
      toast.error("Idea cannot be empty.");
      return;
    }
    const newIdea: EcoIdea = {
      id: `idea-${Date.now()}`,
      text: newIdeaText,
      strategyId,
      subStrategyId,
      guidelineId,
    };
    setEcoIdeas(prev => [...prev, newIdea]);
    setNewIdeaText('');
    toast.success("Idea added!");
  };

  const deleteIdea = (id: string) => {
    setEcoIdeas(prev => prev.filter(idea => idea.id !== id));
    toast.info("Idea removed.");
  };

  const filteredIdeas = ecoIdeas.filter(idea => idea.strategyId === selectedStrategyId);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md relative min-h-[calc(100vh-200px)] font-roboto">
      <h2 className="text-3xl font-palanquin font-semibold text-app-header mb-6">Eco-Ideas Boards</h2>
      <p className="text-app-body-text mb-8">
        Brainstorm and create digital sticky notes with ideas inspired by the LCD strategies and guidelines.
      </p>

      <Tabs value={selectedStrategyId} onValueChange={setSelectedStrategyId} className="w-full">
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

            <div className="mb-6 p-4 border rounded-md bg-gray-50">
              <h4 className="text-xl font-palanquin font-medium text-app-header mb-3">Add a New Idea:</h4>
              <Textarea
                placeholder="Type your eco-idea here..."
                value={newIdeaText}
                onChange={(e) => setNewIdeaText(e.target.value)}
                rows={3}
                className="mb-3"
              />
              <Button onClick={() => addIdea(strategy.id)} className="bg-app-accent hover:bg-app-accent/90 text-white">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Idea
              </Button>
            </div>

            <h4 className="text-xl font-palanquin font-medium text-app-header mb-3">Your Ideas for this Strategy:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIdeas.length === 0 ? (
                <p className="text-app-body-text col-span-full">No ideas yet for this strategy. Start brainstorming!</p>
              ) : (
                filteredIdeas.map((idea) => (
                  <div key={idea.id} className="bg-yellow-100 border border-yellow-300 p-4 rounded-md shadow-sm relative">
                    <p className="text-sm text-gray-700 mb-2">{idea.text}</p>
                    <div className="text-xs text-gray-500">
                      {idea.subStrategyId && <p>Sub-strategy: {idea.subStrategyId}</p>}
                      {idea.guidelineId && <p>Guideline: {idea.guidelineId}</p>}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteIdea(idea.id)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <WipeContentButton sectionKey="ecoIdeas" />
    </div>
  );
};

export default EcoIdeasBoards;