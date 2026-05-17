import { runAllAgents } from '../agents/agentRouter';
import { AgentFlow } from '../components/AgentFlow';
import { AiMlAgentCard } from '../components/AiMlAgentCard';
import { DataSourceCard } from '../components/DataSourceCard';
import { DemoMode } from '../components/DemoMode';
import { ErpAgentCard } from '../components/ErpAgentCard';
import { EcosystemContract } from '../components/EcosystemContract';
import { HseAgentCard } from '../components/HseAgentCard';
import { LiveAgentConsole } from '../components/LiveAgentConsole';
import { mockMarliTrainingData } from '../data/mockMarliTrainingData';

const agentOutputs = runAllAgents(mockMarliTrainingData);

export function AgentDemoPage() {
  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <span className="badge hero-badge">fase piloto · datos mock · AI recomienda, humano valida</span>
          <h1>MARLI Agent Lab</h1>
          <p>Datos mock de LOTO M1 alimentando agentes oficiales CTRL+HACK</p>
        </div>
        <div className="hero-panel" aria-label="Resumen del piloto">
          <span>readiness operativo</span>
          <strong>{mockMarliTrainingData.actualReadiness}%</strong>
          <small>validación por supervisor pendiente</small>
        </div>
      </section>

      <DataSourceCard data={mockMarliTrainingData} />
      <AgentFlow />
      <DemoMode
        dataset={mockMarliTrainingData}
        hse={agentOutputs.hse}
        aiMl={agentOutputs.aiMl}
        erp={agentOutputs.erp}
      />
      <LiveAgentConsole dataset={mockMarliTrainingData} />

      <section className="agent-grid" aria-label="Agentes CTRL+HACK">
        <HseAgentCard output={agentOutputs.hse} />
        <AiMlAgentCard output={agentOutputs.aiMl} />
        <ErpAgentCard output={agentOutputs.erp} />
      </section>

      <EcosystemContract />

      <footer className="footer-note">
        Demo con datos mock. MARLI genera evidencia interna y recomendaciones de fase piloto. La
        validación final corresponde al supervisor.
      </footer>
    </main>
  );
}
