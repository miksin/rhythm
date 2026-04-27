import React, { useRef, useEffect } from 'react';
import type { Exercise } from '../lib/rhythm-engine/types';
import { render } from '../lib/notation/renderer';

interface ExerciseSheetProps {
  exercise: Exercise;
  width?: number;
  height?: number;
}

export function ExerciseSheet({ exercise, width = 700, height = 180 }: ExerciseSheetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    try {
      render(exercise, containerRef.current, { width, height });
    } catch (err) {
      console.error('[ExerciseSheet] render error:', err);
    }
  }, [exercise, width, height]);

  return (
    <div
      ref={containerRef}
      className="exercise-sheet"
      style={{ width: `${width}px`, minHeight: `${height}px` }}
      role="img"
      aria-label="Rhythm exercise sheet"
    />
  );
}

export default ExerciseSheet;
