const flowSteps = ['MARLI Training Events', 'HSE', 'AI/ML', 'ERP'];

export function AgentFlow() {
  return (
    <section className="flow-card" aria-label="Flujo de agentes">
      <p className="section-kicker">Agent Router</p>
      <h2>MARLI Training Events → HSE → AI/ML → ERP</h2>
      <div className="flow-steps">
        {flowSteps.map((step, index) => (
          <div className="flow-step-group" key={step}>
            <span className="flow-step">{step}</span>
            {index < flowSteps.length - 1 ? <span className="flow-arrow">→</span> : null}
          </div>
        ))}
      </div>
      <p className="muted">
        mock data → pure agent functions → agent router → UI cards
      </p>
    </section>
  );
}
