import type { ErpAgentOutput } from '../types/agentTypes';

interface ErpAgentCardProps {
  output: ErpAgentOutput;
}

export function ErpAgentCard({ output }: ErpAgentCardProps) {
  return (
    <article className="card agent-card erp-card">
      <div className="card-header">
        <p className="section-kicker">{output.officialStyle}</p>
        <h2>ERP &amp; Gestión Empresarial</h2>
      </div>

      <div className="badge-row">
        <span className="badge">{output.officialCategory}</span>
        <span className="badge success">Project Health: {output.projectHealth}</span>
      </div>

      <div className="content-stack">
        <section>
          <h3>Tools used</h3>
          <p>{output.toolsUsed.join(' · ')}</p>
        </section>
        <section>
          <h3>MARLI input summary</h3>
          <p>{output.inputSummary}</p>
        </section>
        <section>
          <h3>Logic summary</h3>
          <p>{output.logicSummary}</p>
        </section>
        <section className="output-box">
          <h3>Output</h3>
          <p>Completion: {output.completionRate}%</p>
          <p>Readiness: {output.actualReadiness}%</p>
          <p>Project Health: {output.projectHealth}</p>
          <p>Operadores en riesgo preventivo de capacitación: {output.operatorsAtRisk}</p>
          <p>Evidencia interna completa: {output.evidenceCompleteness}%</p>
          <p>Brecha plan vs actual: {output.plannedVsActualGap} puntos</p>
          <p>{output.managementSummary}</p>
        </section>
        <section>
          <h3>Recommended action</h3>
          <p>Acción: priorizar refuerzo en Turno A · {output.suggestedBusinessAction}</p>
        </section>
        <section>
          <h3>Standard event generated</h3>
          <p>Evento: {output.standardEvent}</p>
        </section>
      </div>
    </article>
  );
}
