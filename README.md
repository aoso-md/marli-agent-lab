# MARLI Agent Lab

MARLI Agent Lab is a standalone Vite + React + TypeScript demo for CTRL+HACK / Expo Programador. It is **not** the full MARLI application. The lab shows how mock MARLI training events can be routed into modular, API-ready agent functions for official CTRL+HACK categories.

## Purpose

The demo presents a safe, mobile-first pilot workflow for LOTO M1 readiness. MARLI generates human readiness data from mock training activity:

- operator progress
- quiz answers
- failed concepts
- time to answer
- attempts
- readiness score
- internal evidence status
- supervisor validation status

All information is synthetic and anonymous. The app uses the safe framing: **fase piloto**, **datos mock**, **evidencia interna**, **validación por supervisor**, **AI recomienda, humano valida**, **riesgo preventivo de capacitación**, and **readiness operativo**.

## Demo flow

```text
MARLI Training Events → HSE → AI/ML → ERP
```

The code architecture follows a clean data-to-agent-to-UI pipeline:

```text
mock data → pure agent functions → agent router → UI cards
```

## Agents

### 1. Seguridad Industrial & HSE

- Style: `Agente Híbrido · Safety`
- Tools represented: `track_safety_kpis`, `report_safety_incident`, `investigate_root_cause_hse`
- MARLI adaptation: interprets low readiness in LOTO as a **riesgo preventivo de capacitación**, not as a real accident.
- Standard event: `safety_kpi_report`

### 2. AI & Machine Learning Industrial

- Style: `Agente Híbrido · AI/ML`
- Tools represented: `detect_process_deviation`, `identify_bottlenecks`, `detect_real_time_anomalies`, `run_local_inference`
- MARLI adaptation: detects early friction signals in training events and learning/process flow.
- Standard event: `process_deviation_detected`

This demo does not claim advanced prediction and does not claim accident prediction.

### 3. ERP & Gestión Empresarial

- Style: `Agente Cloud · ERP`
- Tools represented: `track_project_progress`, `generate_kpis`, `compare_planned_vs_actual`, `detect_production_deviation`
- MARLI adaptation: turns readiness and evidence data into management/project KPIs for a pilot.
- Standard event: `project_progress_update`

## Formulas

All percentage formulas guard against division by zero and return rounded whole-number percentages.

- Completion Rate = `operatorsCompleted / operatorsAssigned * 100`
- Readiness Gap = `plannedReadiness - actualReadiness`
- Evidence Completeness = `evidenceFieldsCompleted / evidenceFieldsRequired * 100`
- Planned vs Actual Gap = `planned - actual`
- Concept Failure Rate = `failed events for concept / all events for concept * 100`
- Retry Rate = `events with attemptNumber > 1 / all events * 100`
- Slow Response Rate = `events above threshold / all events * 100`
- Module Friction Index = average of concept failure rate, retry rate, and slow response rate

## Safe language and limits

This repository intentionally avoids unsafe or unsupported claims:

- No Supabase
- No login
- No real user data
- No real sensors
- No STPS/DC-3 compliance claim
- No accident prediction claim
- No claim that AI decides for the plant

The intended framing is: **AI recomienda, humano valida**. The output is for **evidencia interna** and **fase piloto** only, with final validation by a supervisor.

## API-ready design

The implementation keeps logic separate from UI:

- `src/data/mockMarliTrainingData.ts` contains the mock dataset.
- `src/lib/calculations.ts` contains pure calculation helpers.
- `src/agents/*Agent.ts` files contain pure agent functions.
- `src/agents/agentRouter.ts` routes the dataset through all agents.
- `src/components/*Card.tsx` and `src/pages/AgentDemoPage.tsx` render the demo.

Future integrations can replace the mock dataset with API events, message queues, tool manifests, or signed internal evidence payloads without changing the UI contract.

## Local development

Use pnpm only.

```bash
pnpm install
pnpm dev
pnpm build
```

## Future integration ideas

- Publish agent outputs as event payloads for API consumers.
- Map each represented tool to a tool manifest.
- Add ingestion adapters for mock event streams.
- Add supervisor validation workflows while preserving the human-in-the-loop model.
- Export internal evidence summaries for pilot review without claiming automatic compliance.
