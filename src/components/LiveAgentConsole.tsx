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
  status: 'ready_to_emit';
}

const CONSOLE_STEP_DELAY_MS = 520;

const steps: ConsoleStep[] = [
  { id: 'payload', label: 'Input parsed', log: '[1] Input parsed' },
  { id: 'hse', label: 'HSE Agent executed', log: '[2] HSE Agent executed' },
  { id: 'aiMl', label: 'AI/ML Agent executed', log: '[3] AI/ML Agent executed' },
  { id: 'erp', label: 'ERP Agent executed', log: '[4] ERP Agent executed' },
  { id: 'queue', label: 'Events ready for API/IES/event bus', log: '[5] Events ready for API/IES/event bus' },
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

  return (
    requiredFields.every((field) => field in candidate) &&
    Array.isArray(candidate.failedConcepts) &&
    Array.isArray(candidate.events)
  );
}

function buildQueueEvents(outputs: LiveAgentOutputs): QueueEvent[] {
  return [
    {
      source: 'hse_agent',
      event: outputs.hse.standardEvent,
      status: 'ready_to_emit',
    },
    {
      source: 'ai_ml_agent',
      event: outputs.aiMl.standardEvent,
      status: 'ready_to_emit',
    },
    {
      source: 'erp_agent',
      event: outputs.erp.standardEvent,
      status: 'ready_to_emit',
    },
  ];
}

function createOutputs(dataset: MarliTrainingDataset): LiveAgentOutputs {
  return {
    hse: runHseAgent(dataset),
    aiMl: runAiMlAgent(dataset),
    erp: runErpAgent(dataset),
  };
}

export function LiveAgentConsole({ dataset }: LiveAgentConsoleProps) {
  const [jsonInput, setJsonInput] = useState<string>(formatDataset(dataset));
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState('');
  const [activeDataset, setActiveDataset] = useState(dataset);
  const [outputs, setOutputs] = useState<LiveAgentOutputs>(createOutputs(dataset));
  const [executionStarted, setExecutionStarted] = useState(false);

  const activeStep = steps[currentStep];
  const visibleLogs = steps.slice(0, executionStarted ? currentStep + 1 : 0);
  const queueEvents = useMemo(() => buildQueueEvents(outputs), [outputs]);
  const showResults = executionStarted;
  const showQueue = executionStarted && currentStep >= 4;
  const actionRecommendation = outputs.erp.suggestedBusinessAction || outputs.hse.recommendation;

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

  function resetRunState() {
    setError('');
    setIsRunning(false);
    setExecutionStarted(false);
    setCurrentStep(0);
  }

  function loadDataset(nextDataset: MarliTrainingDataset) {
    setJsonInput(formatDataset(nextDataset));
    setActiveDataset(nextDataset);
    setOutputs(createOutputs(nextDataset));
    resetRunState();
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
      const nextOutputs = createOutputs(nextDataset);

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
    resetRunState();
  }

  return (
    <section className="live-console" aria-label="MARLI Supervisor Agent Console">
      <div className="console-header">
        <div>
          <p className="section-kicker">fase piloto · datos mock · evidencia interna</p>
          <h2>MARLI Supervisor Agent Console</h2>
          <p>
            Ingresa o carga un MARLI Training Dataset, ejecuta agentes y revisa recomendación de
            supervisor, output técnico y eventos estándar listos para ecosistema.
          </p>
        </div>
        <span className="console-mode-badge">AI recomienda, humano valida</span>
      </div>

      <div className="console-layout">
        <section className="console-panel input-panel" aria-labelledby="input-panel-title">
          <div className="console-panel-header">
            <span aria-hidden="true">→</span>
            <h3 id="input-panel-title">1 · Ingresar dataset MARLI</h3>
          </div>
          <div className="console-editor-header">
            <label htmlFor="marli-training-dataset-input">Input MARLI Training Dataset</label>
            <span>{activeDataset.moduleName}</span>
          </div>
          <textarea
            id="marli-training-dataset-input"
            className="json-input"
            value={jsonInput}
            onChange={(event: { target: HTMLTextAreaElement }) => setJsonInput(event.target.value)}
            spellCheck={false}
            rows={16}
          />
          <div className="console-actions" aria-label="Acciones de input editable">
            <button className="demo-button secondary" type="button" onClick={() => loadDataset(dataset)}>
              Cargar LOTO M1
            </button>
            <button
              className="demo-button secondary"
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
              Escenario sano
            </button>
            <button
              className="demo-button warning"
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
              Escenario crítico
            </button>
            <button className="demo-button ghost" type="button" onClick={clearInput}>
              Limpiar input
            </button>
          </div>
        </section>

        <section className="console-panel run-panel" aria-labelledby="run-panel-title">
          <div className="console-panel-header">
            <span aria-hidden="true">→</span>
            <h3 id="run-panel-title">2 · Ejecutar agentes</h3>
          </div>
          <button className="demo-button primary run-cta" type="button" onClick={executeAgents} disabled={isRunning}>
            Ejecutar agentes
          </button>
          {error ? (
            <div className="error-card" role="alert">
              <strong>{error}</strong>
              <span>Campos requeridos: {requiredFields.join(', ')}.</span>
            </div>
          ) : null}
          <div className="console-status" aria-live="polite">
            <span className={isRunning ? 'console-dot running' : 'console-dot'} />
            <strong>{isRunning ? 'Ejecutando agentes...' : activeStep.label}</strong>
            <span>readiness operativo · validación por supervisor</span>
          </div>
          <div className="execution-log" aria-label="Execution log">
            {visibleLogs.length > 0 ? (
              visibleLogs.map((step) => <code key={step.id}>{step.log}</code>)
            ) : (
              <code>[0] Esperando input JSON editable</code>
            )}
          </div>
        </section>
      </div>

      <section className="console-panel supervisor-panel" aria-labelledby="supervisor-output-title">
        <div className="console-panel-header">
          <span aria-hidden="true">→</span>
          <h3 id="supervisor-output-title">3 · Output para supervisor</h3>
        </div>
        <article className={showResults ? 'supervisor-card active' : 'supervisor-card'}>
          {showResults ? (
            <>
              <div>
                <p className="section-kicker">Recomendación final · evidencia interna</p>
                <h4>{outputs.erp.projectHealth === 'Retrasado' ? 'Reforzar antes de escalar piloto' : 'Continuar con validación por supervisor'}</h4>
              </div>
              <dl className="supervisor-output-grid">
                <div>
                  <dt>Estado del piloto</dt>
                  <dd>{outputs.erp.projectHealth}</dd>
                </div>
                <div>
                  <dt>Riesgo HSE</dt>
                  <dd>{outputs.hse.riskLevel}</dd>
                </div>
                <div>
                  <dt>Fricción principal</dt>
                  <dd>{outputs.aiMl.patternDetected}</dd>
                </div>
                <div>
                  <dt>Acción recomendada</dt>
                  <dd>{actionRecommendation}</dd>
                </div>
                <div>
                  <dt>Validación</dt>
                  <dd>{outputs.hse.validationStatus}</dd>
                </div>
              </dl>
            </>
          ) : (
            <p>
              Ejecuta los agentes para generar una recomendación con datos mock. MARLI entrega una
              señal de fase piloto; la decisión final corresponde al supervisor.
            </p>
          )}
        </article>
      </section>

      <section className="console-panel technical-panel" aria-labelledby="technical-output-title">
        <div className="console-panel-header">
          <span aria-hidden="true">→</span>
          <h3 id="technical-output-title">4 · Output técnico por agente</h3>
        </div>
        <div className="technical-grid">
          <article className="technical-card hse-card">
            <span className="agent-tag">HSE</span>
            {showResults ? (
              <dl className="compact-definition-list">
                <div>
                  <dt>riskLevel</dt>
                  <dd>{outputs.hse.riskLevel}</dd>
                </div>
                <div>
                  <dt>safetyGap</dt>
                  <dd>{outputs.hse.safetyGap}</dd>
                </div>
                <div>
                  <dt>standardEvent</dt>
                  <dd>{outputs.hse.standardEvent}</dd>
                </div>
              </dl>
            ) : (
              <p className="muted">Esperando ejecución.</p>
            )}
          </article>

          <article className="technical-card aiml-card">
            <span className="agent-tag">AI/ML</span>
            {showResults ? (
              <dl className="compact-definition-list">
                <div>
                  <dt>patternDetected</dt>
                  <dd>{outputs.aiMl.patternDetected}</dd>
                </div>
                <div>
                  <dt>moduleFrictionIndex</dt>
                  <dd>{outputs.aiMl.moduleFrictionIndex}</dd>
                </div>
                <div>
                  <dt>standardEvent</dt>
                  <dd>{outputs.aiMl.standardEvent}</dd>
                </div>
              </dl>
            ) : (
              <p className="muted">Esperando ejecución.</p>
            )}
          </article>

          <article className="technical-card erp-card">
            <span className="agent-tag">ERP</span>
            {showResults ? (
              <dl className="compact-definition-list">
                <div>
                  <dt>completionRate</dt>
                  <dd>{formatPercent(outputs.erp.completionRate)}</dd>
                </div>
                <div>
                  <dt>readinessGap</dt>
                  <dd>{outputs.erp.readinessGap} pts</dd>
                </div>
                <div>
                  <dt>projectHealth</dt>
                  <dd>{outputs.erp.projectHealth}</dd>
                </div>
                <div>
                  <dt>standardEvent</dt>
                  <dd>{outputs.erp.standardEvent}</dd>
                </div>
              </dl>
            ) : (
              <p className="muted">Esperando ejecución.</p>
            )}
          </article>
        </div>
      </section>

      <section className="console-panel event-queue-panel" aria-labelledby="event-queue-title">
        <div className="console-panel-header">
          <span aria-hidden="true">→</span>
          <h3 id="event-queue-title">5 · Eventos listos para ecosistema</h3>
        </div>
        {showQueue ? (
          <>
            <div className="event-queue">
              {queueEvents.map((queueEvent) => (
                <span className="event-badge" key={queueEvent.source}>
                  {queueEvent.event}
                </span>
              ))}
            </div>
            <pre className="code-block event-code-preview">
              <code>{JSON.stringify(queueEvents, null, 2)}</code>
            </pre>
            <p className="queue-note">
              Eventos estándar listos para API/IES/event bus como evidencia interna de fase piloto.
            </p>
          </>
        ) : (
          <p className="muted">La cola se activa al completar la ejecución HSE, AI/ML y ERP.</p>
        )}
      </section>
    </section>
  );
}
