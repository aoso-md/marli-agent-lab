import type { MarliTrainingDataset } from '../types/agentTypes';

interface DataSourceCardProps {
  data: MarliTrainingDataset;
}

export function DataSourceCard({ data }: DataSourceCardProps) {
  return (
    <section className="card data-card">
      <div className="card-header">
        <p className="section-kicker">Mock Source</p>
        <h2>MARLI Readiness Dataset</h2>
      </div>
      <div className="metric-grid">
        <div className="metric">
          <span>Módulo</span>
          <strong>LOTO M1</strong>
        </div>
        <div className="metric">
          <span>Readiness actual</span>
          <strong>{data.actualReadiness}%</strong>
        </div>
        <div className="metric">
          <span>Meta</span>
          <strong>{data.plannedReadiness}%</strong>
        </div>
        <div className="metric">
          <span>Operadores</span>
          <strong>
            {data.operatorsCompleted}/{data.operatorsAssigned} completados
          </strong>
        </div>
        <div className="metric">
          <span>Brecha crítica</span>
          <strong>energía cero</strong>
        </div>
        <div className="metric">
          <span>Evidencia interna</span>
          <strong>
            {data.evidenceFieldsCompleted}/{data.evidenceFieldsRequired} campos
          </strong>
        </div>
        <div className="metric wide">
          <span>Validación supervisor</span>
          <strong>pendiente</strong>
        </div>
      </div>
    </section>
  );
}
