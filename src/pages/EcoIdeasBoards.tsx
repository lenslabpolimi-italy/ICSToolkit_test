"use client";

import React, { useState } from 'react';
import WipeContentButton from '@/components/WipeContentButton';
import { useLcd } from '@/context/LcdContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StickyNote from '@/components/StickyNote';
import EvaluationNote from '@/components/EvaluationNote';
import { PlusCircle } from 'lucide-react';
import { EcoIdea, ConceptType, EvaluationNote as EvaluationNoteType } from '@/types/lcd';
import { toast } from 'sonner';
import { getStrategyPriorityForDisplay, getPriorityTagClasses } from '@/utils/lcdUtils';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';


const EcoIdeasBoards: React.FC = () => {
  const { strategies, ecoIdeas, setEcoIdeas, qualitativeEvaluation, evaluationNotes, setEvaluationNotes } = useLcd();
  const [selectedStrategyId, setSelectedStrategyId] = useState(strategies[0]?.id || '');
  const [selectedConcept, setSelectedConcept] = useState<ConceptType>('A'); // New state for concept selection

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
    };
    setEcoIdeas(prev => [...prev, newNote]);
    toast.success("New eco-idea sticky note added!");
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

  // Handlers for Evaluation Notes
  const addEvaluationNote = () => {
    if (!selectedStrategyId) {
      toast.error("Please select a strategy first.");
      return;
    }
    const newNote: EvaluationNoteType = {
      id: `eval-note-${Date.now()}`,
      text: '',
      strategyId: selectedStrategyId,
      conceptType: selectedConcept,
      x: 20, // Initial X position relative to the Evaluation Notes board
      y: 20, // Initial Y position relative to the Evaluation Notes board
    };
    setEvaluationNotes(prev => [...prev, newNote]);
    toast.success(`New evaluation note added for Concept ${selectedConcept} - Strategy ${selectedStrategyId}!`);
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

  const filteredEcoIdeas = ecoIdeas.filter(note => note.strategyId === selectedStrategyId);
  const filteredEvaluationNotes = evaluationNotes.filter(note =>
    note.strategyId === selectedStrategyId && note.conceptType === selectedConcept
  );

  const addEvaluationNoteButtonClasses = selectedConcept === 'A'
    ? 'bg-app-concept-a-light hover:bg-app-concept-a-dark'
    : 'bg-app-concept-b-light hover:bg-app-concept-b-dark';

  return (
    <div className="p-6 bg-white rounded-lg shadow-md relative min-h-[calc(100vh-200px)] font-roboto">
      <h2 className="text-3xl font-palanquin font-semibold text-app-header mb-6">Eco-Ideas Boards</h2>
      <p className="text-app-body-text mb-4">
        Brainstorm and create digital sticky notes with ideas inspired by the LCD strategies and guidelines.
      </p>
      <p className="text-app-body-text mb-8">
        Use the "Evaluation Notes" board to review and add specific comments related to the evaluation of Concept {selectedConcept}.
      </p>

      {/* Concept Selector for Evaluation Notes */}
      <div className="flex items-center gap-4 mb-8">
        <Label htmlFor="concept-selector" className="text-xl font-palanquin font-semibold text-app-header">View/Add Evaluation Notes for Concept:</Label>
        <Select
          value={selectedConcept}
          onValueChange={(value: ConceptType) => setSelectedConcept(value)}
        >
          <SelectTrigger id="concept-selector" className="w-[180px]">
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

            <div className="relative flex min-h-[600px] p-8 border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
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

              {/* Right Column for Two Separate Boards */}
              <div className="relative w-1/2 pl-8 border-l border-gray-200 flex flex-col gap-8">
                {/* Eco-Ideas Board */}
                <div className="relative flex-1 border border-gray-200 rounded-lg bg-white p-4">
                  <h4 className="text-lg font-palanquin font-semibold text-app-header mb-4">Eco-Ideas</h4>
                  <div
                    className="absolute top-4 left-4 bg-yellow-300 p-2 rounded-md shadow-lg cursor-pointer hover:bg-yellow-400 transition-colors flex items-center justify-center"
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
                      onDragStop={handleEcoIdeaDragStop}
                      onTextChange={handleEcoIdeaTextChange}
                      onDelete={handleEcoIdeaDelete}
                    />
                  ))}
                </div>

                {/* Evaluation Notes Board */}
                <div className="relative flex-1 border border-gray-200 rounded-lg bg-white p-4">
                  <h4 className="text-lg font-palanquin font-semibold text-app-header mb-4">Evaluation Notes (Concept {selectedConcept})</h4>
                  <div
                    className={cn(
                      "absolute top-4 left-4 p-2 rounded-md shadow-lg cursor-pointer transition-colors flex items-center justify-center",
                      addEvaluationNoteButtonClasses
                    )}
                    onClick={addEvaluationNote}
                    style={{ width: '60px', height: '60px', zIndex: 101 }}
                    title={`Add a new note for Concept ${selectedConcept}`}
                  >
                    <PlusCircle size={32} className="text-white" />
                  </div>
                  {filteredEvaluationNotes.map(note => (
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
                </div>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <WipeContentButton sectionKey="ecoIdeas" />
      <WipeContentButton sectionKey="evaluationNotes" label="Wipe Evaluation Notes" className="absolute bottom-4 right-36 bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700" />
    </div>
  );
};

export default EcoIdeasBoards;