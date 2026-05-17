import type { TrainingEvent } from '../types/agentTypes';

export function calculatePercentage(numerator: number, denominator: number): number {
  if (denominator <= 0) {
    return 0;
  }

  return Math.round((numerator / denominator) * 100);
}

export function calculateCompletionRate(operatorsCompleted: number, operatorsAssigned: number): number {
  return calculatePercentage(operatorsCompleted, operatorsAssigned);
}

export function calculateReadinessGap(plannedReadiness: number, actualReadiness: number): number {
  return Math.round(plannedReadiness - actualReadiness);
}

export function calculateEvidenceCompleteness(
  evidenceFieldsCompleted: number,
  evidenceFieldsRequired: number,
): number {
  return calculatePercentage(evidenceFieldsCompleted, evidenceFieldsRequired);
}

export function calculatePlannedVsActualGap(planned: number, actual: number): number {
  return Math.round(planned - actual);
}

export function calculateConceptFailureRate(events: TrainingEvent[], conceptTag: string): number {
  const conceptEvents = events.filter((event) => event.conceptTags.includes(conceptTag));
  const failedEvents = conceptEvents.filter((event) => !event.isCorrect);

  return calculatePercentage(failedEvents.length, conceptEvents.length);
}

export function calculateRetryRate(events: TrainingEvent[]): number {
  const retryEvents = events.filter((event) => event.attemptNumber > 1);

  return calculatePercentage(retryEvents.length, events.length);
}

export function calculateSlowResponseRate(events: TrainingEvent[], thresholdSeconds = 15): number {
  const slowEvents = events.filter((event) => event.timeToAnswerSeconds > thresholdSeconds);

  return calculatePercentage(slowEvents.length, events.length);
}

export function calculateModuleFrictionIndex(
  conceptFailureRate: number,
  retryRate: number,
  slowResponseRate: number,
): number {
  return Math.round((conceptFailureRate + retryRate + slowResponseRate) / 3);
}

export function detectMostFailedConcept(events: TrainingEvent[]): string | null {
  const failureCounts = new Map<string, number>();

  events
    .filter((event) => !event.isCorrect)
    .flatMap((event) => event.conceptTags)
    .forEach((conceptTag) => {
      failureCounts.set(conceptTag, (failureCounts.get(conceptTag) ?? 0) + 1);
    });

  if (failureCounts.size === 0) {
    return null;
  }

  const [mostFailedConcept] = [...failureCounts.entries()].sort((a, b) => b[1] - a[1])[0]!;

  return mostFailedConcept;
}
