const endpoints = [
  'POST /api/agents/hse',
  'POST /api/agents/ai-ml',
  'POST /api/agents/erp',
  'POST /api/agents/run-all',
  'GET /api/agents/manifest',
];

const tools = [
  {
    name: 'run_hse_agent',
    standardEvent: 'safety_kpi_report',
  },
  {
    name: 'run_ai_ml_agent',
    standardEvent: 'process_deviation_detected',
  },
  {
    name: 'run_erp_agent',
    standardEvent: 'project_progress_update',
  },
  {
    name: 'run_all_marli_agents',
    standardEvent: 'agent_bundle_completed',
  },
];

export function EcosystemContract() {
  return (
    <section className="ecosystem-contract" aria-label="Ecosystem Integration Contract">
      <div className="contract-header">
        <p className="section-kicker">Contrato modular · API-ready · interoperable</p>
        <h2>Ecosystem Integration Contract</h2>
        <p>
          Contrato de fase piloto con datos mock para comunicar cómo otros equipos podrían consumir
          agentes MARLI sin agregar login, Supabase ni datos reales.
        </p>
      </div>

      <div className="contract-grid">
        <section className="contract-panel">
          <h3>API-ready endpoints</h3>
          <div className="endpoint-list" aria-label="Endpoints API-ready">
            {endpoints.map((endpoint) => (
              <code className="endpoint-chip" key={endpoint}>
                {endpoint}
              </code>
            ))}
          </div>
        </section>

        <section className="contract-panel">
          <h3>Tool manifest</h3>
          <div className="tool-manifest">
            {tools.map((tool) => (
              <article className="tool-card" key={tool.name}>
                <h4>{tool.name}</h4>
                <p>
                  <strong>input:</strong> MarliTrainingDataset
                </p>
                <p>
                  <strong>output:</strong> typed agent result
                </p>
                <p>
                  <strong>standardEvent:</strong> {tool.standardEvent}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="contract-panel contract-explanation">
          <h3>Interoperability explanation</h3>
          <p>
            GitHub provides the source and contract. API endpoints expose the agents. Standard
            events allow other teams to consume MARLI outputs.
          </p>
        </section>

        <section className="contract-panel safe-boundary">
          <h3>Safe boundary</h3>
          <p>AI recomienda. Humano valida. Supervisor decide.</p>
        </section>
      </div>
    </section>
  );
}
