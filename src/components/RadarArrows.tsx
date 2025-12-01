"use client";

import React from 'react';
import { Strategy } from '@/types/lcd';

interface Point { x: number; y: number; }
interface Rect { left: number; top: number; right: number; bottom: number; }

// Helper function to find the intersection of a ray with a rectangle
function getLineRectIntersection(lineStart: Point, lineDirection: Point, rect: Rect): Point | null {
  const { x: sx, y: sy } = lineStart;
  const { x: dx, y: dy } = lineDirection;
  const { left, top, right, bottom } = rect;

  let minT = Infinity;
  let intersectionPoint: Point | null = null;

  // Check intersection with left edge
  if (dx < 0) { // Only if ray points left
    const t = (left - sx) / dx;
    const iy = sy + t * dy;
    if (t >= 0 && iy >= top && iy <= bottom && t < minT) {
      minT = t;
      intersectionPoint = { x: left, y: iy };
    }
  }

  // Check intersection with right edge
  if (dx > 0) { // Only if ray points right
    const t = (right - sx) / dx;
    const iy = sy + t * dy;
    if (t >= 0 && iy >= top && iy <= bottom && t < minT) {
      minT = t;
      intersectionPoint = { x: right, y: iy };
    }
  }

  // Check intersection with top edge
  if (dy < 0) { // Only if ray points up
    const t = (top - sy) / dy;
    const ix = sx + t * dx;
    if (t >= 0 && ix >= left && ix <= right && t < minT) {
      minT = t;
      intersectionPoint = { x: ix, y: top };
    }
  }

  // Check intersection with bottom edge
  if (dy > 0) { // Only if ray points down
    const t = (bottom - sy) / dy;
    const ix = sx + t * dx;
    if (t >= 0 && ix >= left && ix <= right && t < minT) {
      minT = t;
      intersectionPoint = { x: ix, y: bottom };
    }
  }

  return intersectionPoint;
}

interface RadarArrowsProps {
  strategies: Strategy[];
  radarChartCenter: { x: number; y: number }; // Center of the radar chart in viewport coords
  insightBoxRects: Map<string, DOMRect>; // Bounding rects of insight boxes in viewport coords
  containerRect: DOMRect | null; // Bounding rect of the main radar container in viewport coords
}

const RadarArrows: React.FC<RadarArrowsProps> = ({
  strategies,
  radarChartCenter,
  insightBoxRects,
  containerRect,
}) => {
  if (!containerRect || !radarChartCenter) {
    return null;
  }

  // Convert radarChartCenter from viewport to container-relative coordinates
  const radarCenter_container = {
    x: radarChartCenter.x - containerRect.left,
    y: radarChartCenter.y - containerRect.top,
  };

  const arrows = strategies.map((strategy, index) => {
    const insightBoxRect = insightBoxRects.get(strategy.id);
    if (!insightBoxRect) return null;

    // Calculate the angle for the strategy's radial line
    // Recharts RadarChart default: first axis at 90 degrees (top), then counter-clockwise.
    const angleDeg = 90 - (index * (360 / strategies.length));
    const angleRad = angleDeg * (Math.PI / 180);

    // Direction vector for the radial line
    const dirX = Math.cos(angleRad);
    const dirY = -Math.sin(angleRad); // SVG Y-axis is inverted

    // Convert insight box rect from viewport to container-relative coordinates
    const boxRect_container = {
      left: insightBoxRect.left - containerRect.left,
      top: insightBoxRect.top - containerRect.top,
      right: insightBoxRect.right - containerRect.left,
      bottom: insightBoxRect.bottom - containerRect.top,
    };

    // Find the intersection point of the radial line with the insight box
    const intersectionPoint = getLineRectIntersection(
      radarCenter_container,
      { x: dirX, y: dirY },
      boxRect_container
    );

    if (!intersectionPoint) return null;

    const arrowOffset = 10; // Distance to offset the arrowhead from the box edge

    // Calculate the actual end point of the arrow, pulled back from the intersection
    const adjustedEndX = intersectionPoint.x - dirX * arrowOffset;
    const adjustedEndY = intersectionPoint.y - dirY * arrowOffset;

    return (
      <line
        key={strategy.id}
        x1={radarCenter_container.x}
        y1={radarCenter_container.y}
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