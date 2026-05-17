import type { AiMlAgentOutput, ErpAgentOutput, HseAgentOutput } from '../types/agentTypes';

interface EcosystemContractProps {
  hse: HseAgentOutput;
  aiMl: AiMlAgentOutput;
  erp: ErpAgentOutput;
}

interface ToolManifestCard {
  name: string;
  standardEvent: string;
}

const apiEndpoints = [
  'POST /api/agents/hse',
  'POST /api/agents/ai-ml',
  'POST /api/agents/erp',
  'POST /api/agents/run-all',
  'GET /api/agents/manifest',
];

export function EcosystemContract({ hse, aiMl, erp }: EcosystemContractProps) {
  const tools: ToolManifestCard[] = [
    { name: 'run_hse_agent', standardEvent: hse.standardEvent },
    { name: 'run_ai_ml_agent', standardEvent: aiMl.standardEvent },
    { name: 'run_erp_agent', standardEvent: erp.standardEvent },
    { name: 'run_all_marli_agents', standardEvent: 'multi_agent_event_queue' },
  ];

  return (
    <section className="ecosystem-contract" aria-label="Ecosystem Integration Contract">
      <div className="contract-header">
        <p className="section-kicker">API-ready · interoperabilidad · fase piloto</p>
        <h2>Ecosystem Integration Contract</h2>
        <p>
          Contrato modular con datos mock para mostrar cómo MARLI expone agentes, resultados tipados
          y eventos estándar sin usar datos reales.
        </p>
      </div>

      <div className="contract-section">
        <h3>A) API-ready endpoints</h3>
        <div className="endpoint-chip-row">
          {apiEndpoints.map((endpoint) => (
            <code className="endpoint-chip" key={endpoint}>
              {endpoint}
            </code>
          ))}
        </div>
      </div>

      <div className="contract-section">
        <h3>B) Tool manifest</h3>
        <div className="tool-manifest-grid">
          {tools.map((tool) => (
            <article className="tool-manifest-card" key={tool.name}>
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
      </div>

      <div className="contract-callouts">
        <section>
          <h3>C) Interoperability explanation</h3>
          <p>
            GitHub provides the source and contract. API endpoints expose the agents. Standard events
            allow other teams to consume MARLI outputs.
          </p>
        </section>
        <section>
          <h3>D) Safe boundary</h3>
          <p>AI recomienda. Humano valida. Supervisor decide.</p>
        </section>
      </div>
    </section>
  );
}
