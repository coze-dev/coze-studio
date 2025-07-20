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
 
import React from 'react';

import classNames from 'classnames';
import { type Model } from '@coze-arch/bot-api/developer_api';
import {
  ModelSelect,
  type ModelSelectProps,
} from '@coze-agent-ide/model-manager/model-select-v2';

import { useGlobalState } from '@/hooks';

import styles from './model-select-v2.module.less';

export interface ModelSelectV2Props
  extends Pick<ModelSelectProps, 'triggerRender' | 'popoverPosition'> {
  className?: string;
  value: number | undefined;
  onChange: (value: number) => void;
  models: Model[];
  readonly?: boolean;
}

export const ModelSelectV2: React.FC<ModelSelectV2Props> = ({
  className,
  value,
  onChange,
  models,
  readonly,
  popoverPosition,
  triggerRender,
}) => {
  const { spaceId, projectId, isBindDouyin } = useGlobalState();
  return (
    <ModelSelect
      // The community version does not currently support to view model detail, for future expansion
      enableJumpDetail={isBindDouyin || IS_OPEN_SOURCE ? false : { spaceId }}
      className={classNames(styles.select, className)}
      popoverClassName={classNames(
        styles['selector-popover'],
        styles[`selector-popover-${projectId ? 'project' : 'library'}`],
      )}
      popoverPosition={popoverPosition || 'bottomRight'}
      disabled={readonly}
      selectedModelId={value ? `${value}` : ''}
      modelList={models}
      clickToHide
      onModelChange={(model: Model) => {
        if (model.model_type) {
          onChange(Number(model.model_type));
        }
      }}
      triggerRender={triggerRender}
    />
  );
};
