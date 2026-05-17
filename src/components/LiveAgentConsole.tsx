import { useEffect, useState } from 'react';
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

interface ConsoleAgentCard {
  id: 'hse' | 'aiMl' | 'erp';
  title: string;
  subtitle: string;
  input: string[];
  logic: string;
  output: string[];
  event: string;
}

const EXECUTION_DELAY_MS = 1100;
const EXECUTION_STEPS = 4;

export function LiveAgentConsole({ dataset, hse, aiMl, erp }: LiveAgentConsoleProps) {
  const [executionStep, setExecutionStep] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);

  const failedConcept = dataset.failedConcepts[0] ?? 'sin_brecha_mock';
  const agentCards: ConsoleAgentCard[] = [
    {
      id: 'hse',
      title: 'HSE Agent',
      subtitle: 'riesgo preventivo de capacitación',
      input: [
        `averageReadiness: ${dataset.averageReadiness}`,
        `failedConcepts: ${failedConcept}`,
        `supervisorValidationStatus: ${dataset.supervisorValidationStatus}`,
      ],
      logic:
        'if readiness < 75 and failedConcepts includes energia_cero → riesgo preventivo alto',
      output: [`Riesgo: ${hse.riskLevel}`, `Brecha: ${hse.safetyGap}`, `Evento: ${hse.standardEvent}`],
      event: hse.standardEvent,
    },
    {
      id: 'aiMl',
      title: 'AI/ML Agent',
      subtitle: 'señales de fricción de aprendizaje',
      input: ['training events', 'retries', 'slow responses', 'failed concept tags'],
      logic: 'calculates conceptFailureRate, retryRate, slowResponseRate, moduleFrictionIndex',
      output: ['Patrón: fricción en energía cero', `Evento: ${aiMl.standardEvent}`],
      event: aiMl.standardEvent,
    },
    {
      id: 'erp',
      title: 'ERP Agent',
      subtitle: 'readiness operativo para gestión',
      input: [
        `completionRate: ${erp.completionRate}`,
        `plannedReadiness: ${dataset.plannedReadiness}`,
        `actualReadiness: ${dataset.actualReadiness}`,
        `evidenceCompleteness: ${erp.evidenceCompleteness}`,
      ],
      logic: 'compares planned vs actual readiness and completion progress',
      output: [`Project Health: ${erp.projectHealth}`, `Evento: ${erp.standardEvent}`],
      event: erp.standardEvent,
    },
  ];

  useEffect(() => {
    if (!isExecuting) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setExecutionStep((currentStep) => {
        if (currentStep >= EXECUTION_STEPS) {
          setIsExecuting(false);
          return currentStep;
        }

        return currentStep + 1;
      });
    }, EXECUTION_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [executionStep, isExecuting]);

  function executeAgents() {
    setExecutionStep(0);
    setIsExecuting(true);
  }

  const visibleEvents = agentCards.filter((_, index) => executionStep >= index + 1);
  const isQueueVisible = executionStep >= EXECUTION_STEPS;

  return (
    <section className="live-console" aria-label="Live Agent Execution Console">
      <div className="console-header">
        <div>
          <p className="section-kicker">Live Agent Execution Console · datos mock</p>
          <h2>Agentes modulares ejecutando sobre readiness operativo</h2>
          <p>
            Simulación local sin llamadas API: muestra payload, lógica visible, outputs tipados y
            eventos estándar para fase piloto.
          </p>
        </div>
        <button className="console-run-button" type="button" onClick={executeAgents}>
          Ejecutar agentes
        </button>
      </div>

      <div className="console-terminal" aria-live="polite">
        <div className="terminal-bar">
          <span />
          <span />
          <span />
          <strong>{isExecuting ? 'running agents...' : 'marli-agent-router.local'}</strong>
        </div>

        <div className="console-grid">
          <section className="payload-preview" aria-label="Input payload preview">
            <h3>A) Input payload preview</h3>
            <pre>{`{
  moduleId: "${dataset.moduleId}",
  process: "${dataset.process}",
  averageReadiness: ${dataset.averageReadiness},
  actualReadiness: ${dataset.actualReadiness},
  failedConcepts: ["${failedConcept}"],
  supervisorValidationStatus: "${dataset.supervisorValidationStatus}"
}`}</pre>
          </section>

          <section className="output-preview" aria-label="Output preview">
            <h3>C) Output preview</h3>
            <div className="console-output-lines">
              {visibleEvents.length === 0 ? <p>Esperando ejecución de agentes...</p> : null}
              {visibleEvents.map((agent) => (
                <p key={agent.id}>
                  <strong>{agent.title}:</strong> {agent.output.join(' · ')}
                </p>
              ))}
            </div>
          </section>
        </div>

        <section className="console-agent-list" aria-label="Tres agent execution cards">
          <h3>B) Three agent execution cards</h3>
          <div className="console-agent-grid">
            {agentCards.map((agent, index) => {
              const isRevealed = executionStep >= index + 1;

              return (
                <article className={`console-agent-card ${isRevealed ? 'is-complete' : ''}`} key={agent.id}>
                  <div className="console-agent-card-header">
                    <div>
                      <span>{agent.subtitle}</span>
                      <h4>{agent.title}</h4>
                    </div>
                    <strong>{isRevealed ? 'output listo' : 'en espera'}</strong>
                  </div>

                  <div className="console-mini-block">
                    <h5>Input</h5>
                    {agent.input.map((item) => (
                      <code key={item}>{item}</code>
                    ))}
                  </div>

                  <div className="console-mini-block">
                    <h5>Logic</h5>
                    <p>{agent.logic}</p>
                  </div>

                  {isRevealed ? (
                    <div className="console-mini-block output-ready">
                      <h5>Output</h5>
                      {agent.output.map((item) => (
                        <p key={item}>{item}</p>
                      ))}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>

        <section className={`event-queue ${isQueueVisible ? 'is-visible' : ''}`} aria-label="Standard event queue">
          <div>
            <h3>D) Standard event queue</h3>
            <p>Eventos listos para ser enviados a API/IES/event bus cuando el ecosistema lo requiera.</p>
          </div>
          <div className="event-badge-row">
            {isQueueVisible ? (
              agentCards.map((agent) => (
                <span className="demo-event-badge compact" key={agent.event}>
                  {agent.event}
                </span>
              ))
            ) : (
              <span className="queue-waiting">Esperando outputs HSE → AI/ML → ERP</span>
            )}
          </div>
        </section>

        <section className="human-validation-note" aria-label="Human validation note">
          <h3>E) Human validation note</h3>
          <p>AI recomienda, humano valida. La validación por supervisor decide la acción final.</p>
        </section>
      </div>
    </section>
  );
}
