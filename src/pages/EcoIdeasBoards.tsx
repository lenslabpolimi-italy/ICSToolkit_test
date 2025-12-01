"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import StickyNote from '@/components/StickyNote';
import StrategyInsightBox from '@/components/StrategyInsightBox';
import { useLcd } from '@/context/LcdContext';
import { EcoIdea, Strategy } from '@/types/lcd';
import { getStrategyPriorityForDisplay } from '@/utils/lcdUtils';
import { Button } from '@/components/ui/button';
import { PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import ConfirmationDialog from '@/components/ConfirmationDialog';

// Constants for positioning StrategyInsightBoxes and notes
const BOX_HEIGHT = 80; // h-20 for StrategyInsightBox
const NOTE_MIN_HEIGHT = 100; // min-h-[100px] for StickyNote
const NOTE_VERTICAL_MARGIN = 10; // Margin between stacked notes
const NOTE_STACK_OFFSET = NOTE_MIN_HEIGHT + NOTE_VERTICAL_MARGIN;

// These positions are relative to the main content area of EcoIdeasBoards
// They are used to place StrategyInsightBoxes and as reference for confirmed notes.
const insightBoxPositions: { [key: string]: { top: number; left?: string; right?: string } } = {
  '1': { top: 32, left: 'calc(25% - 20px)' }, // Left side
  '2': { top: 32, left: 'calc(75% + 20px)' }, // Right side
  '3': { top: 240, left: 'calc(75% + 20px)' },
  '4': { top: 448, left: 'calc(75% + 20px)' },
  '7': { top: 32, right: 'calc(25% - 20px)' }, // Left side
  '6': { top: 240, right: 'calc(25% - 20px)' },
  '5': { top: 448, right: 'calc(25% - 20px)' },
};

const EcoIdeasBoards: React.FC = () => {
  const {
    strategies,
    ecoIdeas,
    setEcoIdeas,
    currentStrategyId,
    setCurrentStrategyId,
    qualitativeEvaluation,
    radarInsights,
    setRadarInsights,
  } = useLcd();

  const [newNoteText, setNewNoteText] = useState('');
  const [isInsightDialogOpen, setIsInsightDialogOpen] = useState(false);
  const [insightText, setInsightText] = useState(radarInsights[currentStrategyId] || '');
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);

  // Filter ecoIdeas based on the current strategy
  const filteredEcoIdeas = ecoIdeas.filter(
    (idea) => idea.strategyId === currentStrategyId
  );

  // Find the current strategy object
  const currentStrategy = strategies.find(
    (s) => s.id === currentStrategyId
  );

  // Update insight text when currentStrategyId changes
  useEffect(() => {
    setInsightText(radarInsights[currentStrategyId] || '');
  }, [currentStrategyId, radarInsights]);

  const handleAddNote = () => {
    if (!currentStrategyId) {
      toast.error('Please select a strategy first.');
      return;
    }
    const newNote: EcoIdea = {
      id: uuidv4(),
      x: 50, // Default X position
      y: 50, // Default Y position
      text: newNoteText || 'New Idea',
      strategyId: currentStrategyId,
      isConfirmed: false,
    };
    setEcoIdeas((prev) => [...prev, newNote]);
    setNewNoteText('');
    toast.success('New idea added!');
  };

  const handleDragStop = useCallback(
    (id: string, x: number, y: number) => {
      setEcoIdeas((prev) =>
        prev.map((idea) => (idea.id === id ? { ...idea, x, y } : idea))
      );
    },
    [setEcoIdeas]
  );

  const handleTextChange = useCallback(
    (id: string, newText: string) => {
      setEcoIdeas((prev) =>
        prev.map((idea) => (idea.id === id ? { ...idea, text: newText } : idea))
      );
    },
    [setEcoIdeas]
  );

  const handleDelete = useCallback(
    (id: string) => {
      setEcoIdeas((prev) => prev.filter((idea) => idea.id !== id));
      toast.success('Idea deleted!');
    },
    [setEcoIdeas]
  );

  const handleConfirmToggle = useCallback(
    (id: string) => {
      setEcoIdeas((prevEcoIdeas) =>
        prevEcoIdeas.map((idea) => {
          if (idea.id === id) {
            const newIsConfirmed = !idea.isConfirmed;
            let newX = idea.x;
            let newY = idea.y;

            if (newIsConfirmed && idea.strategyId === '2') {
              // Calculate position for confirmed Strategy 2 notes
              // Based on insightBoxPositions['2'] which is { top: 32, left: 'calc(75% + 20px)' }
              // We'll use a reasonable fixed pixel value for the left edge of the notes.
              const baseConfirmedX = 770; // Approximate X position for notes under Strategy 2 box
              const baseConfirmedY = 32 + BOX_HEIGHT + NOTE_VERTICAL_MARGIN; // Y position: box top + box height + margin

              // Count existing confirmed notes for Strategy 2 to stack them
              const confirmedStrategy2NotesCount = prevEcoIdeas.filter(
                (e) => e.strategyId === '2' && e.isConfirmed && e.id !== id
              ).length;

              newX = baseConfirmedX;
              newY = baseConfirmedY + (confirmedStrategy2NotesCount * NOTE_STACK_OFFSET);
            }
            // If unconfirmed, or not Strategy 2, keep current x, y
            return { ...idea, isConfirmed: newIsConfirmed, x: newX, y: newY };
          }
          return idea;
        })
      );
      toast.success('Idea confirmation status updated!');
    },
    [setEcoIdeas]
  );

  const handleNextStrategy = () => {
    const currentIndex = strategies.findIndex((s) => s.id === currentStrategyId);
    if (currentIndex < strategies.length - 1) {
      setCurrentStrategyId(strategies[currentIndex + 1].id);
    }
  };

  const handlePreviousStrategy = () => {
    const currentIndex = strategies.findIndex((s) => s.id === currentStrategyId);
    if (currentIndex > 0) {
      setCurrentStrategyId(strategies[currentIndex - 1].id);
    }
  };

  const handleSaveInsight = () => {
    setRadarInsights((prev) => ({
      ...prev,
      [currentStrategyId]: insightText,
    }));
    setIsInsightDialogOpen(false);
    toast.success('Insight saved!');
  };

  const handleDeleteAllNotes = () => {
    setEcoIdeas((prev) => prev.filter((idea) => idea.strategyId !== currentStrategyId));
    setIsDeleteAllDialogOpen(false);
    toast.success('All ideas for this strategy deleted!');
  };

  const currentStrategyPriority = currentStrategy
    ? getStrategyPriorityForDisplay(currentStrategy, qualitativeEvaluation)
    : 'Low'; // Default if no strategy selected

  const currentStrategyInsightBoxPosition = currentStrategyId
    ? insightBoxPositions[currentStrategyId]
    : undefined;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md relative min-h-[calc(100vh-200px)] font-roboto">
      <h2 className="text-3xl font-palanquin font-semibold text-app-header mb-6">Eco-Ideas Boards</h2>
      <p className="text-app-body-text mb-4">
        Brainstorm and organize your ideas for each strategy. Drag and drop notes, edit their content,
        and confirm the most promising ones to send them to the Evaluation Radar.
      </p>

      <div className="flex items-center justify-between mb-6">
        <Button
          onClick={handlePreviousStrategy}
          disabled={!currentStrategyId || strategies.findIndex((s) => s.id === currentStrategyId) === 0}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ChevronLeft size={16} /> Previous Strategy
        </Button>

        <div className="flex-grow text-center">
          <h3 className="text-xl font-palanquin font-semibold text-app-header">
            {currentStrategy ? `${currentStrategy.id}. ${currentStrategy.name}` : 'Select a Strategy'}
          </h3>
        </div>

        <Button
          onClick={handleNextStrategy}
          disabled={!currentStrategyId || strategies.findIndex((s) => s.id === currentStrategyId) === strategies.length - 1}
          variant="outline"
          className="flex items-center gap-2"
        >
          Next Strategy <ChevronRight size={16} />
        </Button>
      </div>

      {currentStrategy && (
        <div className="relative w-full h-[600px] border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
          {/* Strategy Insight Box */}
          {currentStrategyInsightBoxPosition && (
            <StrategyInsightBox
              strategy={currentStrategy}
              priority={currentStrategyPriority}
              className="absolute"
              style={currentStrategyInsightBoxPosition}
            />
          )}

          {/* Sticky Notes */}
          {filteredEcoIdeas.map((idea) => (
            <StickyNote
              key={idea.id}
              id={idea.id}
              x={idea.x}
              y={idea.y}
              text={idea.text}
              strategyId={idea.strategyId}
              isConfirmed={idea.isConfirmed}
              onDragStop={handleDragStop}
              onTextChange={handleTextChange}
              onDelete={handleDelete}
              onConfirmToggle={handleConfirmToggle}
            />
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="new-note-text" className="text-app-body-text">Add New Idea</Label>
          <div className="flex gap-2 mt-2">
            <Textarea
              id="new-note-text"
              placeholder="Type your new idea here..."
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              className="flex-grow"
              rows={3}
            />
            <Button onClick={handleAddNote} disabled={!currentStrategyId} className="self-start">
              <PlusCircle size={18} className="mr-2" /> Add Idea
            </Button>
          </div>
        </div>

        <div className="flex-1">
          <Label htmlFor="strategy-insight" className="text-app-body-text">Strategy Insight for Radar</Label>
          <div className="flex gap-2 mt-2">
            <Textarea
              id="strategy-insight"
              placeholder="Write key insights for this strategy to appear on the Evaluation Radar..."
              value={insightText}
              onChange={(e) => setInsightText(e.target.value)}
              className="flex-grow"
              rows={3}
              disabled={!currentStrategyId}
            />
            <Button onClick={() => setIsInsightDialogOpen(true)} disabled={!currentStrategyId} className="self-start">
              Save Insight
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          onClick={() => setIsDeleteAllDialogOpen(true)}
          variant="destructive"
          disabled={filteredEcoIdeas.length === 0}
        >
          Delete All Ideas for this Strategy
        </Button>
      </div>

      {/* Insight Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isInsightDialogOpen}
        onClose={() => setIsInsightDialogOpen(false)}
        onConfirm={handleSaveInsight}
        title="Save Strategy Insight?"
        description="Are you sure you want to save this insight? It will be displayed on the Evaluation Radar."
        confirmButtonText="Save"
      />

      {/* Delete All Notes Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteAllDialogOpen}
        onClose={() => setIsDeleteAllDialogOpen(false)}
        onConfirm={handleDeleteAllNotes}
        title="Delete All Ideas?"
        description="Are you sure you want to delete all ideas for this strategy? This action cannot be undone."
        confirmButtonText="Delete All"
        confirmButtonVariant="destructive"
      />
    </div>
  );
};

export default EcoIdeasBoards;