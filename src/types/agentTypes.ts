export interface TrainingEvent {
  eventId: string;
  eventType: 'quiz_answer' | 'concept_retry' | 'module_progress' | 'readiness_checkpoint';
  anonymousUserId: 'op_demo_001' | 'op_demo_002' | 'op_demo_003';
  moduleId: string;
  conceptTags: string[];
  isCorrect: boolean;
  timeToAnswerSeconds: number;
  attemptNumber: number;
  timestamp: string;
}

export interface MarliTrainingDataset {
  moduleId: string;
  moduleName: string;
  process: string;
  hazardType: string;
  area: string;
  shift: string;
  operatorsAssigned: number;
  operatorsCompleted: number;
  averageReadiness: number;
  operatorsBelowThreshold: number;
  evidenceFieldsCompleted: number;
  evidenceFieldsRequired: number;
  supervisorValidationStatus: 'pending' | 'validated' | 'approved' | 'rejected';
  failedConcepts: string[];
  plannedCompletionRate: number;
  actualCompletionRate: number;
  plannedReadiness: number;
  actualReadiness: number;
  events: TrainingEvent[];
}

export type RiskLevel = 'Bajo' | 'Medio' | 'Alto';

export type ProjectHealth = 'En tiempo' | 'En riesgo' | 'Retrasado';

export interface HseAgentOutput {
  officialCategory: 'Seguridad Industrial & HSE';
  officialStyle: 'Agente Híbrido · Safety';
  toolsUsed: string[];
  inputSummary: string;
  logicSummary: string;
  riskLevel: RiskLevel;
  safetyGap: string;
  validationStatus: string;
  recommendation: string;
  evidenceNote: string;
  standardEvent: 'safety_kpi_report';
}

export interface AiMlAgentOutput {
  officialCategory: 'AI & Machine Learning Industrial';
  officialStyle: 'Agente Híbrido · AI/ML';
  toolsUsed: string[];
  inputSummary: string;
  logicSummary: string;
  conceptFailureRate: number;
  retryRate: number;
  slowResponseRate: number;
  moduleFrictionIndex: number;
  mostFailedConcept: string | null;
  suspectedCause: string;
  patternDetected: string;
  recommendation: string;
  standardEvent: 'process_deviation_detected';
}

export interface ErpAgentOutput {
  officialCategory: 'ERP & Gestión Empresarial';
  officialStyle: 'Agente Cloud · ERP';
  toolsUsed: string[];
  inputSummary: string;
  logicSummary: string;
  completionRate: number;
  actualReadiness: number;
  readinessGap: number;
  operatorsAtRisk: number;
  evidenceCompleteness: number;
  plannedVsActualGap: number;
  projectHealth: ProjectHealth;
  managementSummary: string;
  suggestedBusinessAction: string;
  standardEvent: 'project_progress_update';
}

export interface AgentRouterOutput {
  hse: HseAgentOutput;
  aiMl: AiMlAgentOutput;
  erp: ErpAgentOutput;
}
