import { Strategy, QualitativeEvaluationData, PriorityLevel } from '@/types/lcd';

/**
 * Calculates the display priority for a given strategy.
 * For strategies 5, 6, and 7, it uses their direct priority.
 * For strategies 1-4, it calculates the highest priority among their sub-strategies.
 */
export const getStrategyPriorityForDisplay = (
  strategy: Strategy,
  qualitativeEvaluation: QualitativeEvaluationData
): PriorityLevel => {
  // For strategies 5, 6, and 7, use their direct priority from the qualitative evaluation
  if (['5', '6', '7'].includes(strategy.id)) {
    return qualitativeEvaluation[strategy.id]?.priority || 'None';
  }

  // For strategies 1-4, calculate the highest priority among their sub-strategies
  const priorityOrder: Record<PriorityLevel, number> = {
    'None': 0,
    'Low': 1,
    'Mid': 2,
    'High': 3,
  };

  let highestPriority: PriorityLevel = 'None';
  let highestScore = 0;

  // Iterate through all sub-strategies to find the highest priority.
  // The qualitativeEvaluation context stores combined priorities (e.g., 1.4 for 1.4/1.5)
  // under the primary sub-strategy ID, so this iteration correctly picks them up.
  strategy.subStrategies.forEach(sub => {
    const subStrategyId = sub.id;
    const subPriority = qualitativeEvaluation[strategy.id]?.subStrategies[subStrategyId]?.priority || 'None';
    const subScore = priorityOrder[subPriority];

    if (subScore > highestScore) {
      highestScore = subScore;
      highestPriority = subPriority;
    }
  });
  return highestPriority;
};

/**
 * Returns Tailwind CSS classes and display text for a priority tag based on the given priority level.
 */
export const getPriorityTagClasses = (priority: PriorityLevel) => {
  let displayText: string;
  let classes: string;

  switch (priority) {
    case 'High':
      displayText = 'High priority';
      classes = 'bg-red-600 text-white';
      break;
    case 'Mid':
      displayText = 'Mid priority';
      classes = 'bg-orange-400 text-white'; // Changed to orange
      break;
    case 'Low':
    displayText = 'Low priority';
    classes = 'bg-yellow-300 text-gray-800'; // Changed to yellow with dark text
    break;
    case 'None':
    default:
      displayText = 'No priority';
      classes = 'bg-gray-300 text-gray-700';
      break;
  }
  return { displayText, classes };
};

// Define positions for StrategyInsightBox components relative to the radar container (h-[800px])
export const insightBoxPositions: { [key: string]: React.CSSProperties } = {
  // Strategy 1 box positioned at the top center of the radar chart container
  '1': { top: '0px', left: '50%', transform: 'translateX(-50%)' },

  // Right side of the radar chart
  '2': { top: '148px', left: 'calc(75% + 20px)' },
  '3': { top: '348px', left: 'calc(75% + 20px)' },
  '4': { top: '548px', left: 'calc(75% + 20px)' },

  // Left side of the radar chart
  '7': { top: '148px', right: 'calc(75% + 20px)' },
  '6': { top: '348px', right: 'calc(75% + 20px)' },
  '5': { top: '548px', right: 'calc(75% + 20px)' },
};

// Define initial positions for RadarEcoIdeaNote components
// These are approximate pixel values relative to the h-[800px] container, assuming max-w-7xl (1280px)
// Positions are calculated to be 20px below the bottom of their respective StrategyInsightBox
export const radarEcoIdeaNoteInitialPositions: { [key: string]: { x: number; y: number } } = {
  '1': { x: 544, y: 212 }, // Centered (1280/2 - 192/2), 20px below 192px height box at top:0
  '2': { x: 980, y: 360 }, // 20px below 192px height box at top:148px, left:980px
  '3': { x: 980, y: 560 }, // 20px below 192px height box at top:348px, left:980px
  '4': { x: 980, y: 760 }, // 20px below 192px height box at top:548px, left:980px
  '7': { x: 12, y: 360 },  // 20px below 192px height box at top:148px, left:12px
  '6': { x: 12, y: 560 },  // 20px below 192px height box at top:348px, left:12px
  '5': { x: 12, y: 760 },  // 20px below 192px height box at top:548px, left:12px
};