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

import { useCallback, useEffect, useMemo, type FC } from 'react';

import classNames from 'classnames';
import {
  FabricEditor,
  FabricPreview,
  type FabricSchema,
} from '@coze-workflow/fabric-canvas';
import { type InputVariable } from '@coze-workflow/base/types';
import { IconCozScaling } from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';

import { useNodeFormPanelState } from '@/hooks/use-node-side-sheet-store';
import { useNodeRenderScene, useRedoUndo } from '@/hooks';
import { useField, useForm } from '@/form';
import { useSingletonInnerSideSheet } from '@/components/workflow-inner-side-sheet';

export const Canvas: FC<{ variables?: InputVariable[] }> = ({
  variables,
}): JSX.Element => {
  const context = useField<string>();
  const { value, onChange: _onChange, readonly } = context;
  const schema = useMemo<FabricSchema>(
    () => JSON.parse(value ?? '{}'),
    [value],
  );

  const onChange = useCallback(
    (s: FabricSchema) => {
      _onChange(JSON.stringify(s));
    },
    [_onChange],
  );
  const form = useForm();
  const nodeMeta = (
    form?.values as {
      nodeMeta: {
        icon: string;
        title: string;
      };
    }
  )?.nodeMeta;
  const { icon, title } = nodeMeta ?? {};
  const nodeId = context?.key;
  const sheetId = `sheet-of-canvas-node-${nodeId}`;

  const { visible } = useSingletonInnerSideSheet(sheetId);

  const { setFullscreenPanel, fullscreenPanel } = useNodeFormPanelState();
  const { isNodeSideSheet } = useNodeRenderScene();

  const fullscreenPanelVisible = !!fullscreenPanel;
  const fabricEditor = useMemo(
    () =>
      isNodeSideSheet && (
        <FabricEditor
          id={sheetId}
          variables={variables}
          onChange={onChange}
          onClose={() => setFullscreenPanel(null)}
          icon={icon}
          title={title}
          schema={schema}
          readonly={readonly}
          className="min-w-[800px]"
        />
      ),
    [
      isNodeSideSheet,
      sheetId,
      variables,
      onChange,
      setFullscreenPanel,
      icon,
      title,
      readonly,
    ],
  );

  const openSideSheetAndScrollToNode = useCallback(() => {
    setFullscreenPanel(fabricEditor);
  }, [setFullscreenPanel]);

  // update node
  useEffect(() => {
    if (fabricEditor && fullscreenPanelVisible) {
      setFullscreenPanel(fabricEditor);
    }
  }, [fabricEditor]);

  const { start, stop } = useRedoUndo();

  useEffect(() => {
    if (visible || fullscreenPanelVisible) {
      stop();
    } else {
      start();
    }
  }, [visible, fullscreenPanelVisible]);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 10,
          right: 12,
        }}
      >
        <IconButton
          size="small"
          color="secondary"
          icon={
            readonly ? null : (
              <IconCozScaling className={'coz-fg-hglt text-sm'} />
            )
          }
          onClick={() => openSideSheetAndScrollToNode()}
        ></IconButton>
      </div>

      <div
        className={classNames([
          'flex flex-col items-center justify-center',
          'overflow-hidden',
          'rounded-mini mt-[8px]',
          'border border-solid coz-stroke-plus hover:coz-stroke-hglt active:coz-stroke-hglt',
        ])}
        onDoubleClick={() => {
          openSideSheetAndScrollToNode();
        }}
      >
        <FabricPreview
          schema={schema}
          showPlaceholder={!fullscreenPanelVisible}
        />
      </div>
    </div>
  );
};
