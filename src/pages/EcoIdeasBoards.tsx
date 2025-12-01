"use client";

import React, { useState } from 'react';
import WipeContentButton from '@/components/WipeContentButton';
import { useLcd } from '@/context/LcdContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StickyNote from '@/components/StickyNote';
import EvaluationNote from '@/components/EvaluationNote';
import { PlusCircle } from 'lucide-react';
import { EcoIdea, ConceptType } from '@/types/lcd'; // Import ConceptType
import { toast } from 'sonner';
import { getStrategyPriorityForDisplay, getPriorityTagClasses } from '@/utils/lcdUtils';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Import Select components


const EcoIdeasBoards: React.FC = () => {
  const { strategies, ecoIdeas, setEcoIdeas, qualitativeEvaluation, evaluationNotes, setEvaluationNotes } = useLcd();
  const [selectedStrategyId, setSelectedStrategyId] = useState(strategies[0]?.id || '');
  const [selectedConcept, setSelectedConcept] = useState<ConceptType>('A'); // NEW: State for selected concept

  React.useEffect(() => {
    if (strategies.length > 0 && !selectedStrategyId) {
      setSelectedStrategyId(strategies[0].id);
    }
  }, [strategies, selectedStrategyId]);

  const addStickyNote = () => {
    const newNote: EcoIdea = {
      id: `eco-note-${Date.now()}`,
      text: '',
      strategyId: selectedStrategyId,
      x: 20, // Initial X position relative to the Eco-Ideas board
      y: 20, // Initial Y position relative to the Eco-Ideas board
      isConfirmed: false,
      conceptType: selectedConcept, // NEW: Assign selected concept
    };
    setEcoIdeas(prev => [...prev, newNote]);
    toast.success(`New eco-idea sticky note added for Concept ${selectedConcept}!`);
  };

  const handleEcoIdeaDragStop = (id: string, x: number, y: number) => {
    setEcoIdeas(prev =>
      prev.map(note => (note.id === id ? { ...note, x, y } : note))
    );
  };

  const handleEcoIdeaTextChange = (id: string, newText: string) => {
    setEcoIdeas(prev =>
      prev.map(note => (note.id === id ? { ...note, text: newText } : note))
    );
  };

  const handleEcoIdeaDelete = (id: string) => {
    setEcoIdeas(prev => prev.filter(note => note.id !== id));
    toast.info("Eco-idea sticky note removed.");
  };

  const handleEcoIdeaConfirmToggle = (id: string) => {
    setEcoIdeas(prev =>
      prev.map(note =>
        note.id === id ? { ...note, isConfirmed: !note.isConfirmed } : note
      )
    );
    toast.info("Eco-idea confirmation status updated!");
  };

  const handleEvaluationNoteDragStop = (id: string, x: number, y: number) => {
    setEvaluationNotes(prev =>
      prev.map(note => (note.id === id ? { ...note, x, y } : note))
    );
  };

  const handleEvaluationNoteTextChange = (id: string, newText: string) => {
    setEvaluationNotes(prev =>
      prev.map(note => (note.id === id ? { ...note, text: newText } : note))
    );
  };

  const handleEvaluationNoteDelete = (id: string) => {
    setEvaluationNotes(prev => prev.filter(note => note.id !== id));
    toast.info("Evaluation note removed.");
  };

  // Filter eco-ideas by selected strategy AND selected concept
  const filteredEcoIdeas = ecoIdeas.filter(note => note.strategyId === selectedStrategyId && note.conceptType === selectedConcept);
  const allEvaluationNotes = evaluationNotes;


  return (
    <div className="p-6 bg-white rounded-lg shadow-md relative min-h-[calc(100vh-200px)] font-roboto">
      <h2 className="text-3xl font-palanquin font-semibold text-app-header mb-6">Eco-Ideas Boards</h2>
      <p className="text-app-body-text mb-4">
        Brainstorm and create digital sticky notes with ideas inspired by the LCD strategies and guidelines.
      </p>
      <p className="text-app-body-text mb-8">
        Review evaluation notes from both Concept A and Concept B here.
      </p>

      {/* Evaluation Notes Board - Moved to the top, removed concept selector and add button */}
      <div className="relative min-h-[250px] border border-gray-200 rounded-lg bg-white p-4 mb-8">
        <h4 className="text-lg font-palanquin font-semibold text-app-header mb-4">Evaluation Notes (All Concepts)</h4>
        {allEvaluationNotes.map(note => (
          <EvaluationNote
            key={note.id}
            id={note.id}
            x={note.x}
            y={note.y}
            text={note.text}
            strategyId={note.strategyId}
            conceptType={note.conceptType}
            onDragStop={handleEvaluationNoteDragStop}
            onTextChange={handleEvaluationNoteTextChange}
            onDelete={handleEvaluationNoteDelete}
          />
        ))}
        <WipeContentButton sectionKey="evaluationNotes" label="Wipe Evaluation Notes" className="absolute bottom-4 right-4 bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700" />
      </div>

      {/* Concept Selector for Eco-Ideas */}
      <div className="flex items-center gap-4 mb-8">
        <h3 className="text-xl font-palanquin font-semibold text-app-header">Concept for Eco-Ideas:</h3>
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

      <Tabs value={selectedStrategyId} onValueChange={setSelectedStrategyId} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 h-auto p-2 items-stretch">
          {strategies.map((strategy) => {
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
        {strategies.map((strategy) => (
          <TabsContent key={strategy.id} value={strategy.id} className="mt-6 pt-4">
            <h3 className="text-2xl font-palanquin font-semibold text-app-header mb-4">{strategy.id}. {strategy.name}</h3>

            <div className="relative flex min-h-[400px] p-8 rounded-lg bg-gray-50 overflow-hidden">
              {/* Left Column for Strategy Text */}
              <div className="w-1/2 pr-8">
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

              {/* Right Column for Eco-Ideas Board */}
              <div className="relative w-1/2 pl-8">
                <div
                  className="absolute top-4 right-4 bg-yellow-300 p-2 rounded-md shadow-lg cursor-pointer hover:bg-yellow-400 transition-colors flex items-center justify-center"
                  onClick={addStickyNote}
                  style={{ width: '60px', height: '60px', zIndex: 101 }}
                  title="Drag out a new eco-idea sticky note"
                >
                  <PlusCircle size={32} className="text-gray-700" />
                </div>

                {filteredEcoIdeas.map(note => (
                  <StickyNote
                    key={note.id}
                    id={note.id}
                    x={note.x}
                    y={note.y}
                    text={note.text}
                    strategyId={note.strategyId}
                    subStrategyId={note.subStrategyId}
                    guidelineId={note.guidelineId}
                    isConfirmed={note.isConfirmed}
                    onDragStop={handleEcoIdeaDragStop}
                    onTextChange={handleEcoIdeaTextChange}
                    onDelete={handleEcoIdeaDelete}
                    onConfirmToggle={handleEcoIdeaConfirmToggle}
                  />
                ))}
                <WipeContentButton sectionKey="ecoIdeas" label="Wipe Eco-Ideas" className="absolute bottom-4 right-4 bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700" />
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default EcoIdeasBoards;