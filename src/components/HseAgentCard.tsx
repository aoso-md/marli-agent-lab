import type { HseAgentOutput } from '../types/agentTypes';

interface HseAgentCardProps {
  output: HseAgentOutput;
}

export function HseAgentCard({ output }: HseAgentCardProps) {
  return (
    <article className="card agent-card hse-card">
      <div className="card-header">
        <p className="section-kicker">{output.officialStyle}</p>
        <h2>Seguridad Industrial &amp; HSE</h2>
      </div>

      <div className="badge-row">
        <span className="badge">{output.officialCategory}</span>
        <span className="badge danger">Riesgo: {output.riskLevel}</span>
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
          <p>Brecha: {output.safetyGap}</p>
          <p>{output.validationStatus}</p>
          <p>{output.evidenceNote}</p>
        </section>
        <section>
          <h3>Recommended action</h3>
          <p>Acción: Reforzar antes de validación práctica · {output.recommendation}</p>
        </section>
        <section>
          <h3>Standard event generated</h3>
          <p>Evento: {output.standardEvent}</p>
        </section>
      </div>
    </article>
  );
}
