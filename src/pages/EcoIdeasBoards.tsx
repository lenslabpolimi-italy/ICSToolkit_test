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

// Define the structure for custom content display
interface DisplayGuideline {
  name: string;
  link: string | null;
}

interface DisplaySubStrategy {
  id: string;
  name: string;
  guidelines: DisplayGuideline[];
}

// Custom content for Strategy 2: Minimising Energy Consumption
const strategy2DisplayContent: DisplaySubStrategy[] = [
  {
    id: '2.1',
    name: 'Minimise energy consumption during pre-production and production',
    guidelines: [
      { name: 'Select materials with low energy intensity', link: null },
      { name: 'Select processing technologies with the lowest energy consumption possible', link: null },
      { name: 'Engage efficient machinery', link: null },
      { name: 'Use heat emitted in certain processes for preheating other process flows', link: null },
      { name: 'Engage pump and motor speed regulators with dynamic configuration', link: null },
      { name: 'Equip the machinery with intelligent power-off utilities', link: null },
      { name: 'Optimise the overall dimensions of the engines', link: null },
      { name: 'Facilitate engine maintenance', link: null },
      { name: 'Define accurately the tolerance parameters', link: null },
      { name: 'Optimise the volumes of required real estate', link: null },
      { name: 'Optimise stocktaking systems', link: null },
      { name: 'Optimise transportation systems and scale down the weight and dimensions of all transportable materials and semi-products', link: null },
      { name: 'Engage efficient general heating, illumination and ventilation in buildings', link: null },
    ]
  },
  {
    id: '2.2',
    name: 'Minimise energy consumption during transportation and storage',
    guidelines: [
      { name: 'Design compact high-density storage products', link: "https://polimi365-my.sharepoint.com/:i:/g/personal/10004374_polimi_it/IQANW2Zuen8pT69n7Z33YlJ9AXOWgEAS2EDxaTEyGBJQiBI?e=pzqh0B" },
      { name: 'Design concentrated products', link: "https://polimi365-my.sharepoint.com/:i:/g/personal/10004374_polimi_it/IQCBXNOA4sRFRI3ovhF3XQg9AY1ctSZs7OXPuQM_fQWbp30?e=8vkzEY" },
      { name: 'Equip products with onsite assembly', link: "https://polimi365-my.sharepoint.com/:i:/g/personal/10004374_polimi_it/IQAK1LM8RxXBQKuZo8qQwxptAU-Qazbb8S2ZEcbcF89gIqk?e=AypnSj" },
      { name: 'Scale down the product weight', link: null },
      { name: 'Scale down the packaging weight', link: "https://polimi365-my.sharepoint.com/:i:/g/personal/10004374_polimi_it/IQC1imMnLkhXQYexzkwKhx7MAdDhxg810bWB8mIkWy_V-Ys?e=QaSk7F" },
      { name: 'Decentralise activities to reduce transportation volumes', link: "https://polimi365-my.sharepoint.com/:i:/g/personal/10004374_polimi_it/IQAotoOuEmKlQYaTKXX0Ui0GAfoItUIGVn1CzlxL38zF224?e=Y83W7O" },
      { name: 'Select local material and energy sources', link: "https://polimi365-my.sharepoint.com/:i:/g/personal/10004374_polimi_it/IQAuquM69P2LQI71dOQPV5ZQATrqkowVN2C524PYGSnK57U?e=lgxTfk" },
    ]
  },
  {
    id: '2.3',
    name: 'Select the most efficient energy consumption systems during use',
    guidelines: [
      { name: 'Design products for collective use', link: "https://polimi365-my.sharepoint.com/:i:/g/personal/10004374_polimi_it/IQCrrfYgPcUiQ4Do0A18R_JKAaTtZe8EoijfIWSTKmmxylA?e=kgwIXl" },
      { name: 'Design for the efficient use of resources needed for operation', link: "https://polimi365-my.sharepoint.com/:i:/g/personal/10004374_polimi_it/IQDajyHxVz0ZQpKplgx7ZddMARl5fzV0OcZqn9yH6Ows9Rw?e=xVvsVH" },
      { name: 'Design for energy-efficient maintenance', link: "https://polimi365-my.sharepoint.com/:i:/g/personal/10004374_polimi_it/IQCSPK7htdTzQZNrNxY8vI2mAXoGAmFsI51TcqkaUvZqlJE?e=yCrDfH" },
      { name: 'Design systems for consumption of passive energy sources', link: "https://polimi365-my.sharepoint.com/:i:/g/personal/10004374_polimi_it/IQDaRHM256onSZsQG5h9baZCAZzksTw1cS2vpa36zPasZiY?e=fMfZvA" },
      { name: 'Adopt high-efficiency energy transformation systems', link: "https://polimi365-my.sharepoint.com/:i:/g/personal/10004374_polimi_it/IQDeT9QhokK5Rqqeg2pPMkHxAcfzhPgAoFWr96G4y3erq44?e=mHepzT" },
      { name: 'Design/adopt more efficient motors', link: "https://polimi365-my.sharepoint.com/:i:/g/personal/10004374_polimi_it/IQCli5w-OfBOTbfefQwNpMuaAfzugwU85XPiJKby0MnMxzw?e=ONKpTE" },
      { name: 'Design/adopt highly efficient energy transmission systems', link: "https://polimi365-my.sharepoint.com/:i:/g/personal/10004374_polimi_it/IQC1PKsX0L2NRr8aEeUKQcvSAZ3_52oQzxzytiRdJAKG2xU?e=JDP0Us" },
      { name: 'Use highly caulked materials and technical components', link: null },
      { name: 'Design systems with insulation or point resources', link: "https://polimi365-my.sharepoint.com/:i:/g/personal/10004374_polimi_it/IQBqhy7VVSepSbt3qPOAKLsrAcJa4dHVOVLc-WpCGn3Vpqo?e=sskHL4" },
      { name: 'Scale down the weight of transportable goods', link: null },
      { name: 'Design energy recovery systems', link: "https://polimi365-my.sharepoint.com/:i:/g/personal/10004374_polimi_it/IQAnCVCY9hc3TbtPvd-n2Ea-AQfCKz2yrBpp_YWD-GZ7srk?e=6OyH2s" },
      { name: 'Design energy-saving systems', link: null },
    ]
  },
  {
    id: '2.4',
    name: 'Enable a variable consumption of energy, to follow demand fluctuations',
    guidelines: [
      { name: 'product default state at minimal energy consumptions', link: null },
      { name: 'Design dynamic energy consumption systems for differentiated operational stages', link: null },
      { name: 'Use sensors to adapt consumption to operational needs', link: "https://polimi365-my.sharepoint.com/:i:/g/personal/10004374_polimi_it/IQBXRcD83tbxToRSZ_mrJKLiAY4eW_FEaupX6_9pmhsG9-c?e=fWGES6" },
      { name: 'Incorporate auto switch-off mechanisms into products', link: "https://polimi365-my.sharepoint.com/:i:/g/personal/10004374_polimi_it/IQDPyoM-xOvQT7oooz8gnbBWAcRUW3TI62HY_srLVUO7tzg?e=7urhN8" },
      { name: 'Program product default state at minimal energy consumption', link: "https://polimi365-my.sharepoint.com/:i:/g/personal/10004374_polimi_it/IQAWu3u185hwSKNFdH5KCbnkAV4KRIocHkyhuJlR2xhs4NM?e=bk9TxV" },
    ]
  },
  {
    id: '2.5',
    name: 'Minimise energy consumption during product development',
    guidelines: [
      { name: 'Engage efficient workplace heating, illumination and ventilation', link: null },
      { name: 'Engage digital tools for communicating with remote working sites', link: null },
    ]
  }
];


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
                {strategy.id === '2' ? (
                  // --- Custom rendering for Strategy 2: Minimising Energy Consumption ---
                  strategy2DisplayContent.map((subStrategy) => (
                    <div key={subStrategy.id} className="mb-6">
                      <h4 className="text-xl font-palanquin font-semibold text-app-header mb-2">
                        {subStrategy.id}. {subStrategy.name}
                      </h4>
                      <ul className="list-none space-y-1">
                        {subStrategy.guidelines.map((guideline, guidelineIndex) => (
                          <li key={`${subStrategy.id}.${guidelineIndex + 1}`} className="text-sm text-gray-600 font-roboto-condensed">
                            {guideline.name}
                            {guideline.link ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <a href={guideline.link} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline ml-2 text-sm font-roboto-condensed font-bold">EXAMPLE</a>
                                </TooltipTrigger>
                                <TooltipContent className="p-0 border-none shadow-lg max-w-xs">
                                  {/* Check if the link is a placeholder or a real image link */}
                                  {(typeof guideline.link === 'string' && guideline.link.startsWith('#example')) ? (
                                    <div className="p-2 text-xs text-gray-700">Image example not available.</div>
                                  ) : (
                                    <img src={guideline.link} alt="Example Preview" className="max-w-full h-auto rounded-md" />
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  // --- Existing rendering logic for Strategy 1 and default rendering for others ---
                  strategy.subStrategies.map((subStrategy, subStrategyIndex) => {
                    // Define variables used in the existing complex logic
                    const isFirstOverallGuideline = strategyIndex === 0 && subStrategyIndex === 0 && 0 === 0;
                    const isSecondOverallGuideline = strategyIndex === 0 && subStrategyIndex === 0 && 1 === 1;
                    const isFourthOverallGuideline = strategyIndex === 0 && subStrategyIndex === 0 && 3 === 3;
                    const isFirstGuidelineOf1_5 = strategyIndex === 0 && subStrategyIndex === 4 && 0 === 0;
                    const isFourthGuidelineOf1_5 = strategyIndex === 0 && subStrategyIndex === 4 && 3 === 3;
                    const isGuideline1_1_1_7 = strategyIndex === 0 && subStrategyIndex === 0 && 6 === 6;
                    const isSubStrategy1_1_4 = strategyIndex === 0 && subStrategyIndex === 3;
                    const isStrategy3 = strategy.id === '3';
                    const isSubStrategy3_1 = subStrategy.id === '3.1';

                    return (
                      <div key={subStrategy.id} className="mb-6">
                        <h4 className="text-xl font-palanquin font-semibold text-app-header mb-2">
                          {subStrategy.id}. {subStrategy.name}
                        </h4>
                        <ul className="list-none space-y-1">
                          {subStrategy.guidelines.map((guideline, guidelineIndex) => {
                            let guidelineLink = "#";
                            
                            // Re-evaluate the index-based checks inside the loop for Strategy 1
                            const isSecondOverallGuideline = strategyIndex === 0 && subStrategyIndex === 0 && guidelineIndex === 1;
                            const isFifthOverallGuideline = strategyIndex === 0 && subStrategyIndex === 0 && guidelineIndex === 4;
                            const isSixthOverallGuideline = strategyIndex === 0 && subStrategyIndex === 0 && guidelineIndex === 5;
                            const isFirstGuidelineOf1_2 = strategyIndex === 0 && subStrategyIndex === 1 && guidelineIndex === 0;
                            const isSecondGuidelineOf1_2 = strategyIndex === 0 && subStrategyIndex === 1 && guidelineIndex === 1; // <-- FIX: Added missing definition
                            const isAvoidPackagingGuideline = guideline.name.toLowerCase().includes('avoid packaging');
                            const isSecondGuidelineOf1_3 = strategyIndex === 0 && subStrategyIndex === 2 && guidelineIndex === 1;
                            const isThirdGuidelineOf1_3 = strategyIndex === 0 && subStrategyIndex === 2 && guidelineIndex === 2;
                            const isFirstGuidelineOf1_4 = strategyIndex === 0 && subStrategyIndex === 3 && guidelineIndex === 0;
                            const isFourthGuidelineOf1_4 = strategyIndex === 0 && subStrategyIndex === 3 && guidelineIndex === 3;
                            const isSecondGuidelineOf1_5 = strategyIndex === 0 && subStrategyIndex === 4 && guidelineIndex === 1;
                            const isThirdGuidelineOf1_5 = strategyIndex === 0 && subStrategyIndex === 4 && guidelineIndex === 2;
                            const isFourthGuidelineOf1_5 = strategyIndex === 0 && subStrategyIndex === 4 && guidelineIndex === 3;
                            const isGuideline1_1_1_7 = strategyIndex === 0 && subStrategyIndex === 0 && guidelineIndex === 6;
                            const isFirstOverallGuideline = strategyIndex === 0 && subStrategyIndex === 0 && guidelineIndex === 0;
                            // const isSubStrategy1_1_4 = strategyIndex === 0 && subStrategyIndex === 3; // Already defined above

                            // NEW: Logic for Strategy 3
                            const isGuideline3_1_1 = isStrategy3 && isSubStrategy3_1 && guidelineIndex === 0;
                            const isGuideline3_1_2 = isStrategy3 && isSubStrategy3_1 && guidelineIndex === 1;
                            const isGuideline3_1_3 = isStrategy3 && isSubStrategy3_1 && guidelineIndex === 2; // NEW: 3.1.3
                            const isGuideline3_1_4 = isStrategy3 && isSubStrategy3_1 && guidelineIndex === 3; // NEW: 3.1.4
                            const isGuideline3_1_5 = isStrategy3 && isSubStrategy3_1 && guidelineIndex === 4;
                            const isGuideline3_1_6 = isStrategy3 && isSubStrategy3_1 && guidelineIndex === 5; // NEW: 3.1.6
                            const isGuideline3_1_7 = isStrategy3 && isSubStrategy3_1 && guidelineIndex === 6;
                            const isGuideline3_1_8 = isStrategy3 && isSubStrategy3_1 && guidelineIndex === 7;
                            const isGuideline3_1_9 = isStrategy3 && isSubStrategy3_1 && guidelineIndex === 8;

                            // NEW: Logic for Strategy 3.2
                            const isSubStrategy3_2 = subStrategy.id === '3.2';
                            const isGuideline3_2_2 = isStrategy3 && isSubStrategy3_2 && guidelineIndex === 1;
                            const isGuideline3_2_4 = isStrategy3 && isSubStrategy3_2 && guidelineIndex === 3;

                            const shouldHideExample3_1 = isGuideline3_1_2 || isGuideline3_1_5 || isGuideline3_1_7 || isGuideline3_1_8 || isGuideline3_1_9 || isGuideline3_2_2 || isGuideline3_2_4; // UPDATED to include 3.2.2 and 3.2.4


                            if (isGuideline3_1_1) {
                              guidelineLink = "https://polimi365-my.sharepoint.com/:i:/g/personal/10004374_polimi_it/IQBpk-nIBgQ9QZhYKveyBLBiAVNOLwJ_3Cn3kYrgUQmuzgs?e=5CZb0I";
                            } else if (isGuideline3_1_3) { // Link for 3.1.3
                              guidelineLink = "https://polimi365-my.sharepoint.com/:i:/g/personal/10004374_polimi_it/IQBo62_XAy94QIcXYOmIk9C_AVtZOTOqwEbuPshfRENbWxI?e=xLSJQ3";
                            } else if (isGuideline3_1_4) { // Link for 3.1.4
                              guidelineLink = "https://polimi365-my.sharepoint.com/:i:/g/personal/10004374_polimi_it/IQC-HOyfk4tOQ67yD8nzvevRAWbik8kOTFSKRRRYrVA81ng?e=J9wvRu";
                            } else if (isGuideline3_1_6) { // Link for 3.1.6
                              guidelineLink = "https://polimi365-my.sharepoint.com/:i:/g/personal/10004374_polimi_it/IQDlWeCcgMNvQKCJeWGJXeALAWbk23FdXk_RadOT1wQpcTo?e=S3BM2y";
                            } else if (shouldHideExample3_1) {
                              guidelineLink = "#"; // Explicitly set to # to ensure no link is shown
                            } else if (isSecondOverallGuideline) {
                              guidelineLink = "https://www.lenslab.polimi.it/wp-content/uploads/2025/07/lettore-IDEA2-english-scaled.png";
                            } else if (isFifthOverallGuideline) {
                              guidelineLink = "https://www.lenslab.polimi.it/wp-content/uploads/2025/07/microstratificata-IDEA2-english-scaled.png";
                            } else if (isSixthOverallGuideline) {
                              guidelineLink = "https://www.lenslab.polimi.it/wp-content/uploads/2025/07/tavolo-IDEA2-english-scaled.png";
                            } else if (isFirstGuidelineOf1_2) {
                              guidelineLink = "https://www.lenslab.polimi.it/wp-content/uploads/2025/07/staffa-IDEA2-english-scaled.png";
                            } else if (isAvoidPackagingGuideline) {
                              guidelineLink = "https://www.lenslab.polimi.it/wp-content/uploads/2025/07/imballaggio-IDEA2-english-scaled.png";
                            } else if (isSecondGuidelineOf1_3) {
                              guidelineLink = "https://www.lenslab.polimi.it/wp-content/uploads/2025/07/imballaggio2-IDEA2-english-scaled.png";
                            } else if (isThirdGuidelineOf1_3) {
                              guidelineLink = "https://www.lenslab.polimi.it/wp-content/uploads/2025/07/packapplique-english-scaled.png";
                            } else if (isFirstGuidelineOf1_4) {
                              guidelineLink = "https://www.lenslab.polimi.it/wp-content/uploads/2025/07/container-IDEA2-english-scaled.png";
                            } else if (isFourthGuidelineOf1_4) {
                              guidelineLink = "https://www.lenslab.polimi.it/wp-content/uploads/2025/07/pulsante-IDEA2-english-scaled.png";
                            } else if (isSecondGuidelineOf1_5) {
                              guidelineLink = "https://polimi365-my.sharepoint.com/:i:/g/personal/10004374_polimi_it/IQCIX0JHC7LBRbsKsFDc_-TkARl69_Oi6zO4Sb_1ChTaSVs?e=vxBcDC";
                            } else if (isThirdGuidelineOf1_5) {
                              guidelineLink = "https://polimi365-my.sharepoint.com/:i:/g/personal/10004374_polimi_it/IQDWbopvW8MyR4zYOzEL_DEyAZh3kDtRqe8CgSudxzXQ2Qs?e=hTm5DP";
                            }

                            let displayGuidelineName = guideline.name;
                            
                            // Logic for overriding displayGuidelineName for 1.1.4 (Strategy 1, SubStrategy 1.4)
                            if (isSubStrategy1_1_4) { 
                              switch (guidelineIndex) {
                                case 0:
                                  displayGuidelineName = "Design for more efficient consumption of operational materials";
                                  break;
                                case 1:
                                  displayGuidelineName = "Design for more efficient use of maintenance materials";
                                  break;
                                case 2:
                                  displayGuidelineName = "Engage digital support systems with dynamic configuration";
                                  break;
                                case 3:
                                  displayGuidelineName = "Design variable material consumption systems for different operating requirements";
                                  break;
                                case 4:
                                  guidelineLink = "https://www.lenslab.polimi.it/wp-content/uploads/2025/07/lavatrcie-IDEA2-english-scaled.png";
                                  displayGuidelineName = "Use of sensors to adjust material consumption to operational requirements";
                                  break;
                                case 5:
                                  displayGuidelineName = "Set the product's default state at minimal materials consumption";
                                  break;
                                case 6:
                                  displayGuidelineName = "Facilitate the user to reduce material consumption";
                                  break;
                                default:
                                  break;
                              }
                            }

                            // Updated condition to hide generic EXAMPLE for 1.1.1.1, 1.1.1.4, 1.1.1.7, 1.1.2.2, and 1.1.5.1, 1.1.5.4, AND the new 3.1 guidelines
                            const shouldHideGenericExample = isSubStrategy1_1_4 || isGuideline1_1_1_7 || isSecondGuidelineOf1_2 || isFirstOverallGuideline || isFourthOverallGuideline || isFirstGuidelineOf1_5 || isFourthGuidelineOf1_5 || shouldHideExample3_1;

                            return (
                              <li key={guideline.id} className="text-sm text-gray-600 font-roboto-condensed">
                                {displayGuidelineName}
                                {guidelineLink !== "#" && !shouldHideGenericExample ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <a href={guidelineLink} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline ml-2 text-sm font-roboto-condensed font-bold">EXAMPLE</a>
                                    </TooltipTrigger>
                                    <TooltipContent className="p-0 border-none shadow-lg max-w-xs">
                                      {/* Check if the link is a placeholder or a real image link */}
                                      {(typeof guidelineLink === 'string' && guidelineLink.startsWith('#example')) ? (
                                        <div className="p-2 text-xs text-gray-700">Image example not available.</div>
                                      ) : (
                                        <img src={guidelineLink} alt="Example Preview" className="max-w-full h-auto rounded-md" />
                                      )}
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
                  })
                )}

                {/* Injecting Sub-Strategy 1.6: Minimise material consumption during the product development phase */}
                {strategyIndex === 0 && (
                  <div className="mb-6">
                    <h4 className="text-xl font-palanquin font-semibold text-app-header mb-2">
                      1.6. Minimise material consumption during the product development phase
                    </h4>
                    <ul className="list-none space-y-1">
                      <li className="text-sm text-gray-600 font-roboto-condensed">
                        Minimise the consumption of stationery goods and their packages
                      </li>
                      <li className="text-sm text-gray-600 font-roboto-condensed">
                        Engage digital tools in designing, modelling and prototyping
                      </li>
                      <li className="text-sm text-gray-600 font-roboto-condensed">
                        Engage digital tools for documentation, communication and presentation
                      </li>
                    </ul>
                  </div>
                )}
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