import type { HseAgentOutput, MarliTrainingDataset, RiskLevel } from '../types/agentTypes';

export function runHseAgent(data: MarliTrainingDataset): HseAgentOutput {
  const riskLevel: RiskLevel = data.moduleId === 'loto_m1' && data.averageReadiness < 75 ? 'Alto' : 'Medio';
  const safetyGap = data.failedConcepts.includes('energia_cero')
    ? 'Verificación de energía cero'
    : 'Sin brecha crítica priorizada';
  const validationStatus =
    data.supervisorValidationStatus === 'pending'
      ? 'Pendiente de validación supervisor'
      : 'Validación por supervisor registrada';

  return {
    officialCategory: 'Seguridad Industrial & HSE',
    officialStyle: 'Agente Híbrido · Safety',
    toolsUsed: ['track_safety_kpis', 'report_safety_incident', 'investigate_root_cause_hse'],
    inputSummary: `${data.process} · ${data.hazardType} · ${data.area} · ${data.shift}`,
    logicSummary:
      'Interpreta bajo readiness en LOTO como riesgo preventivo de capacitación para revisión interna del piloto.',
    riskLevel,
    safetyGap,
    validationStatus,
    recommendation: 'Reforzar verificación de energía cero antes de validación práctica.',
    evidenceNote:
      'Evidencia interna generada en fase piloto para validación por supervisor.',
    standardEvent: 'safety_kpi_report',
  };
}
