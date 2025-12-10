"use client";

import React, { useState } from 'react';
import WipeContentButton from '@/components/WipeContentButton';
import { useLcd } from '@/context/LcdContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StickyNote from '@/components/StickyNote';
import EvaluationNote from '@/components/EvaluationNote';
import { PlusCircle } from 'lucide-react';
import { EcoIdea } from '@/types/lcd';
import { toast } from 'sonner';
import { getStrategyPriorityForDisplay, getPriorityTagClasses } from '@/utils/lcdUtils';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const EcoIdeasBoards: React.FC = () => {
  const { strategies, ecoIdeas, setEcoIdeas, qualitativeEvaluation, evaluationNotes, setEvaluationNotes } = useLcd();
  const [selectedStrategyId, setSelectedStrategyId] = useState(strategies[0]?.id || '');

  React.useEffect(() => {
    if (strategies.length > 0 && !selectedStrategyId) {
      setSelectedStrategyId(strategies[0].id);
    }
  }, [strategies, selectedStrategyId]);

  const addStickyNote = () => {
    // Generate random offsets for x and y to prevent overlapping
    // Increased max offset to 200px for better separation
    const offsetX = Math.floor(Math.random() * 200); 
    const offsetY = Math.floor(Math.random() * 200); 

    const newNote: EcoIdea = {
      id: `eco-note-${Date.now()}`,
      text: '',
      strategyId: selectedStrategyId,
      x: 20 + offsetX, // Initial X position relative to the Eco-Ideas board with offset
      y: 20 + offsetY, // Initial Y position relative to the Eco-Ideas board with offset
      isConfirmed: false,
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

  const handleEcoIdeaConfirmToggle = (id: string) => {
    setEcoIdeas(prev =>
      prev.map(note => {
        if (note.id === id) {
          const newConfirmedStatus = !note.isConfirmed;
          if (newConfirmedStatus) {
            toast.success("Promising idea added to the radar");
          } else {
            toast.info("Eco-idea unconfirmed.");
          }
          return { ...note, isConfirmed: newConfirmedStatus };
        }
        return note;
      })
    );
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
  const allEvaluationNotes = evaluationNotes;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md relative font-roboto">
      <h2 className="text-3xl font-palanquin font-semibold text-app-header mb-6">Eco-Ideas Boards</h2>
      <p className="text-app-body-text mb-4">
        Brainstorm and create digital sticky notes with ideas inspired by the LCD strategies and guidelines.
      </p>
      <p className="text-app-body-text mb-8">
        Review evaluation notes from both Concept A and Concept B here.
      </p>

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
        {strategies.map((strategy, strategyIndex) => (
          <TabsContent key={strategy.id} value={strategy.id} className="mt-6 pt-4">
            <h3 className="text-2xl font-palanquin font-semibold text-app-header mb-4">{strategy.id}. {strategy.name}</h3>

            <div className="relative flex min-h-[400px] p-8 rounded-lg bg-gray-50 overflow-hidden">
              {/* Left Column for Strategy Text and Eco-Ideas */}
              <div className="w-1/2 pr-8">
                {strategy.subStrategies.map((subStrategy, subStrategyIndex) => {
                  // Skip rendering 1.5 as it is combined with 1.4 in the Qualitative Evaluation, 
                  // but here we render all sub-strategies individually.
                  // However, we need to adjust the guideline linking logic based on the new structure.

                  return (
                    <div key={subStrategy.id} className="mb-6">
                      <h4 className="text-xl font-palanquin font-semibold text-app-header mb-2">
                        {subStrategy.id}. {subStrategy.name}
                      </h4>
                      <ul className="list-none space-y-1">
                        {subStrategy.guidelines.map((guideline, guidelineIndex) => {
                          let guidelineLink = "#";
                          let displayGuidelineName = guideline.name;
                          let shouldHideGenericExample = false;

                          // Strategy 1: Minimising Materials Consumption
                          if (strategy.id === '1') {
                            // Sub-strategy 1.1: Minimise material consumption during production
                            if (subStrategy.id === '1.1') {
                              switch (guidelineIndex) {
                                case 0: // Design for dematerialisation (1.1.1)
                                  guidelineLink = "https://www.lenslab.polimi.it/wp-content/uploads/2025/07/ascensore-IDEA2-english-scaled.png";
                                  break;
                                case 1: // Design for miniaturisation (1.1.2)
                                  guidelineLink = "https://www.lenslab.polimi.it/wp-content/uploads/2025/07/lettore-IDEA2-english-scaled.png";
                                  break;
                                case 3: // Design for multi-functionality (1.1.4)
                                  guidelineLink = "https://www.lenslab.polimi.it/wp-content/uploads/2025/07/jeans-IDEA2-english-scaled.png";
                                  break;
                                case 4: // Design for material substitution (1.1.5)
                                  guidelineLink = "https://www.lenslab.polimi.it/wp-content/uploads/2025/07/microstratificata-IDEA2-english-scaled.png";
                                  break;
                                case 5: // Design for material efficiency (1.1.6)
                                  guidelineLink = "https://www.lenslab.polimi.it/wp-content/uploads/2025/07/tavolo-IDEA2-english-scaled.png";
                                  break;
                                case 6: // Design for material reduction (1.1.7)
                                  shouldHideGenericExample = true; // No specific link provided for 1.1.7
                                  break;
                              }
                            } 
                            // Sub-strategy 1.2: Minimise material consumption during distribution
                            else if (subStrategy.id === '1.2') {
                              switch (guidelineIndex) {
                                case 0: // Design for reduced weight and volume (1.2.1)
                                  guidelineLink = "https://www.lenslab.polimi.it/wp-content/uploads/2025/07/staffa-IDEA2-english-scaled.png";
                                  break;
                                case 1: // Design for efficient transport (1.2.2)
                                  shouldHideGenericExample = true; // No specific link provided for 1.2.2
                                  break;
                              }
                            } 
                            // Sub-strategy 1.3: Minimise material consumption during packaging
                            else if (subStrategy.id === '1.3') {
                              switch (guidelineIndex) {
                                case 0: // Avoid packaging (1.3.1)
                                  guidelineLink = "https://www.lenslab.polimi.it/wp-content/uploads/2025/07/imballaggio-IDEA2-english-scaled.png";
                                  break;
                                case 1: // Design for reduced packaging material (1.3.2)
                                  guidelineLink = "https://www.lenslab.polimi.it/wp-content/uploads/2025/07/imballaggio2-IDEA2-english-scaled.png";
                                  break;
                                case 2: // Design for reusable packaging (1.3.3)
                                  guidelineLink = "https://www.lenslab.polimi.it/wp-content/uploads/2025/07/packapplique-english-scaled.png";
                                  break;
                              }
                            } 
                            // Sub-strategy 1.4: Minimise material consumption during use
                            else if (subStrategy.id === '1.4') {
                              switch (guidelineIndex) {
                                case 0: // Design for more efficient consumption of operational materials (1.4.1)
                                  displayGuidelineName = "Design for more efficient consumption of operational materials";
                                  guidelineLink = "https://www.lenslab.polimi.it/wp-content/uploads/2025/07/container-IDEA2-english-scaled.png";
                                  break;
                                case 1: // Design for more efficient use of maintenance materials (1.4.2)
                                  displayGuidelineName = "Design for more efficient use of maintenance materials";
                                  shouldHideGenericExample = true;
                                  break;
                                case 2: // Engage digital support systems with dynamic configuration (1.4.3)
                                  displayGuidelineName = "Engage digital support systems with dynamic configuration";
                                  shouldHideGenericExample = true;
                                  break;
                                case 3: // Design variable material consumption systems for different operating requirements (1.4.4)
                                  displayGuidelineName = "Design variable material consumption systems for different operating requirements";
                                  guidelineLink = "https://www.lenslab.polimi.it/wp-content/uploads/2025/07/pulsante-IDEA2-english-scaled.png";
                                  break;
                                case 4: // Use of sensors to adjust material consumption to operational requirements (1.4.5)
                                  displayGuidelineName = "Use of sensors to adjust material consumption to operational requirements";
                                  guidelineLink = "https://www.lenslab.polimi.it/wp-content/uploads/2025/07/lavatrcie-IDEA2-english-scaled.png";
                                  break;
                                case 5: // Set the product's default state at minimal materials consumption (1.4.6)
                                  displayGuidelineName = "Set the product's default state at minimal materials consumption";
                                  shouldHideGenericExample = true;
                                  break;
                                case 6: // Facilitate the user to reduce material consumption (1.4.7)
                                  displayGuidelineName = "Facilitate the user to reduce material consumption";
                                  shouldHideGenericExample = true;
                                  break;
                              }
                            }
                            // Sub-strategy 1.5: Minimise material consumption during maintenance (No specific links needed, use default)
                            else if (subStrategy.id === '1.5') {
                                shouldHideGenericExample = true;
                            }
                            // Sub-strategy 1.6: Minimise material consumption during the product development phase
                            else if (subStrategy.id === '1.6') {
                                shouldHideGenericExample = true;
                            }
                          }
                          
                          // For all other strategies (2-7), use default behavior (no specific links/renaming)
                          if (strategy.id !== '1') {
                            shouldHideGenericExample = true;
                          }


                          return (
                            <li key={guideline.id} className="text-sm text-gray-600 font-roboto-condensed">
                              {displayGuidelineName}
                              {guidelineLink !== "#" && !shouldHideGenericExample ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <a href={guidelineLink} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline ml-2 text-sm font-roboto-condensed font-bold">EXAMPLE</a>
                                  </TooltipTrigger>
                                  <TooltipContent className="p-0 border-none shadow-lg max-w-xs">
                                    <img src={guidelineLink} alt="Example Preview" className="max-w-full h-auto rounded-md" />
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                !shouldHideGenericExample && (
                                  <a href={guidelineLink} className="text-orange-500 hover:underline ml-2 text-sm font-roboto-condensed font-bold">EXAMPLE</a>
                                )
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
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
              </div>
              {/* Wipe Eco-Ideas button moved here, relative to the full-width container */}
              <WipeContentButton sectionKey="ecoIdeas" label="Wipe Eco-Ideas" className="bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700" />
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Moved Evaluation Notes (All Concepts) to the bottom */}
      <div className="relative min-h-[250px] border border-gray-200 rounded-lg bg-white p-4 mt-8">
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
        <WipeContentButton sectionKey="evaluationNotes" label="Wipe Evaluation Notes" className="bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700" />
      </div>
    </div>
  );
};

export default EcoIdeasBoards;