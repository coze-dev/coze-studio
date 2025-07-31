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

import React, { useEffect, useRef, useState } from 'react';

import classNames from 'classnames';
import { PUBLIC_SPACE_ID, workflowApi } from '@coze-workflow/base';
import { type Workflow } from '@coze-arch/idl/workflow_api';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';
import { Image } from '@coze-arch/bot-semi';
import {
  type WorkflowJSON,
  useService,
} from '@flowgram-adapter/free-layout-editor';

import { WorkflowRunService, WorkflowSaveService } from '@/services';
import { useTemplateService } from '@/hooks/use-template-service';
import { useFloatLayoutService } from '@/hooks/use-float-layout-service';

import { Text } from '../../form-extensions/components/text';

import styles from './index.module.less';

export const TemplateCard = ({
  workflowTemplate,
  cardIndex,
  onBlur,
  onFocus,
  isDragActive,
  isMove,
}: {
  workflowTemplate: Workflow;
  cardIndex: number;
  onBlur: () => void;
  onFocus: (data: Workflow) => void;
  isDragActive?: boolean;
  isMove?: boolean;
}) => {
  const cardRef = useRef(null);
  const [show, setShow] = useState(false);

  const templateState = useTemplateService();
  const floatLayoutService = useFloatLayoutService();

  const saveService = useService<WorkflowSaveService>(WorkflowSaveService);
  const runService = useService<WorkflowRunService>(WorkflowRunService);

  useEffect(() => {
    setTimeout(() => {
      setShow(true);
    }, cardIndex * 100);
  }, [cardIndex, setShow]);

  const handleClick = async () => {
    if (isDragActive || isMove) {
      return;
    }
    try {
      let schemaJson = workflowTemplate?.schema_json;
      if (!schemaJson) {
        // Ask for schema_json
        const res = await workflowApi.GetCanvasInfo({
          space_id: workflowTemplate.space_id ?? PUBLIC_SPACE_ID,
          workflow_id: workflowTemplate.workflow_id,
        });
        schemaJson = res?.data?.workflow?.schema_json;
      }

      await saveService.reloadDocument({
        customWorkflowJson: JSON.parse(schemaJson ?? '{}') as WorkflowJSON,
      });
      saveService.highPrioritySave();
      Toast.success(I18n.t('workflow_example_succeed'));
      // The result of closing a practice run first
      runService.clearTestRun();
      templateState.closeTemplate();
      // Process template closing animation for 200 ms, close bottom panel after animation
      setTimeout(() => {
        floatLayoutService.close('bottom');
      }, 300);
    } catch (e) {
      Toast.error(I18n.t('copy_failed'));
    } finally {
      templateState.closePreview();
    }
  };

  return (
    <div
      ref={cardRef}
      className={classNames(
        'flex flex-col gap-[4px] min-w-[240px] max-w-[240px] max-h-[108px] bg-white p-[8px]',
        styles['template-card'],
        'select-none',
        isDragActive ? 'cursor-grabbing' : 'cursor-pointer',
        { [styles['slide-up']]: show },
      )}
      onMouseEnter={() => onFocus(workflowTemplate)}
      onMouseLeave={onBlur}
      tabIndex={cardIndex}
      onClick={handleClick}
    >
      <div className="flex gap-[4px] h-[24px]">
        <div>
          <Image
            height={'24px'}
            width={'24px'}
            preview={false}
            src={workflowTemplate?.url ?? ''}
            className={styles['card-header']}
          />
        </div>
        <Text
          className="text-[16px] font-medium leading-[22px]"
          text={workflowTemplate?.name ?? ''}
        />
      </div>
      <Text
        className="text-[#0607094D] text-[12px] leading-[16px] font-normal"
        text={workflowTemplate?.desc ?? ''}
        rows={3}
      />
    </div>
  );
};
