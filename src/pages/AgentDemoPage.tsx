import { LiveAgentConsole } from '../components/LiveAgentConsole';
import { mockMarliTrainingData } from '../data/mockMarliTrainingData';

const logicCards = [
  {
    agent: 'HSE',
    focus: 'riesgo preventivo de capacitación',
    toolCategory: 'Seguridad Industrial & HSE',
    coreLogic:
      'Interpreta readiness bajo, conceptos fallidos y validación pendiente como señal preventiva de capacitación.',
    standardEvent: 'safety_kpi_report',
  },
  {
    agent: 'AI/ML',
    focus: 'fricción de aprendizaje/proceso',
    toolCategory: 'AI & Machine Learning Industrial',
    coreLogic:
      'Calcula fricción del módulo con eventos mock, reintentos, respuestas lentas y conceptos repetidos.',
    standardEvent: 'process_deviation_detected',
  },
  {
    agent: 'ERP',
    focus: 'KPI de avance del piloto',
    toolCategory: 'ERP & Gestión Empresarial',
    coreLogic:
      'Convierte operadores completados, brecha de readiness y evidencia interna en KPIs de readiness operativo.',
    standardEvent: 'project_progress_update',
  },
];

export function AgentDemoPage() {
  const validationLabel =
    mockMarliTrainingData.supervisorValidationStatus === 'pending'
      ? 'pendiente'
      : mockMarliTrainingData.supervisorValidationStatus;

  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby="page-title">
        <div className="hero-copy">
          <span className="badge hero-badge">fase piloto · datos mock · AI recomienda, humano valida</span>
          <h1 id="page-title">MARLI Agent Lab</h1>
          <p>Supervisor Console · LOTO M1 readiness operativo</p>
        </div>

        <div className="kpi-strip" aria-label="KPIs compactos del piloto">
          <article className="kpi-chip">
            <span>Readiness actual</span>
            <strong>{mockMarliTrainingData.actualReadiness}%</strong>
          </article>
          <article className="kpi-chip">
            <span>Meta</span>
            <strong>{mockMarliTrainingData.plannedReadiness}%</strong>
          </article>
          <article className="kpi-chip">
            <span>Operadores completados</span>
            <strong>
              {mockMarliTrainingData.operatorsCompleted}/{mockMarliTrainingData.operatorsAssigned}
            </strong>
          </article>
          <article className="kpi-chip">
            <span>Validación supervisor</span>
            <strong>{validationLabel}</strong>
          </article>
        </div>
      </section>

      <LiveAgentConsole dataset={mockMarliTrainingData} />

      <section className="compact-section" aria-labelledby="logic-summary-title">
        <div className="section-heading">
          <p className="section-kicker">Lógica compartida · mismo dataset</p>
          <h2 id="logic-summary-title">Cómo interpretan los agentes el mismo dataset</h2>
        </div>

        <div className="logic-card-grid">
          {logicCards.map((card) => (
            <article className="logic-card" key={card.agent}>
              <div>
                <span className="agent-pill">{card.agent}</span>
                <h3>{card.focus}</h3>
              </div>
              <dl className="compact-definition-list">
                <div>
                  <dt>Tool category</dt>
                  <dd>{card.toolCategory}</dd>
                </div>
                <div>
                  <dt>Core logic</dt>
                  <dd>{card.coreLogic}</dd>
                </div>
                <div>
                  <dt>Standard event</dt>
                  <dd>{card.standardEvent}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="integration-panel" aria-labelledby="ecosystem-contract-title">
        <div className="section-heading">
          <p className="section-kicker">Contrato compacto de integración</p>
          <h2 id="ecosystem-contract-title">API-ready / Ecosystem Contract</h2>
        </div>

        <div className="integration-grid">
          <div>
            <h3>Endpoints</h3>
            <div className="event-queue compact-badges">
              <span className="event-badge">POST /api/agents/run-all</span>
              <span className="event-badge">GET /api/agents/manifest</span>
            </div>
          </div>
          <div>
            <h3>Events</h3>
            <div className="event-queue compact-badges">
              <span className="event-badge">safety_kpi_report</span>
              <span className="event-badge">process_deviation_detected</span>
              <span className="event-badge">project_progress_update</span>
            </div>
          </div>
          <div>
            <h3>Tool manifest</h3>
            <div className="event-queue compact-badges">
              <span className="event-badge">run_hse_agent</span>
              <span className="event-badge">run_ai_ml_agent</span>
              <span className="event-badge">run_erp_agent</span>
              <span className="event-badge">run_all_marli_agents</span>
            </div>
          </div>
        </div>

        <p className="integration-copy">
          GitHub provides the source and contract. API endpoints expose the agents. Standard events allow
          other teams to consume MARLI outputs.
        </p>
      </section>

      <footer className="footer-note">
        Demo con datos mock. MARLI genera evidencia interna y recomendaciones de fase piloto. La
        validación final corresponde al supervisor.
      </footer>
    </main>
  );
}
