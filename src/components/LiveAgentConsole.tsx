import { useEffect, useMemo, useState } from 'react';
import type {
  AiMlAgentOutput,
  ErpAgentOutput,
  HseAgentOutput,
  MarliTrainingDataset,
} from '../types/agentTypes';

interface LiveAgentConsoleProps {
  dataset: MarliTrainingDataset;
  hse: HseAgentOutput;
  aiMl: AiMlAgentOutput;
  erp: ErpAgentOutput;
}

interface ConsoleStep {
  id: 'idle' | 'hse' | 'aiMl' | 'erp' | 'queue';
  label: string;
}

const CONSOLE_STEP_DELAY_MS = 900;
const steps: ConsoleStep[] = [
  { id: 'idle', label: 'Payload preparado' },
  { id: 'hse', label: 'HSE Agent ejecutado' },
  { id: 'aiMl', label: 'AI/ML Agent ejecutado' },
  { id: 'erp', label: 'ERP Agent ejecutado' },
  { id: 'queue', label: 'Event queue lista' },
];

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function LiveAgentConsole({ dataset, hse, aiMl, erp }: LiveAgentConsoleProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const hseRiskRuleMatched =
    dataset.averageReadiness < 75 && dataset.failedConcepts.includes('energia_cero');
  const activeStep = steps[currentStep];
  const hseVisible = currentStep >= 1;
  const aiMlVisible = currentStep >= 2;
  const erpVisible = currentStep >= 3;
  const queueVisible = currentStep >= 4;

  const inputPayload = useMemo(
    () => ({
      moduleId: dataset.moduleId,
      averageReadiness: dataset.averageReadiness,
      failedConcepts: dataset.failedConcepts,
      supervisorValidationStatus: dataset.supervisorValidationStatus,
      trainingEvents: dataset.events.length,
      completionRate: dataset.actualCompletionRate,
      plannedReadiness: dataset.plannedReadiness,
      actualReadiness: dataset.actualReadiness,
      evidenceCompleteness: `${dataset.evidenceFieldsCompleted}/${dataset.evidenceFieldsRequired}`,
    }),
    [dataset],
  );

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

  function executeAgents() {
    setCurrentStep(0);
    setIsRunning(true);
  }

  return (
    <section className="live-console" aria-label="Live Agent Execution Console">
      <div className="console-header">
        <div>
          <p className="section-kicker">Live Agent Execution Console · datos mock</p>
          <h2>Agentes modulares ejecutando una corrida simulada</h2>
          <p>
            Consola profesional para mostrar readiness operativo, evidencia interna y eventos estándar
            sin llamadas reales a API. AI recomienda, humano valida.
          </p>
        </div>
        <button className="demo-button primary console-run-button" type="button" onClick={executeAgents}>
          Ejecutar agentes
        </button>
      </div>

      <div className="console-status" aria-live="polite">
        <span className={isRunning ? 'console-dot running' : 'console-dot'} />
        <strong>{isRunning ? 'Ejecutando agentes...' : activeStep.label}</strong>
        <span>fase piloto · validación por supervisor</span>
      </div>

      <div className="console-grid">
        <section className="console-panel console-payload">
          <div className="console-panel-header">
            <span>01</span>
            <h3>Input payload preview</h3>
          </div>
          <pre className="code-block">
            <code>{JSON.stringify(inputPayload, null, 2)}</code>
          </pre>
        </section>

        <section className="console-panel console-agents" aria-label="Tres agentes en ejecución">
          <div className="console-panel-header">
            <span>02</span>
            <h3>Agent execution cards</h3>
          </div>

          <article className={hseVisible ? 'execution-card active hse-execution' : 'execution-card'}>
            <div>
              <span className="agent-tag">HSE Agent</span>
              <h4>Riesgo preventivo de capacitación</h4>
            </div>
            <p>
              Input: averageReadiness {dataset.averageReadiness}, failedConcepts{' '}
              {dataset.failedConcepts.join(', ')}, supervisorValidationStatus{' '}
              {dataset.supervisorValidationStatus}.
            </p>
            <p>
              Logic: if readiness &lt; 75 and failedConcepts includes energia_cero → riesgo
              preventivo alto. Resultado de regla: {hseRiskRuleMatched ? 'true' : 'false'}.
            </p>
            {hseVisible ? (
              <div className="execution-output">
                <strong>Riesgo: {hse.riskLevel}</strong>
                <span>Brecha: {hse.safetyGap}</span>
                <span>Evento: {hse.standardEvent}</span>
              </div>
            ) : null}
          </article>

          <article className={aiMlVisible ? 'execution-card active aiml-execution' : 'execution-card'}>
            <div>
              <span className="agent-tag">AI/ML Agent</span>
              <h4>Fricción de módulo</h4>
            </div>
            <p>Input: training events, retries, slow responses, failed concept tags.</p>
            <p>
              Logic: calculates conceptFailureRate, retryRate, slowResponseRate,
              moduleFrictionIndex.
            </p>
            {aiMlVisible ? (
              <div className="execution-output">
                <strong>Patrón: fricción en energía cero</strong>
                <span>Concept failure rate: {formatPercent(aiMl.conceptFailureRate)}</span>
                <span>Retry rate: {formatPercent(aiMl.retryRate)}</span>
                <span>Slow response rate: {formatPercent(aiMl.slowResponseRate)}</span>
                <span>Module friction index: {aiMl.moduleFrictionIndex}</span>
                <span>Evento: {aiMl.standardEvent}</span>
              </div>
            ) : null}
          </article>

          <article className={erpVisible ? 'execution-card active erp-execution' : 'execution-card'}>
            <div>
              <span className="agent-tag">ERP Agent</span>
              <h4>Readiness vs plan operativo</h4>
            </div>
            <p>
              Input: completionRate {erp.completionRate}%, plannedReadiness{' '}
              {dataset.plannedReadiness}, actualReadiness {dataset.actualReadiness},
              evidenceCompleteness {erp.evidenceCompleteness}%.
            </p>
            <p>Logic: compares planned vs actual readiness and completion progress.</p>
            {erpVisible ? (
              <div className="execution-output">
                <strong>Project Health: {erp.projectHealth}</strong>
                <span>Brecha plan vs actual: {erp.plannedVsActualGap} puntos</span>
                <span>Readiness operativo: {erp.actualReadiness}%</span>
                <span>Evento: {erp.standardEvent}</span>
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
            {hseVisible ? <span>HSE → Riesgo: {hse.riskLevel}</span> : <span>HSE → esperando ejecución</span>}
            {aiMlVisible ? (
              <span>AI/ML → Patrón: fricción en energía cero</span>
            ) : (
              <span>AI/ML → esperando ejecución</span>
            )}
            {erpVisible ? (
              <span>ERP → Project Health: {erp.projectHealth}</span>
            ) : (
              <span>ERP → esperando ejecución</span>
            )}
          </div>
        </section>

        <section className="console-panel">
          <div className="console-panel-header">
            <span>04</span>
            <h3>Standard event queue</h3>
          </div>
          {queueVisible ? (
            <>
              <div className="event-queue">
                {[hse.standardEvent, aiMl.standardEvent, erp.standardEvent].map((event) => (
                  <span className="event-badge" key={event}>
                    {event}
                  </span>
                ))}
              </div>
              <p className="queue-note">
                Eventos listos para ser enviados a API/IES/event bus cuando el ecosistema lo
                requiera.
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
