import { Strategy, SubStrategy, Guideline } from '@/types/lcd';

export async function parseLcdStrategies(filePath: string): Promise<Strategy[]> {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${filePath}: ${response.statusText}`);
    }
    const text = await response.text();
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    const strategies: Strategy[] = [];
    let currentStrategy: Strategy | null = null;
    let currentSubStrategy: SubStrategy | null = null;
    let guidelineRawIndex = 0; // Tracks the raw index of guidelines within the current sub-strategy

    // Guidelines to exclude by their 1-based raw index under sub-strategy 3.2
    // Excluding the 2nd, 5th, 7th, 8th, and 9th guidelines under 3.2
    const exclusionMap: { [subStrategyId: string]: number[] } = {
      '3.2': [2, 5, 7, 8, 9]
    };

    lines.forEach(line => {
      if (line.match(/^\d+\./) && !line.match(/^\d+\.\d+\./)) {
        // This is a main strategy (e.g., "1.Strategy name")
        const [idNum, name] = line.split('.', 2);
        currentStrategy = {
          id: idNum,
          name: name.trim(),
          subStrategies: [],
        };
        strategies.push(currentStrategy);
        currentSubStrategy = null; // Reset sub-strategy
        guidelineRawIndex = 0; // Reset raw index counter
      } else if (line.match(/^\d+\.\d+\./)) {
        // This is a sub-strategy (e.g., "1.1.Sub-strategy name")
        if (currentStrategy) {
          const match = line.match(/^(\d+\.\d+)\.(.*)$/); // Use regex to correctly capture ID and name
          if (match) {
            const fullId = match[1].trim();
            const subStrategyName = match[2].trim();
            currentSubStrategy = {
              id: fullId,
              name: subStrategyName,
              guidelines: [],
            };
            currentStrategy.subStrategies.push(currentSubStrategy);
            guidelineRawIndex = 0; // Reset raw index counter for new sub-strategy
          }
        }
      } else if (line.match(/^[A-Za-z]/)) {
        // This is a guideline
        if (currentSubStrategy) {
          guidelineRawIndex++; // Increment raw index

          // Check for exclusion based on raw index
          if (exclusionMap[currentSubStrategy.id] && exclusionMap[currentSubStrategy.id].includes(guidelineRawIndex)) {
            // Skip this guideline
            return;
          }

          const guideline: Guideline = {
            id: `${currentSubStrategy.id}.${currentSubStrategy.guidelines.length + 1}`, // Generate a simple ID based on current length
            name: line.trim(),
          };
          currentSubStrategy.guidelines.push(guideline);
        }
      }
    });

    return strategies;
  } catch (error) {
    console.error("Error parsing LCD strategies:", error);
    return [];
  }
}