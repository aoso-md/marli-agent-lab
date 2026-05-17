import { useEffect, useMemo, useState } from 'react';
import { runAiMlAgent } from '../agents/aiMlAgent';
import { runErpAgent } from '../agents/erpAgent';
import { runHseAgent } from '../agents/hseAgent';
import type {
  AiMlAgentOutput,
  ErpAgentOutput,
  HseAgentOutput,
  MarliTrainingDataset,
} from '../types/agentTypes';

interface LiveAgentConsoleProps {
  dataset: MarliTrainingDataset;
}

interface ConsoleStep {
  id: 'payload' | 'hse' | 'aiMl' | 'erp' | 'queue';
  label: string;
  log: string;
}

interface LiveAgentOutputs {
  hse: HseAgentOutput;
  aiMl: AiMlAgentOutput;
  erp: ErpAgentOutput;
}

interface QueueEvent {
  source: 'hse_agent' | 'ai_ml_agent' | 'erp_agent';
  event: HseAgentOutput['standardEvent'] | AiMlAgentOutput['standardEvent'] | ErpAgentOutput['standardEvent'];
  category: 'safety' | 'process_intelligence' | 'management';
  status: 'ready_to_emit';
}

const CONSOLE_STEP_DELAY_MS = 650;
const steps: ConsoleStep[] = [
  { id: 'payload', label: 'Payload preparado', log: '[1] Input parsed' },
  { id: 'hse', label: 'HSE Agent ejecutado', log: '[2] HSE Agent executed' },
  { id: 'aiMl', label: 'AI/ML Agent ejecutado', log: '[3] AI/ML Agent executed' },
  { id: 'erp', label: 'ERP Agent ejecutado', log: '[4] ERP Agent executed' },
  { id: 'queue', label: 'Event queue lista', log: '[5] Events ready for API/IES/event bus' },
];

const requiredFields = [
  'moduleId',
  'averageReadiness',
  'failedConcepts',
  'supervisorValidationStatus',
  'operatorsAssigned',
  'operatorsCompleted',
  'plannedReadiness',
  'actualReadiness',
  'plannedCompletionRate',
  'actualCompletionRate',
  'evidenceFieldsCompleted',
  'evidenceFieldsRequired',
  'events',
] as const;

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function formatDataset(dataset: MarliTrainingDataset) {
  return JSON.stringify(dataset, null, 2);
}

function hasRequiredFields(value: unknown): value is MarliTrainingDataset {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return requiredFields.every((field) => field in candidate) && Array.isArray(candidate.failedConcepts) && Array.isArray(candidate.events);
}

function buildInputPayload(dataset: MarliTrainingDataset) {
  return {
    moduleId: dataset.moduleId,
    averageReadiness: dataset.averageReadiness,
    failedConcepts: dataset.failedConcepts,
    supervisorValidationStatus: dataset.supervisorValidationStatus,
    trainingEvents: dataset.events.length,
    operatorsAssigned: dataset.operatorsAssigned,
    operatorsCompleted: dataset.operatorsCompleted,
    completionRate: dataset.actualCompletionRate,
    plannedReadiness: dataset.plannedReadiness,
    actualReadiness: dataset.actualReadiness,
    evidenceCompleteness: `${dataset.evidenceFieldsCompleted}/${dataset.evidenceFieldsRequired}`,
  };
}

function buildQueueEvents(outputs: LiveAgentOutputs): QueueEvent[] {
  return [
    {
      source: 'hse_agent',
      event: outputs.hse.standardEvent,
      category: 'safety',
      status: 'ready_to_emit',
    },
    {
      source: 'ai_ml_agent',
      event: outputs.aiMl.standardEvent,
      category: 'process_intelligence',
      status: 'ready_to_emit',
    },
    {
      source: 'erp_agent',
      event: outputs.erp.standardEvent,
      category: 'management',
      status: 'ready_to_emit',
    },
  ];
}

export function LiveAgentConsole({ dataset }: LiveAgentConsoleProps) {
  const [jsonInput, setJsonInput] = useState<string>(formatDataset(dataset));
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState('');
  const [activeDataset, setActiveDataset] = useState(dataset);
  const [outputs, setOutputs] = useState<LiveAgentOutputs>({
    hse: runHseAgent(dataset),
    aiMl: runAiMlAgent(dataset),
    erp: runErpAgent(dataset),
  });
  const [executionStarted, setExecutionStarted] = useState(false);

  const activeStep = steps[currentStep];
  const payloadVisible = executionStarted;
  const hseVisible = executionStarted && currentStep >= 1;
  const aiMlVisible = executionStarted && currentStep >= 2;
  const erpVisible = executionStarted && currentStep >= 3;
  const queueVisible = executionStarted && currentStep >= 4;

  const hseRiskRuleMatched =
    activeDataset.averageReadiness < 75 && activeDataset.failedConcepts.includes('energia_cero');

  const inputPayload = useMemo(() => buildInputPayload(activeDataset), [activeDataset]);
  const queueEvents = useMemo(() => buildQueueEvents(outputs), [outputs]);
  const visibleLogs = steps.slice(0, executionStarted ? currentStep + 1 : 0);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setCurrentStep((step) => {
        if (step >= steps.length - 1) {
          setIsRunning(false);
          return step;
        }

        return step + 1;
      });
    }, CONSOLE_STEP_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [currentStep, isRunning]);

  function loadDataset(nextDataset: MarliTrainingDataset) {
    setJsonInput(formatDataset(nextDataset));
    setError('');
    setIsRunning(false);
    setExecutionStarted(false);
    setCurrentStep(0);
  }

  function loadScenario(overrides: Partial<MarliTrainingDataset>) {
    loadDataset({ ...dataset, ...overrides });
  }

  function executeAgents() {
    try {
      const parsed: unknown = JSON.parse(jsonInput);

      if (!hasRequiredFields(parsed)) {
        throw new Error('Missing required fields');
      }

      const nextDataset = parsed;
      const nextOutputs = {
        hse: runHseAgent(nextDataset),
        aiMl: runAiMlAgent(nextDataset),
        erp: runErpAgent(nextDataset),
      };

      setActiveDataset(nextDataset);
      setOutputs(nextOutputs);
      setError('');
      setExecutionStarted(true);
      setCurrentStep(0);
      setIsRunning(true);
    } catch {
      setError('Input inválido: revisa el JSON o campos requeridos.');
      setIsRunning(false);
      setExecutionStarted(false);
      setCurrentStep(0);
    }
  }

  function clearInput() {
    setJsonInput('');
    setError('');
    setIsRunning(false);
    setExecutionStarted(false);
    setCurrentStep(0);
  }

  return (
    <section className="live-console" aria-label="Live Agent Execution Console">
      <div className="console-header">
        <div>
          <p className="section-kicker">Live Agent Execution Console · datos mock</p>
          <h2>Agentes modulares con input editable en vivo</h2>
          <p>
            Pega o edita un MARLI Training Dataset JSON para recalcular readiness operativo,
            evidencia interna y eventos estándar. Fase piloto: AI recomienda, humano valida.
          </p>
        </div>
        <button className="demo-button primary console-run-button" type="button" onClick={executeAgents} disabled={isRunning}>
          Ejecutar agentes
        </button>
      </div>

      <div className="console-editor-card">
        <div className="console-editor-header">
          <label htmlFor="marli-training-dataset-input">Input MARLI Training Dataset</label>
          <span>datos mock · validación por supervisor</span>
        </div>
        <textarea
          id="marli-training-dataset-input"
          className="json-input"
          value={jsonInput}
          onChange={(event: { target: HTMLTextAreaElement }) => setJsonInput(event.target.value)}
          spellCheck={false}
          rows={18}
        />
        <div className="console-actions" aria-label="Acciones de input editable">
          <button className="demo-button secondary" type="button" onClick={() => loadDataset(dataset)}>
            Cargar ejemplo LOTO M1
          </button>
          <button className="demo-button primary" type="button" onClick={executeAgents} disabled={isRunning}>
            Ejecutar agentes
          </button>
          <button className="demo-button ghost" type="button" onClick={clearInput}>
            Limpiar input
          </button>
        </div>
      </div>

      <div className="scenario-panel" aria-label="Demo scenarios">
        <div>
          <p className="section-kicker">Demo scenarios</p>
          <h3>Quick-fill para comparar señales de riesgo preventivo de capacitación</h3>
        </div>
        <div className="scenario-buttons">
          <button
            className="scenario-button"
            type="button"
            onClick={() =>
              loadScenario({
                averageReadiness: 72,
                actualReadiness: 72,
                plannedReadiness: 85,
                operatorsCompleted: 24,
                operatorsAssigned: 30,
                failedConcepts: ['energia_cero', 'bloqueo'],
                supervisorValidationStatus: 'pending',
              })
            }
          >
            Escenario base: riesgo alto
          </button>
          <button
            className="scenario-button"
            type="button"
            onClick={() =>
              loadScenario({
                averageReadiness: 88,
                actualReadiness: 88,
                plannedReadiness: 85,
                operatorsCompleted: 29,
                operatorsAssigned: 30,
                failedConcepts: [],
                supervisorValidationStatus: 'approved',
                actualCompletionRate: 97,
                plannedCompletionRate: 90,
                evidenceFieldsCompleted: 8,
                evidenceFieldsRequired: 8,
                operatorsBelowThreshold: 1,
              })
            }
          >
            Escenario mejorado: readiness sano
          </button>
          <button
            className="scenario-button danger"
            type="button"
            onClick={() =>
              loadScenario({
                averageReadiness: 55,
                actualReadiness: 55,
                plannedReadiness: 85,
                operatorsCompleted: 15,
                operatorsAssigned: 30,
                failedConcepts: ['energia_cero', 'bloqueo', 'try_out'],
                supervisorValidationStatus: 'pending',
                actualCompletionRate: 50,
                plannedCompletionRate: 90,
                evidenceFieldsCompleted: 3,
                evidenceFieldsRequired: 8,
                operatorsBelowThreshold: 15,
              })
            }
          >
            Escenario crítico: retrasado
          </button>
        </div>
      </div>

      {error ? (
        <div className="error-card" role="alert">
          <strong>{error}</strong>
          <span>Campos requeridos: {requiredFields.join(', ')}.</span>
        </div>
      ) : null}

      <div className="console-status" aria-live="polite">
        <span className={isRunning ? 'console-dot running' : 'console-dot'} />
        <strong>{isRunning ? 'Ejecutando agentes...' : activeStep.label}</strong>
        <span>fase piloto · evidencia interna · readiness operativo</span>
      </div>

      <div className="execution-log" aria-label="Terminal-like execution log">
        {visibleLogs.length > 0 ? (
          visibleLogs.map((step) => <code key={step.id}>{step.log}</code>)
        ) : (
          <code>[0] Esperando input JSON editable</code>
        )}
      </div>

      <div className="console-grid">
        <section className="console-panel console-payload">
          <div className="console-panel-header">
            <span>01</span>
            <h3>Payload prepared</h3>
          </div>
          {payloadVisible ? (
            <pre className="code-block">
              <code>{JSON.stringify(inputPayload, null, 2)}</code>
            </pre>
          ) : (
            <p className="muted">El payload se revela después de ejecutar agentes con JSON válido.</p>
          )}
        </section>

        <section className="console-panel console-agents" aria-label="Tres agentes en ejecución">
          <div className="console-panel-header">
            <span>02</span>
            <h3>Generated output cards</h3>
          </div>

          <article className={hseVisible ? 'execution-card active hse-execution' : 'execution-card'}>
            <div>
              <span className="agent-tag">HSE Agent</span>
              <h4>Riesgo preventivo de capacitación</h4>
            </div>
            <p>
              Input vivo: averageReadiness {activeDataset.averageReadiness}, failedConcepts{' '}
              {activeDataset.failedConcepts.join(', ') || 'sin brechas'}, supervisorValidationStatus{' '}
              {activeDataset.supervisorValidationStatus}.
            </p>
            <p>
              Logic: readiness &lt; 75 en LOTO M1 activa señal preventiva. Resultado de regla:{' '}
              {hseRiskRuleMatched ? 'true' : 'false'}.
            </p>
            {hseVisible ? (
              <div className="execution-output output-card-grid">
                <strong>riskLevel: {outputs.hse.riskLevel}</strong>
                <span>safetyGap: {outputs.hse.safetyGap}</span>
                <span>validationStatus: {outputs.hse.validationStatus}</span>
                <span>recommendation: {outputs.hse.recommendation}</span>
                <span>standardEvent: {outputs.hse.standardEvent}</span>
              </div>
            ) : null}
          </article>

          <article className={aiMlVisible ? 'execution-card active aiml-execution' : 'execution-card'}>
            <div>
              <span className="agent-tag">AI/ML Agent</span>
              <h4>Fricción de módulo</h4>
            </div>
            <p>Input vivo: eventos mock, intentos, respuestas lentas y etiquetas de conceptos fallidos.</p>
            <p>
              Logic: calcula tasas e índice de fricción; AI recomienda, humano valida antes de actuar.
            </p>
            {aiMlVisible ? (
              <div className="execution-output output-card-grid">
                <strong>patternDetected: {outputs.aiMl.patternDetected}</strong>
                <span>conceptFailureRate: {formatPercent(outputs.aiMl.conceptFailureRate)}</span>
                <span>retryRate: {formatPercent(outputs.aiMl.retryRate)}</span>
                <span>slowResponseRate: {formatPercent(outputs.aiMl.slowResponseRate)}</span>
                <span>moduleFrictionIndex: {outputs.aiMl.moduleFrictionIndex}</span>
                <span>suspectedCause: {outputs.aiMl.suspectedCause}</span>
                <span>recommendation: {outputs.aiMl.recommendation}</span>
                <span>standardEvent: {outputs.aiMl.standardEvent}</span>
              </div>
            ) : null}
          </article>

          <article className={erpVisible ? 'execution-card active erp-execution' : 'execution-card'}>
            <div>
              <span className="agent-tag">ERP Agent</span>
              <h4>Readiness vs plan operativo</h4>
            </div>
            <p>
              Input vivo: {activeDataset.operatorsCompleted}/{activeDataset.operatorsAssigned} operadores,
              plannedReadiness {activeDataset.plannedReadiness}, actualReadiness{' '}
              {activeDataset.actualReadiness}.
            </p>
            <p>Logic: compara plan vs actual y evidencia interna de la fase piloto.</p>
            {erpVisible ? (
              <div className="execution-output output-card-grid">
                <strong>projectHealth: {outputs.erp.projectHealth}</strong>
                <span>completionRate: {formatPercent(outputs.erp.completionRate)}</span>
                <span>averageReadiness: {activeDataset.averageReadiness}%</span>
                <span>readinessGap: {outputs.erp.readinessGap} puntos</span>
                <span>operatorsAtRisk: {outputs.erp.operatorsAtRisk}</span>
                <span>evidenceCompleteness: {formatPercent(outputs.erp.evidenceCompleteness)}</span>
                <span>plannedVsActualGap: {outputs.erp.plannedVsActualGap} puntos</span>
                <span>suggestedBusinessAction: {outputs.erp.suggestedBusinessAction}</span>
                <span>standardEvent: {outputs.erp.standardEvent}</span>
              </div>
            ) : null}
          </article>
        </section>

        <section className="console-panel">
          <div className="console-panel-header">
            <span>03</span>
            <h3>Output preview</h3>
          </div>
          <div className="output-preview">
            {hseVisible ? <span>HSE → riskLevel: {outputs.hse.riskLevel}</span> : <span>HSE → esperando ejecución</span>}
            {aiMlVisible ? (
              <span>AI/ML → patternDetected: {outputs.aiMl.patternDetected}</span>
            ) : (
              <span>AI/ML → esperando ejecución</span>
            )}
            {erpVisible ? (
              <span>ERP → projectHealth: {outputs.erp.projectHealth}</span>
            ) : (
              <span>ERP → esperando ejecución</span>
            )}
          </div>
        </section>

        <section className="console-panel event-queue-panel">
          <div className="console-panel-header">
            <span>04</span>
            <h3>Event Queue</h3>
          </div>
          {queueVisible ? (
            <>
              <div className="event-queue">
                {queueEvents.map((queueEvent) => (
                  <span className="event-badge" key={queueEvent.source}>
                    {queueEvent.source} · {queueEvent.event} · {queueEvent.status}
                  </span>
                ))}
              </div>
              <pre className="code-block event-code-preview">
                <code>{JSON.stringify(queueEvents, null, 2)}</code>
              </pre>
              <p className="queue-note">
                Eventos listos para API/IES/event bus cuando el ecosistema lo requiera; siguen siendo
                datos mock y evidencia interna de fase piloto.
              </p>
            </>
          ) : (
            <p className="muted">La cola se revela después de ejecutar HSE, AI/ML y ERP.</p>
          )}
        </section>
      </div>

      <aside className="human-validation-note">
        <strong>Human validation note:</strong> AI recomienda. Humano valida. Supervisor decide antes
        de cualquier acción operativa.
      </aside>
    </section>
  );
}
