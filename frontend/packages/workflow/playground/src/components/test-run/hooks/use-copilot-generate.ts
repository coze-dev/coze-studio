/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
 * Copilot generation
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
