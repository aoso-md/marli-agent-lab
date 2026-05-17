import { runAiMlAgent } from './aiMlAgent';
import { runErpAgent } from './erpAgent';
import { runHseAgent } from './hseAgent';
import type { AgentRouterOutput, MarliTrainingDataset } from '../types/agentTypes';

export function runAllAgents(data: MarliTrainingDataset): AgentRouterOutput {
  return {
    hse: runHseAgent(data),
    aiMl: runAiMlAgent(data),
    erp: runErpAgent(data),
  };
}
