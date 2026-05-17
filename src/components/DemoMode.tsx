import { useEffect, useMemo, useState } from 'react';
import type {
  AiMlAgentOutput,
  ErpAgentOutput,
  HseAgentOutput,
  MarliTrainingDataset,
} from '../types/agentTypes';

interface DemoModeProps {
  hse: HseAgentOutput;
  aiMl: AiMlAgentOutput;
  erp: ErpAgentOutput;
  dataset: MarliTrainingDataset;
}

interface DemoStep {
  title: string;
  text: string;
  highlight?: string;
  output: string[];
  event?: string;
  agentLabel: string;
}

const DEMO_STEP_DELAY_MS = 2200;

export function DemoMode({ hse, aiMl, erp, dataset }: DemoModeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const steps = useMemo<DemoStep[]>(
    () => [
      {
        title: 'MARLI Readiness Dataset',
        text: 'MARLI captura datos mock de LOTO M1: respuestas, errores, tiempos, intentos y readiness.',
        highlight: `Readiness actual: ${dataset.actualReadiness}% · Meta: ${dataset.plannedReadiness}%`,
        output: [
          `${dataset.events.length} eventos mock internos`,
          `${dataset.operatorsCompleted}/${dataset.operatorsAssigned} operadores con avance`,
        ],
        agentLabel: 'Dataset mock',
      },
      {
        title: 'HSE Agent',
        text: 'Interpreta readiness bajo como riesgo preventivo de capacitación para revisión interna del piloto.',
        output: [`Riesgo: ${hse.riskLevel}`, `Brecha: ${hse.safetyGap}`],
        event: hse.standardEvent,
        agentLabel: 'Safety',
      },
      {
        title: 'AI/ML Industrial Agent',
        text: 'Detecta señales tempranas de fricción en el aprendizaje usando errores, reintentos y tiempos de respuesta.',
        output: ['Patrón: fricción en energía cero', `Module Friction Index: ${aiMl.moduleFrictionIndex}`],
        event: aiMl.standardEvent,
        agentLabel: 'AI/ML',
      },
      {
        title: 'ERP Agent',
        text: 'Convierte readiness y avance del piloto en KPIs de gestión para el supervisor.',
        output: [`Completion: ${erp.completionRate}%`, `Project Health: ${erp.projectHealth}`],
        event: erp.standardEvent,
        agentLabel: 'ERP',
      },
      {
        title: 'Human-in-the-loop',
        text: 'La IA recomienda. El supervisor valida. MARLI genera evidencia interna de fase piloto.',
        output: ['Acción: priorizar refuerzo en Turno A antes de validación práctica.'],
        agentLabel: 'Supervisor',
      },
    ],
    [aiMl.moduleFrictionIndex, dataset, erp.completionRate, erp.projectHealth, hse.riskLevel, hse.safetyGap, hse.standardEvent, aiMl.standardEvent, erp.standardEvent],
  );

  const activeStep = steps[currentStep];
  const progressPercent = ((currentStep + 1) / steps.length) * 100;

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
    }, DEMO_STEP_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [currentStep, isRunning, steps.length]);

  function runDemo() {
    setCurrentStep(0);
    setIsRunning(true);
  }

  function resetDemo() {
    setCurrentStep(0);
    setIsRunning(false);
  }

  return (
    <section className="demo-mode-card" aria-label="Demo guiada de agentes">
      <div className="demo-mode-header">
        <div>
          <p className="section-kicker">Demo Mode · fase piloto</p>
          <h2>Flujo guiado de agentes en menos de 60 segundos</h2>
          <p className="demo-mode-intro">
            Recorrido con datos mock, evidencia interna y validación por supervisor: AI recomienda,
            humano valida.
          </p>
        </div>
        <div className="demo-mode-actions" aria-label="Controles de demo">
          <button className="demo-button primary" type="button" onClick={runDemo}>
            Ejecutar demo de agentes
          </button>
          <button className="demo-button secondary" type="button" onClick={resetDemo}>
            Reiniciar demo
          </button>
        </div>
      </div>

      <div className="demo-progress" aria-label={`Paso ${currentStep} de ${steps.length - 1}`}>
        <div className="demo-progress-bar" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="demo-step-panel">
        <div className="demo-step-indicator">
          <span>Paso {currentStep}</span>
          <strong>{activeStep.agentLabel}</strong>
        </div>

        <div className="demo-step-copy">
          <h3>{activeStep.title}</h3>
          <p>{activeStep.text}</p>
          {activeStep.highlight ? <strong className="demo-highlight">{activeStep.highlight}</strong> : null}
        </div>

        <div className="demo-output-list" aria-label="Salida del paso actual">
          {activeStep.output.map((item) => (
            <span className="demo-output-chip" key={item}>
              {item}
            </span>
          ))}
          {activeStep.event ? (
            <span className="demo-event-badge">Evento: {activeStep.event}</span>
          ) : null}
        </div>
      </div>

      <div className="demo-event-strip" aria-label="Eventos generados por agentes">
        {[hse.standardEvent, aiMl.standardEvent, erp.standardEvent].map((event) => (
          <span className="demo-event-badge compact" key={event}>
            {event}
          </span>
        ))}
      </div>
    </section>
  );
}
