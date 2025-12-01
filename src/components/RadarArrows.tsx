"use client";

import React from 'react';
import { Strategy } from '@/types/lcd';

interface RadarArrowsProps {
  strategies: Strategy[];
  radarChartCenter: { x: number; y: number }; // Center of the radar chart in viewport coords
  radarChartOuterRadius: number; // Outer radius of the radar chart
  insightBoxRects: Map<string, DOMRect>; // Bounding rects of insight boxes in viewport coords
  containerRect: DOMRect | null; // Bounding rect of the main radar container in viewport coords
}

const RadarArrows: React.FC<RadarArrowsProps> = ({
  strategies,
  radarChartCenter,
  radarChartOuterRadius,
  insightBoxRects,
  containerRect,
}) => {
  if (!containerRect || !radarChartCenter || radarChartOuterRadius === 0) {
    return null;
  }

  const arrows = strategies.map((strategy, index) => {
    const insightBoxRect = insightBoxRects.get(strategy.id);
    if (!insightBoxRect) return null;

    // Calculate start point on the radar chart's outer edge
    // Assuming 7 strategies, evenly spaced, starting with strategy 1 at the top (90 degrees)
    // Recharts RadarChart default: first axis at 90 degrees (top), then counter-clockwise.
    const angleDeg = 90 - (index * (360 / strategies.length));
    const angleRad = angleDeg * (Math.PI / 180);

    const startX_viewport = radarChartCenter.x + radarChartOuterRadius * Math.cos(angleRad);
    const startY_viewport = radarChartCenter.y - radarChartOuterRadius * Math.sin(angleRad); // SVG Y-axis is inverted

    // Convert viewport coordinates to coordinates relative to the containerRect
    const startX = startX_viewport - containerRect.left;
    const startY = startY_viewport - containerRect.top;

    // Calculate end point on the insight box
    // Convert insight box viewport coordinates to container-relative coordinates
    const boxLeft = insightBoxRect.left - containerRect.left;
    const boxRight = insightBoxRect.right - containerRect.left;
    const boxTop = insightBoxRect.top - containerRect.top;
    const boxBottom = insightBoxRect.bottom - containerRect.top;
    const boxCenterX = boxLeft + insightBoxRect.width / 2;
    const boxCenterY = boxTop + insightBoxRect.height / 2;

    let endX, endY;

    // Heuristic to find the closest edge of the insight box to the radar point
    const points = [
      { x: boxLeft, y: boxCenterY }, // Left
      { x: boxRight, y: boxCenterY }, // Right
      { x: boxCenterX, y: boxTop }, // Top
      { x: boxCenterX, y: boxBottom }, // Bottom
    ];

    let minDistance = Infinity;
    let closestPoint = points[0];

    for (const p of points) {
      const dist = Math.sqrt(Math.pow(startX - p.x, 2) + Math.pow(startY - p.y, 2));
      if (dist < minDistance) {
        minDistance = dist;
        closestPoint = p;
      }
    }
    endX = closestPoint.x;
    endY = closestPoint.y;

    // Adjust start and end points slightly to prevent overlap with radar/box
    const arrowOffset = 10; // Distance to offset the arrow from the radar edge and box edge
    const dx = endX - startX;
    const dy = endY - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist === 0) return null; // Avoid division by zero

    const unitDx = dx / dist;
    const unitDy = dy / dist;

    const adjustedStartX = startX + unitDx * arrowOffset;
    const adjustedStartY = startY + unitDy * arrowOffset;

    const adjustedEndX = endX - unitDx * arrowOffset;
    const adjustedEndY = endY - unitDy * arrowOffset;

    return (
      <line
        key={strategy.id}
        x1={adjustedStartX}
        y1={adjustedStartY}
        x2={adjustedEndX}
        y2={adjustedEndY}
        stroke="#888"
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
      />
    );
  });

  return (
    <svg
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 10 }} // Below notes, above radar
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="8" // Adjust refX to make the tip of the arrow touch the end point
          refY="3.5"
          orient="auto"
          markerUnits="strokeWidth" // Scale with stroke width
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#888" />
        </marker>
      </defs>
      {arrows}
    </svg>
  );
};

export default RadarArrows;