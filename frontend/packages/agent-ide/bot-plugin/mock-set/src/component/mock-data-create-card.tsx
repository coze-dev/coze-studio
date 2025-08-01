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

/* eslint-disable @coze-arch/max-line-per-function */
import { useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import {
  type PluginMockSetCommonParams,
  type PluginMockDataGenerateMode,
} from '@coze-arch/bot-tea';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import {
  Space,
  Toast,
  UIButton,
  UIModal,
  Typography,
  Divider,
} from '@coze-arch/bot-semi';
import { SpaceType } from '@coze-arch/bot-api/playground_api';
import { type mockset, type infra } from '@coze-arch/bot-api/debugger_api';
import {
  calcStringSize,
  type MockDataInfo,
  MAX_SUBMIT_LENGTH,
  getEnvironment,
} from '@coze-studio/mockset-shared';
import {
  MocksetEditor,
  type EditorAreaActions,
} from '@coze-studio/mockset-editor-adapter';

import {
  PRE_DEFINED_NO_EMPTY_KEY,
  useTransSchema,
} from '../hook/use-trans-schema';
import { useSaveMockData } from '../hook/use-save-mock-data';

import s from './index.module.less';

export enum CreationMode {
  /** pop-up window */
  MODAL = 'modal',
  /** embed page */
  CARD = 'card',
}

interface MockDataCreateCardProps {
  mode: CreationMode;
  mockInfo?: MockDataInfo;
  // Effective when modal mode
  visible?: boolean;
  // Effective when modal mode
  onCancel?: () => void;
  onSuccess: (data?: mockset.MockRule[]) => void;
  bizCtx: infra.BizCtx;
  forceGenerate?: {
    mode: PluginMockDataGenerateMode;
    count: number;
  };
}

/** Create or edit mock data -  */
export function MockDataCreateCard({
  mode,
  mockInfo,
  visible,
  onCancel,
  onSuccess,
  bizCtx,
  forceGenerate,
}: MockDataCreateCardProps) {
  const { schema } = mockInfo || {};
  const editorsRef = useRef<EditorAreaActions>(null);
  const [disableSubmit, setDisableSubmit] = useState(false);
  const [disableSubmitWhenGenerating, setDisableSubmitWhenGenerating] =
    useState(false);

  const { testValueValid, formattedResultExample: initialExample } =
    useTransSchema(schema);
  const { mock_set_id, tool_id } = useParams<DynamicParams>();

  // Space information
  const spaceType = useSpaceStore(store => store.space.space_type);
  const isPersonal = spaceType === SpaceType.Personal;

  const basicParams: PluginMockSetCommonParams = {
    environment: getEnvironment(),
    workspace_id: bizCtx.bizSpaceID || '',
    workspace_type: isPersonal ? 'personal_workspace' : 'team_workspace',
    tool_id: tool_id || '',
    mock_set_id: mock_set_id || '',
  };

  const { save, loading } = useSaveMockData({
    mockSetId: mock_set_id,
    basicParams,
    bizCtx,
    onSuccess,
  });

  const confirmHandler = () => {
    const values = editorsRef.current?.getValue();
    if (!values) {
      return;
    }

    for (const value of values) {
      if (!value) {
        Toast.error('no data');
        return;
      }

      if (calcStringSize(value) > MAX_SUBMIT_LENGTH) {
        Toast.error({
          content: I18n.t('mockset_toast_data_size_limit'),
          showClose: false,
        });
        return;
      }

      if (!testValueValid(value)) {
        Toast.error({
          content: I18n.t('mockdata_field_empty', {
            fieldName: PRE_DEFINED_NO_EMPTY_KEY,
          }),
          showClose: false,
        });
        return;
      }
    }

    const mockDataId = String(mockInfo?.mock?.id || 0);

    save(values, mockDataId);
  };

  const validateHandler = (isValid: boolean[]) => {
    setDisableSubmit(isValid.some(v => !v));
  };

  useEffect(() => {
    // @ts-expect-error -- linter-disable-autofix
    const unloadHandler = e => {
      const info = I18n.t('mockset_tip_data_will_lose');
      e.preventDefault();
      e.returnValue = info;
      return info;
    };

    if (
      (mode === CreationMode.MODAL && visible) ||
      mode === CreationMode.CARD
    ) {
      window.addEventListener('beforeunload', unloadHandler);
    }

    return () => {
      window.removeEventListener('beforeunload', unloadHandler);
    };
  }, [mode, visible]);

  useEffect(() => {
    if (forceGenerate) {
      editorsRef.current?.forceStartGenerate?.(
        forceGenerate.mode,
        forceGenerate.count,
      );
    }
  }, []);

  return mode === CreationMode.MODAL ? (
    <UIModal
      visible={visible}
      title={
        mockInfo?.mock ? I18n.t('edit_mock_data') : I18n.t('add_mock_data')
      }
      className={s['mock-creation-modal']}
      keepDOM={false}
      footer={
        <>
          <span className="mr-[8px]">{I18n.t('mockset_save_description')}</span>
          <Divider layout="vertical" margin="0px" />
          <UIButton type={'tertiary'} key="Cancel" onClick={onCancel}>
            {I18n.t('cancel')}
          </UIButton>
          <UIButton
            type={'primary'}
            theme={'solid'}
            key="Confirm"
            onClick={confirmHandler}
            loading={loading}
            disabled={disableSubmit || disableSubmitWhenGenerating}
          >
            {I18n.t('confirm')}
          </UIButton>
        </>
      }
      width={1000}
      maskClosable={false}
      onCancel={onCancel}
    >
      <MocksetEditor
        className={s['mock-creation-modal-editor']}
        mockInfo={{
          mergedResultExample: initialExample,
          ...mockInfo,
        }}
        readOnly={false}
        ref={editorsRef}
        onValidate={validateHandler}
        environment={{
          spaceId: bizCtx.bizSpaceID,
          mockSetId: mock_set_id,
          basicParams,
        }}
        isCreateScene={!mockInfo?.mock}
        onGenerationStatusChange={isGenerating =>
          setDisableSubmitWhenGenerating(isGenerating)
        }
      />
    </UIModal>
  ) : (
    <div className={s['mock-creation-card']}>
      <div className={s['mock-creation-card-editor']}>
        <MocksetEditor
          mockInfo={{
            mergedResultExample: initialExample,
            ...mockInfo,
          }}
          ref={editorsRef}
          onValidate={validateHandler}
          environment={{
            spaceId: bizCtx.bizSpaceID,
            mockSetId: mock_set_id,
            basicParams,
          }}
          isCreateScene={!mockInfo?.mock}
          onGenerationStatusChange={isGenerating =>
            setDisableSubmitWhenGenerating(isGenerating)
          }
        />
      </div>
      <div className={s['mock-creation-card-operation']}>
        <Space>
          <Typography.Text>
            {I18n.t('mockset_save_description')}
          </Typography.Text>
          <Divider layout="vertical" margin="0px" />
          <UIButton
            type={'primary'}
            theme={'solid'}
            onClick={confirmHandler}
            loading={loading}
            disabled={disableSubmit || disableSubmitWhenGenerating}
          >
            {I18n.t('mockset_save')}
          </UIButton>
        </Space>
      </div>
    </div>
  );
}
