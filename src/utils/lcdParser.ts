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
          }
        }
      } else if (line.match(/^[A-Za-z]/)) {
        // This is a guideline
        if (currentSubStrategy) {
          const guideline: Guideline = {
            id: `${currentSubStrategy.id}.${currentSubStrategy.guidelines.length + 1}`, // Generate a simple ID
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