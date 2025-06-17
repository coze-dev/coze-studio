/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from 'react';

import { variableUtils } from '@coze-workflow/variable';
import { typeSafeJSONParse } from '@coze-workflow/test-run';
import { workflowApi, ViewVariableType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import {
  CopilotType,
  TestCaseGeneratedBy,
} from '@coze-arch/bot-api/workflow_api';
import { Toast } from '@coze-arch/coze-design';

import { useGlobalState, useTestRunReporterService } from '@/hooks';

import { type TestFormSchema, type TestFormField } from '../../types';
import { FieldName } from '../../constants';

const generateConfig = (fields: TestFormField[]) => {
  const temp: any[] = [];
  fields.forEach(field => {
    if (field?.name !== FieldName.Node || !field.children.length) {
      return;
    }
    field.children.forEach(child => {
      if (
        !child?.name ||
        !child.children.length ||
        child.name === FieldName.Input
      ) {
        return;
      }
      const parentTemp: any = {
        type: 'object',
        name: child.name,
        schema: [],
      };
      child.children.forEach(item => {
        if (
          !item.name ||
          ViewVariableType.isFileType(item.originType) ||
          ViewVariableType.isVoiceType(item.originType)
        ) {
          return;
        }
        const types = variableUtils.viewTypeToDTOType(item.originType);
        const itemTemp = {
          name: item.name,
          type: types.type,
          required: item.required,
          schema: item?.dtoMeta?.schema,
        };
        parentTemp.schema.push(itemTemp);
      });
      temp.push(parentTemp);
    });
  });
  return temp;
};

interface UseAIGenerateOptions {
  type: 'flow' | 'node';
  onGenerate: (data: any) => void;
}

export const useAIGenerate = ({ type, onGenerate }: UseAIGenerateOptions) => {
  const globalState = useGlobalState();
  const reporter = useTestRunReporterService();
  const [generating, setGenerating] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const abortedRef = useRef<boolean>(false);

  const generate = async (schema: TestFormSchema) => {
    try {
      setGenerating(true);
      abortRef.current = new AbortController();
      abortedRef.current = false;
      const config = JSON.stringify(generateConfig(schema.fields));
      const res = await workflowApi.CopilotGenerate(
        {
          space_id: globalState.spaceId,
          project_id: globalState.projectId || '',
          copilot_type:
            type === 'flow'
              ? CopilotType.TestRunInput
              : CopilotType.NodeDebugInput,
          query: '{}',
          workflow_id: globalState.workflowId,
          generate_test_case_input: {
            generate_node_debug_input_config: {
              node_id: schema.id,
              node_config: config,
            },
          },
        },
        { signal: abortRef.current.signal },
      );
      if (abortedRef.current) {
        return;
      }
      const nextValues = typeSafeJSONParse(res?.data?.content);
      if (!nextValues) {
        Toast.warning(I18n.t('workflow_testset_aifail'));
        reporter.formGenDataOrigin({ gen_data_origin: 'ai_failed' });
        return;
      }
      if (res.generated_by === TestCaseGeneratedBy.Policy) {
        Toast.warning(I18n.t('wf_testrun_ai_gen_toast'));
        reporter.formGenDataOrigin({ gen_data_origin: 'ai_backup' });
      } else {
        reporter.formGenDataOrigin({ gen_data_origin: 'ai' });
      }
      onGenerate(nextValues);
      // eslint-disable-next-line @coze-arch/no-empty-catch
    } catch {
      //
    } finally {
      setGenerating(false);
    }
  };

  const abort = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    abortedRef.current = true;
    setGenerating(false);
  };

  return {
    generating,
    generate,
    abort,
  };
};
