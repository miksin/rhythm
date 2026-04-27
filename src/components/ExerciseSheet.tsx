import React, { useEffect, useRef, useState } from 'react';
import type { Exercise } from '@/lib/rhythm-engine/types';
import { renderExercise, type RenderResult } from '@/lib/notation/renderer';

interface ExerciseSheetProps {
  exercise: Exercise;
}

/**
 * Renders SVG notation + syllables overlay below each note.
 */
export function ExerciseSheet({ exercise }: ExerciseSheetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderResult, setRenderResult] = useState<RenderResult | null>(null);

  useEffect(() => {
    try {
      const result = renderExercise(exercise);
      setRenderResult(result);
    } catch (err) {
      console.error('ExerciseSheet render error:', err);
    }
  }, [exercise]);

  // Build a lookup for syllables: measureIndex -> noteIndex -> syllable
  const syllableMap = new Map<string, string>();
  exercise.measures.forEach((measure, mi) => {
    measure.notes.forEach((note, ni) => {
      syllableMap.set(`${mi}-${ni}`, note.syllable);
    });
  });

  return (
    <div ref={containerRef} className="exercise-sheet relative w-full overflow-x-auto">
      {renderResult && (
        <>
          {/* SVG notation */}
          <div
            className="notation-svg"
            dangerouslySetInnerHTML={{ __html: renderResult.svg }}
          />
          {/* Syllable overlay */}
          <div className="syllables-overlay relative" style={{ marginTop: '-8px' }}>
            {renderResult.notePositions.map(({ measureIndex, noteIndex, x }) => {
              const syllable = syllableMap.get(`${measureIndex}-${noteIndex}`);
              if (!syllable) return null;
              return (
                <span
                  key={`${measureIndex}-${noteIndex}`}
                  className="syllable absolute text-sm font-mono text-gray-700"
                  style={{ left: `${x}px`, transform: 'translateX(-50%)' }}
                >
                  {syllable}
                </span>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default ExerciseSheet;
