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

/* eslint-disable @coze-arch/no-batch-import-or-export */
/* eslint-disable @coze-arch/zustand/prefer-shallow */
import { type MutableRefObject, useEffect, useState } from 'react';

import { cloneDeep } from 'lodash-es';
import { useMemoizedFn } from 'ahooks';
import { useService } from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowDocument,
  WorkflowContentChangeType,
} from '@flowgram-adapter/free-layout-editor';
import {
  type IFormSchema,
  useTestRunFormStore,
} from '@coze-workflow/test-run-next';
import { useTestFormService } from '@coze-workflow/test-run';

import {
  generateFormSchema,
  useFormDefaultValues,
  type WorkflowNodeEntity,
} from '@/test-run-kit';
import { useGlobalState } from '@/hooks';

import { type TestRunFormModel } from './test-run-form-model';
import * as ModeFormKit from './mode-form-kit';

interface UseModeFormSchemaOptions {
  node: WorkflowNodeEntity;
  formApiRef: MutableRefObject<TestRunFormModel>;
}

export const useModeFormSchema = (options: UseModeFormSchemaOptions) => {
  const { formApiRef } = options;
  const [schemaWithMode, setSchemaWithMode] = useState<null | IFormSchema>(
    null,
  );
  const { mode, patch, getSchema } = useTestRunFormStore(store => ({
    mode: store.mode,
    patch: store.patch,
    getSchema: store.getSchema,
  }));
  const globalState = useGlobalState();

  const document = useService<WorkflowDocument>(WorkflowDocument);
  const testFormService = useTestFormService();
  const { getDefaultValues } = useFormDefaultValues();
  /**
   * Computation schema
   */
  const generate = useMemoizedFn(async () => {
    const schema = await generateFormSchema({
      node: options.node,
      isChatflow: globalState.isChatflow,
      isInProject: globalState.isInIDE,
      workflowId: globalState.workflowId,
      spaceId: globalState.spaceId,
      isPreview: globalState.config.preview,
    });
    const defaultValues = await getDefaultValues(schema);
    if (defaultValues) {
      ModeFormKit.setDefaultValues({
        properties: schema.properties,
        defaultValues,
      });
    }
    patch({
      schema,
    });
    formApiRef.current.originSchema = schema;
    generateMode(schema);
  });
  const generateMode = useMemoizedFn(
    (originSchema: IFormSchema, update?: boolean) => {
      const innerSchema = cloneDeep(originSchema);
      innerSchema['x-form-mode'] = mode;
      const nodeId = innerSchema['x-node-id'];
      const cacheValues = testFormService.getCacheValues(nodeId || '');
      if (update && cacheValues) {
        ModeFormKit.setDefaultValues({
          properties: innerSchema.properties,
          defaultValues: cacheValues,
          force: true,
        });
      }
      if (mode === 'json') {
        ModeFormKit.toJsonModeSchema(innerSchema);
      }
      setSchemaWithMode(innerSchema);
      formApiRef.current.modeSchema = innerSchema;
    },
  );

  useEffect(() => {
    generate();
    const dispose = document.onContentChange(e => {
      if (e.type === WorkflowContentChangeType.NODE_DATA_CHANGE) {
        generate();
      }
    });
    return () => dispose.dispose();
  }, [options.node, document, generate]);

  useEffect(() => {
    const originSchema = getSchema();
    if (originSchema) {
      generateMode(originSchema, true);
    }
  }, [mode, generateMode]);

  return {
    schemaWithMode,
  };
};
