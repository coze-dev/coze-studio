import { useCallback, useEffect, useRef, useState } from 'react';

import { workflowApi, CopilotType } from '@coze-workflow/base';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';

import { useGlobalState } from '@/hooks/use-global-state';

import { generateCopilotQuery } from '../utils/generate-copilot-query';
import { generateCopilotFormData } from '../utils/generate-copilot-form-data';

interface Props {
  node: FlowNodeEntity;
  onGenerate?: (data: Record<string, unknown>) => void;
}

/**
 * copilot生成
 * @param param0
 * @returns
 */
const useCopilotGenerate = ({ onGenerate, node }: Props) => {
  const { spaceId, workflowId, projectId } = useGlobalState();

  const abortRef = useRef<AbortController | null>(null);

  const [generating, setGenerating] = useState<boolean>(false);
  const [aborted, setAborted] = useState<boolean>(false);

  const generate = useCallback(async () => {
    try {
      abortRef.current = new AbortController();
      setGenerating(true);
      setAborted(false);
      const query = await generateCopilotQuery(node);
      const res = await workflowApi.CopilotGenerate(
        {
          space_id: spaceId,
          project_id: projectId ?? '0',
          copilot_type: CopilotType.INPUTS,
          workflow_id: workflowId,
          query,
        },
        { signal: abortRef.current.signal },
      );

      if (aborted || !onGenerate) {
        return;
      }

      const formData = generateCopilotFormData(node, res?.data?.content);
      if (formData) {
        onGenerate(formData);
      }
    } finally {
      setGenerating(false);
    }
  }, [aborted, node, onGenerate, projectId, spaceId]);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setAborted(true);
    setGenerating(false);
  }, []);

  useEffect(
    () => () => {
      abort();
    },
    [],
  );

  return {
    generate,
    abort,
    generating,
    aborted,
  };
};

export { useCopilotGenerate };
