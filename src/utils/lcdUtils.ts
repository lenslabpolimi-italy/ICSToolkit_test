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
  // Strategy 1 box positioned above the radar chart
  '1': { top: '-100px', left: '50%', transform: 'translateX(-50%)' },

  // Right side of the radar chart
  '2': { top: '148px', left: 'calc(75% + 20px)' },
  '3': { top: '348px', left: 'calc(75% + 20px)' },
  '4': { top: '548px', left: 'calc(75% + 20px)' },

  // Left side of the radar chart
  '7': { top: '148px', right: 'calc(75% + 20px)' },
  '6': { top: '348px', right: 'calc(75% + 20px)' },
  '5': { top: '548px', right: 'calc(75% + 20px)' },
};

// Define initial positions for RadarEcoIdeaNote components relative to the h-[800px] container (max-w-7xl = 1280px)
// These positions are chosen to be near their respective StrategyInsightBox components,
// with explicit separation for Concept A and Concept B.
export const radarEcoIdeaNoteInitialPositions: { 
  [key: string]: { 
    A: { x: number; y: number }; 
    B: { x: number; y: number }; 
  } 
} = {
  // Strategy 1 (Top center)
  // Insight box left edge: 496px. Insight box right edge: 784px. Center: 640px. Note width: 192px.
  // Concept A: Left of center. x = 640 - (192/2) - 100 = 444px
  // Concept B: Right of center. x = 640 - (192/2) + 100 = 644px
  '1': { A: { x: 444, y: 112 }, B: { x: 644, y: 112 } },

  // Strategies 2, 3, 4 (Right side)
  // Insight box starts at 980px. Note width: 192px.
  // Concept A: To the left of insight box. x = 980 - 192 - 20 = 768px
  // Concept B: Further left, closer to radar. x = 768 - 192 - 50 = 526px
  '2': { A: { x: 768, y: 188 }, B: { x: 526, y: 188 } },
  '3': { A: { x: 768, y: 388 }, B: { x: 526, y: 388 } },
  '4': { A: { x: 768, y: 588 }, B: { x: 526, y: 588 } },

  // Strategies 5, 6, 7 (Left side)
  // Insight box starts at 300px. Insight box width: 288px. Note width: 192px.
  // Concept A: To the right of insight box. x = 300 + 288 + 20 = 608px
  // Concept B: Further right, closer to radar. x = 608 + 192 + 50 = 850px
  '7': { A: { x: 608, y: 188 }, B: { x: 850, y: 188 } },
  '6': { A: { x: 608, y: 388 }, B: { x: 850, y: 388 } },
  '5': { A: { x: 608, y: 588 }, B: { x: 850, y: 588 } },
};