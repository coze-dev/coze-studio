import { reporter } from '@coze-arch/logger';

const timerMap: Record<string, { timer?: NodeJS.Timeout; start: number }> = {};

export function moveTimeConsuming(
  workflowId: string,
  nodeId: string,
  wait = 100,
) {
  const key = `${workflowId}&&${nodeId}`;
  if (timerMap[key]) {
    clearTimeout(timerMap[key].timer);
  } else {
    timerMap[key] = {
      timer: undefined,
      start: Date.now(),
    };
  }
  timerMap[key].timer = setTimeout(() => {
    reporter.event({
      eventName: 'workflow_node_drag_consuming',
      namespace: 'workflow',
      scope: 'node',
      meta: {
        workflowId,
        nodeId,
        time: Date.now() - timerMap[key].start,
      },
    });
    delete timerMap[key];
  }, wait);
}
