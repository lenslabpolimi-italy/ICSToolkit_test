"use client";

import React, { useState } from 'react';
import WipeContentButton from '@/components/WipeContentButton';
import { useLcd } from '@/context/LcdContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StickyNote from '@/components/StickyNote';
import EvaluationNote from '@/components/EvaluationNote';
import { PlusCircle } from 'lucide-react';
import { EcoIdea, ConceptType, RadarEcoIdea } from '@/types/lcd'; // Import RadarEcoIdea
import { toast } from 'sonner';
import { getStrategyPriorityForDisplay, getPriorityTagClasses, insightBoxPositions } from '@/utils/lcdUtils'; // Import insightBoxPositions
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Import Select components


const EcoIdeasBoards: React.FC = () => {
  const { strategies, ecoIdeas, setEcoIdeas, qualitativeEvaluation, evaluationNotes, setEvaluationNotes, setRadarEcoIdeas } = useLcd(); // Get setRadarEcoIdeas
  const [selectedStrategyId, setSelectedStrategyId] = useState(strategies[0]?.id || '');
  const [selectedConcept, setSelectedConcept] = useState<ConceptType>('A');

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
      x: 20,
      y: 20,
      isConfirmed: false,
      conceptType: selectedConcept,
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
    // Also remove from radar if it was confirmed
    setRadarEcoIdeas(prev => prev.filter(radarNote => radarNote.originalEcoIdeaId !== id));
    toast.info("Eco-idea sticky note removed.");
  };

  const handleEcoIdeaConfirmToggle = (id: string) => {
    setEcoIdeas(prevEcoIdeas => {
      const updatedEcoIdeas = prevEcoIdeas.map(note =>
        note.id === id ? { ...note, isConfirmed: !note.isConfirmed } : note
      );

      const toggledNote = updatedEcoIdeas.find(note => note.id === id);

      if (toggledNote) {
        if (toggledNote.isConfirmed) {
          // Calculate initial position for the radar note
          const strategyPosition = insightBoxPositions[toggledNote.strategyId];
          let initialX = 0;
          let initialY = 0;

          // Simple logic to place it near the insight box.
          // This will need more sophisticated calculation if the layout is complex.
          if (strategyPosition) {
            // Convert CSS properties to numbers for calculation
            const top = parseFloat(strategyPosition.top as string || '0');
            const left = parseFloat(strategyPosition.left as string || '0');
            const right = parseFloat(strategyPosition.right as string || '0');

            // Default offset from the insight box
            const offsetX = 20;
            const offsetY = 180; // Place below the insight box (min-h-48 + some margin)

            if (strategyPosition.left) { // For left-aligned boxes (1, 2, 3, 4)
              initialX = left + offsetX;
              if (strategyPosition.transform && (strategyPosition.transform as string).includes('translateX(-50%)')) {
                // For strategy 1, which is centered, adjust X
                initialX = 300 + offsetX; // Approximate center of the radar container + offset
              }
            } else if (strategyPosition.right) { // For right-aligned boxes (5, 6, 7)
              initialX = 800 - right - 200 - offsetX; // Approximate width of radar container - right offset - note width - offset
            }
            initialY = top + offsetY;
          }

          const newRadarEcoIdea: RadarEcoIdea = {
            id: `radar-copy-${toggledNote.id}`, // Unique ID for the radar copy
            originalEcoIdeaId: toggledNote.id,
            text: toggledNote.text,
            strategyId: toggledNote.strategyId,
            conceptType: toggledNote.conceptType,
            x: initialX, // Initial X position on radar board
            y: initialY, // Initial Y position on radar board
          };
          setRadarEcoIdeas(prevRadar => [...prevRadar, newRadarEcoIdea]);
          toast.success("Eco-idea confirmed and copied to Evaluation Radar!");
        } else {
          // Remove from radarEcoIdeas
          setRadarEcoIdeas(prevRadar => prevRadar.filter(radarNote => radarNote.originalEcoIdeaId !== toggledNote.id));
          toast.info("Eco-idea unconfirmed and removed from Evaluation Radar.");
        }
      }
      return updatedEcoIdeas;
    });
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