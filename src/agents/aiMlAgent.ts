import {
  calculateConceptFailureRate,
  calculateModuleFrictionIndex,
  calculateRetryRate,
  calculateSlowResponseRate,
  detectMostFailedConcept,
} from '../lib/calculations';
import type { AiMlAgentOutput, MarliTrainingDataset } from '../types/agentTypes';

export function runAiMlAgent(data: MarliTrainingDataset): AiMlAgentOutput {
  const mostFailedConcept = detectMostFailedConcept(data.events);
  const conceptFailureRate = mostFailedConcept
    ? calculateConceptFailureRate(data.events, mostFailedConcept)
    : 0;
  const retryRate = calculateRetryRate(data.events);
  const slowResponseRate = calculateSlowResponseRate(data.events);
  const moduleFrictionIndex = calculateModuleFrictionIndex(
    conceptFailureRate,
    retryRate,
    slowResponseRate,
  );

  return {
    officialCategory: 'AI & Machine Learning Industrial',
    officialStyle: 'Agente Híbrido · AI/ML',
    toolsUsed: [
      'detect_process_deviation',
      'identify_bottlenecks',
      'detect_real_time_anomalies',
      'run_local_inference',
    ],
    inputSummary: `${data.events.length} eventos mock de capacitación con respuestas, intentos y tiempos.`,
    logicSummary:
      'Detecta señales tempranas de fricción de aprendizaje/proceso sin afirmar predicción avanzada.',
    conceptFailureRate,
    retryRate,
    slowResponseRate,
    moduleFrictionIndex,
    mostFailedConcept,
    suspectedCause:
      moduleFrictionIndex > 60 ? 'Posible fricción en capacitación/SOP' : 'Fricción baja o controlada',
    patternDetected: mostFailedConcept
      ? `Alta fricción en concepto: ${mostFailedConcept}`
      : 'Sin patrón crítico detectado',
    recommendation: 'Revisar explicación del concepto crítico y agregar escenario práctico.',
    standardEvent: 'process_deviation_detected',
  };
}
