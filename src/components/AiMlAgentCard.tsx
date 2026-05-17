import type { AiMlAgentOutput } from '../types/agentTypes';

interface AiMlAgentCardProps {
  output: AiMlAgentOutput;
}

export function AiMlAgentCard({ output }: AiMlAgentCardProps) {
  const readableConcept = output.mostFailedConcept?.replace('_', ' ') ?? 'sin concepto crítico';

  return (
    <article className="card agent-card aiml-card">
      <div className="card-header">
        <p className="section-kicker">{output.officialStyle}</p>
        <h2>AI &amp; Machine Learning Industrial</h2>
      </div>

      <div className="badge-row">
        <span className="badge">{output.officialCategory}</span>
        <span className="badge warning">Señales tempranas</span>
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
          <p>Patrón: fricción en {readableConcept}</p>
          <p>{output.patternDetected}</p>
          <p>Concept Failure Rate: {output.conceptFailureRate}%</p>
          <p>Retry Rate: {output.retryRate}%</p>
          <p>Slow Response Rate: {output.slowResponseRate}%</p>
          <p>Module Friction Index: {output.moduleFrictionIndex}</p>
          <p>{output.suspectedCause}</p>
        </section>
        <section>
          <h3>Recommended action</h3>
          <p>Acción: revisar capacitación/SOP · {output.recommendation}</p>
        </section>
        <section>
          <h3>Standard event generated</h3>
          <p>Evento: {output.standardEvent}</p>
        </section>
      </div>
    </article>
  );
}
