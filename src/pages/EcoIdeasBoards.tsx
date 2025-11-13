"use client";

import React, { useState } from 'react';
import WipeContentButton from '@/components/WipeContentButton';
import { useLcd } from '@/context/LcdContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StickyNote from '@/components/StickyNote'; // Import the new StickyNote component
import { PlusCircle } from 'lucide-react'; // Keeping imports for now, even if UI is removed
import { EcoIdea } from '@/types/lcd';
import { toast } from 'sonner';
import { getStrategyPriorityForDisplay, getPriorityTagClasses } from '@/utils/lcdUtils'; // Import new utilities
import { cn } from '@/lib/utils'; // Import cn for conditional class merging

const EcoIdeasBoards: React.FC = () => {
  const { strategies, ecoIdeas, setEcoIdeas, qualitativeEvaluation } = useLcd(); // Added qualitativeEvaluation
  const [selectedStrategyId, setSelectedStrategyId] = useState(strategies[0]?.id || '');

  React.useEffect(() => {
    if (strategies.length > 0 && !selectedStrategyId) {
      setSelectedStrategyId(strategies[0].id);
    }
  }, [strategies, selectedStrategyId]);

  const addStickyNote = () => {
    const newNote: EcoIdea = {
      id: `note-${Date.now()}`,
      text: '',
      strategyId: selectedStrategyId,
      x: 50, // Initial X position (relative to the canvas)
      y: 50, // Initial Y position (relative to the canvas)
    };
    setEcoIdeas(prev => [...prev, newNote]);
    toast.success("New sticky note added!");
  };

  const handleNoteDragStop = (id: string, x: number, y: number) => {
    setEcoIdeas(prev =>
      prev.map(note => (note.id === id ? { ...note, x, y } : note))
    );
  };

  const handleNoteTextChange = (id: string, newText: string) => {
    setEcoIdeas(prev =>
      prev.map(note => (note.id === id ? { ...note, text: newText } : note))
    );
  };

  const handleNoteDelete = (id: string) => {
    setEcoIdeas(prev => prev.filter(note => note.id !== id));
    toast.info("Sticky note removed.");
  };

  const filteredNotes = ecoIdeas.filter(note => note.strategyId === selectedStrategyId);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md relative min-h-[calc(100vh-200px)] font-roboto">
      <h2 className="text-3xl font-palanquin font-semibold text-app-header mb-6">Eco-Ideas Boards</h2>
      <p className="text-app-body-text mb-8">
        Brainstorm and create digital sticky notes with ideas inspired by the LCD strategies and guidelines.
      </p>

      <Tabs value={selectedStrategyId} onValueChange={setSelectedStrategyId} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 h-auto p-2 items-stretch">
          {strategies.map((strategy) => {
            const displayPriority = getStrategyPriorityForDisplay(strategy, qualitativeEvaluation);
            const tagClasses = getPriorityTagClasses(displayPriority);
            return (
              <TabsTrigger
                key={strategy.id}
                value={strategy.id}
                className={cn(
                  "whitespace-normal h-auto font-roboto-condensed flex items-center justify-center text-center relative pt-3 pb-5", // Adjusted padding
                )}
              >
                {strategy.id}. {strategy.name}
                <span className={cn(
                  "absolute bottom-1.5 right-1.5 text-xs font-roboto-condensed px-1 rounded-sm", // Adjusted bottom position
                  tagClasses
                )}>
                  {displayPriority}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        {strategies.map((strategy) => (
          <TabsContent key={strategy.id} value={strategy.id} className="mt-6 pt-4">
            <h3 className="text-2xl font-palanquin font-semibold text-app-header mb-4">{strategy.id}. {strategy.name}</h3>

            {/* The "large blank canvas" area */}
            <div className="relative flex flex-col items-center justify-start min-h-[400px] p-8 border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
              {/* Stack of infinite digital sticky notes */}
              <div
                className="absolute top-4 left-4 bg-yellow-300 p-2 rounded-md shadow-lg cursor-pointer hover:bg-yellow-400 transition-colors flex items-center justify-center"
                onClick={addStickyNote}
                style={{ width: '60px', height: '60px', zIndex: 101 }}
                title="Drag out a new sticky note"
              >
                <PlusCircle size={32} className="text-gray-700" />
              </div>

              <div className="w-full max-w-3xl text-center"> {/* Centrally aligned content */}
                {strategy.subStrategies.map((subStrategy) => (
                  <div key={subStrategy.id} className="mb-6">
                    <h4 className="text-xl font-palanquin font-semibold text-app-header mb-2">
                      {subStrategy.id}. {subStrategy.name}
                    </h4>
                    <ul className="list-none space-y-1">
                      {subStrategy.guidelines.map((guideline) => (
                        <li key={guideline.id} className="text-sm text-gray-600 font-roboto-condensed">
                          {guideline.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Render existing sticky notes */}
              {filteredNotes.map(note => (
                <StickyNote
                  key={note.id}
                  id={note.id}
                  x={note.x}
                  y={note.y}
                  text={note.text}
                  strategyId={note.strategyId}
                  subStrategyId={note.subStrategyId}
                  guidelineId={note.guidelineId}
                  onDragStop={handleNoteDragStop}
                  onTextChange={handleNoteTextChange}
                  onDelete={handleNoteDelete}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <WipeContentButton sectionKey="ecoIdeas" />
    </div>
  );
};

export default EcoIdeasBoards;