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

/* eslint-disable @coze-arch/no-deep-relative-import */
import { type FC, useEffect, useMemo, useRef, useState } from 'react';

import { useUnmount } from 'ahooks';
import { OperateType } from '@coze-workflow/base/api';
import { Toast } from '@coze-arch/coze-design';
import { UIModal } from '@coze-arch/bot-semi';
import { I18n } from '@coze-arch/i18n';

import { useWorkflowReferences } from '../../../../hooks/use-workflow-references';
import { useGlobalState } from '../../../../hooks';
import { DiffModal } from './components/diff-modal';

import styles from './index.module.less';

interface DiffConfirmModalProps {
  visible: boolean;
  operateType: OperateType;
  /** commit function */
  submitHandle: (val: { desc: string }) => Promise<boolean>;
  /** Pop-up successful */
  onOk?: () => void;
  /** pop-up cancellation */
  onCancel?: () => void;
}

const DiffConfirmModal: FC<DiffConfirmModalProps> = ({
  visible,
  operateType,
  submitHandle,
  onOk,
  onCancel,
}) => {
  const { spaceId, workflowId, isDevSpace } = useGlobalState();
  const { refetchReferences } = useWorkflowReferences();
  const okParam = useRef({ desc: '' });
  const [desc, setDesc] = useState('');
  const [referenceNum, setReferenceNum] = useState(0);

  const okText =
    operateType === OperateType.SubmitOperate
      ? I18n.t('workflow_publish_multibranch_submit_btn')
      : I18n.t('workflow_publish_multibranch_publish_btn');

  const title =
    operateType === OperateType.SubmitOperate
      ? I18n.t('workflow_publish_multibranch_submit_comfirm')
      : I18n.t('workflow_publish_multibranch_publish_comfirm_title');

  useEffect(() => {
    (async () => {
      if (operateType === OperateType.PublishOperate) {
        const { data } = await refetchReferences();
        setReferenceNum(data?.workflowList.length || 0);
      }
    })();
  }, [operateType]);

  return (
    <UIModal
      visible={visible}
      onOk={async () => {
        // form validation
        if (okParam.current.desc.length > 500) {
          Toast.error(I18n.t('bwc_version_description_exceeds_word_limit'));
          return;
        }

        const result = await submitHandle({ desc });

        if (result) {
          onOk?.();
        }
      }}
      title={title}
      okText={okText}
      maskClosable={false}
      onCancel={() => {
        onCancel?.();
      }}
      className={styles['diff-modal']}
      icon={null}
      okButtonProps={{
        disabled: false,
      }}
    >
      <DiffModal
        spaceId={spaceId}
        workflowId={workflowId}
        operateType={operateType}
        referenceNum={referenceNum}
        onDescChange={val => {
          okParam.current.desc = val;
          setDesc(val);
        }}
        needDesc={isDevSpace}
      />
    </UIModal>
  );
};

export const useDiffConfirm = ({
  submitHandle,
  operateType,
}: Pick<DiffConfirmModalProps, 'operateType' | 'submitHandle'>) => {
  const [visible, setVisible] = useState(false);
  const targetFuc = useRef<(value: boolean) => void>();
  const modal = useMemo(
    () => (
      <DiffConfirmModal
        visible
        operateType={operateType}
        submitHandle={submitHandle}
        onCancel={() => {
          setVisible(false);
          targetFuc.current?.(false);
        }}
        onOk={() => {
          setVisible(false);
          targetFuc.current?.(true);
        }}
      />
    ),
    [operateType, submitHandle, targetFuc],
  );

  useEffect(() => {
    if (!visible) {
      targetFuc.current = undefined;
    }
  }, [visible]);

  useUnmount(() => {
    targetFuc.current = undefined;
  });

  return {
    modal: visible && modal,
    diffConfirm: () => {
      setVisible(true);
      return new Promise<boolean>(resolve => {
        targetFuc.current = resolve;
      });
    },
  };
};
