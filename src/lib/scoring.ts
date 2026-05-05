export interface BeatResult {
  beatIndex: number;
  expectedTime: number;
  tapTime: number | null;
  deviationMs: number | null;
  accuracy: number;
}

export interface SessionResults {
  beatResults: BeatResult[];
  overallAccuracyPercent: number;
  averageDeviationMs: number;
  stdDeviationMs: number;
  earlyLateBiasMs: number;
  missedBeatCount: number;
  hitBeatCount: number;
}

function calculateStdDev(values: number[], mean: number): number {
  if (values.length === 0) return 0;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function calculateResults(
  beatExpectedTimes: number[],
  userTapTimes: number[],
  toleranceMs: number,
): SessionResults {
  const sortedTaps = [...userTapTimes].sort((a, b) => a - b);
  const usedTaps = new Set<number>();
  const beatResults: BeatResult[] = [];

  for (let i = 0; i < beatExpectedTimes.length; i++) {
    const expected = beatExpectedTimes[i];
    const windowStart = expected - toleranceMs;
    const windowEnd = expected + toleranceMs;

    const candidates = sortedTaps.filter(
      (t) => !usedTaps.has(t) && t >= windowStart && t <= windowEnd,
    );

    if (candidates.length === 0) {
      beatResults.push({
        beatIndex: i,
        expectedTime: expected,
        tapTime: null,
        deviationMs: null,
        accuracy: 0,
      });
      continue;
    }

    let bestTap = candidates[0];
    let bestDist = Math.abs(bestTap - expected);
    for (let j = 1; j < candidates.length; j++) {
      const dist = Math.abs(candidates[j] - expected);
      if (dist < bestDist) {
        bestTap = candidates[j];
        bestDist = dist;
      }
    }

    usedTaps.add(bestTap);
    const deviation = bestTap - expected;
    const accuracy = Math.max(0, 1 - Math.abs(deviation) / toleranceMs);

    beatResults.push({
      beatIndex: i,
      expectedTime: expected,
      tapTime: bestTap,
      deviationMs: deviation,
      accuracy,
    });
  }

  const hits = beatResults.filter((r) => r.tapTime !== null);
  const deviations = hits.map((r) => r.deviationMs!);

  const overallAccuracyPercent =
    beatResults.length > 0
      ? (beatResults.reduce((sum, r) => sum + r.accuracy, 0) / beatResults.length) * 100
      : 0;

  const averageDeviationMs =
    deviations.length > 0
      ? deviations.reduce((sum, d) => sum + d, 0) / deviations.length
      : 0;

  const stdDeviationMs = calculateStdDev(deviations, averageDeviationMs);

  return {
    beatResults,
    overallAccuracyPercent,
    averageDeviationMs,
    stdDeviationMs,
    earlyLateBiasMs: averageDeviationMs,
    missedBeatCount: beatResults.length - hits.length,
    hitBeatCount: hits.length,
  };
}
