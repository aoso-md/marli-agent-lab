import {
  calculateCompletionRate,
  calculateEvidenceCompleteness,
  calculatePlannedVsActualGap,
  calculateReadinessGap,
} from '../lib/calculations';
import type { ErpAgentOutput, MarliTrainingDataset, ProjectHealth } from '../types/agentTypes';

export function runErpAgent(data: MarliTrainingDataset): ErpAgentOutput {
  const completionRate = calculateCompletionRate(data.operatorsCompleted, data.operatorsAssigned);
  const readinessGap = calculateReadinessGap(data.plannedReadiness, data.actualReadiness);
  const evidenceCompleteness = calculateEvidenceCompleteness(
    data.evidenceFieldsCompleted,
    data.evidenceFieldsRequired,
  );
  const plannedVsActualGap = calculatePlannedVsActualGap(
    data.plannedCompletionRate,
    data.actualCompletionRate,
  );

  let projectHealth: ProjectHealth = 'En tiempo';

  if (data.plannedReadiness - data.actualReadiness > 20 || completionRate < 60) {
    projectHealth = 'Retrasado';
  } else if (data.plannedReadiness - data.actualReadiness > 10) {
    projectHealth = 'En riesgo';
  }

  return {
    officialCategory: 'ERP & Gestión Empresarial',
    officialStyle: 'Agente Cloud · ERP',
    toolsUsed: [
      'track_project_progress',
      'generate_kpis',
      'compare_planned_vs_actual',
      'detect_production_deviation',
    ],
    inputSummary: `${data.operatorsCompleted}/${data.operatorsAssigned} operadores completados en ${data.shift}.`,
    logicSummary: 'Convierte readiness operativo y evidencia interna en KPIs de gestión del piloto.',
    completionRate,
    actualReadiness: data.actualReadiness,
    readinessGap,
    operatorsAtRisk: data.operatorsBelowThreshold,
    evidenceCompleteness,
    plannedVsActualGap,
    projectHealth,
    managementSummary:
      'El piloto muestra avance de capacitación, pero existe una brecha de readiness en LOTO que requiere refuerzo antes de validación.',
    suggestedBusinessAction: 'Priorizar refuerzo en Turno A y revisar avance antes de escalar el piloto.',
    standardEvent: 'project_progress_update',
  };
}
