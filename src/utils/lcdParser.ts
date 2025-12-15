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
    let guidelineCounter = 0; // Counter for guidelines within the current sub-strategy

    // Define the list of guideline indices to exclude (based on their sequential number in the source text)
    const excludedGuidelineIndices: { [subStrategyId: string]: number[] } = {
      '3.1': [2, 5, 7, 8, 9],
      '3.2': [2, 4],
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
        guidelineCounter = 0;
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
            guidelineCounter = 0; // Reset counter for new sub-strategy
          }
        }
      } else if (line.match(/^[A-Za-z]/)) {
        // This is a guideline
        if (currentSubStrategy) {
          guidelineCounter++; // Increment counter for every guideline line encountered

          const subStrategyId = currentSubStrategy.id;
          const indexToExclude = excludedGuidelineIndices[subStrategyId] || [];

          // Check if this guideline index should be excluded
          if (indexToExclude.includes(guidelineCounter)) {
            // Skip this guideline
            return;
          }

          const guideline: Guideline = {
            id: `${subStrategyId}.${guidelineCounter}`, // Generate ID based on the sequential counter
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